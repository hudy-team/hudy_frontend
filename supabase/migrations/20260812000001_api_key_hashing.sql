-- 적용 완료: 2026-08-12 (Supabase MCP 경유). 이 파일은 이력 기록용이다.
--
-- 목적
--  API 키 평문 저장 폐지. api_keys 에 key_hash(sha256 hex) / key_prefix 컬럼을 추가하고,
--  키를 만드는 세 경로(auto_create_api_key 트리거, issue_api_key, rotate_api_key)가
--  해시와 prefix 를 함께 기록하도록 한다. 전체 키는 RPC 반환값으로 1회만 노출된다.
--
--  평문 key 컬럼은 백필 및 클라이언트 전환(프론트에서 key 컬럼 SELECT 제거) 완료 후
--  후속 마이그레이션에서 드롭한다. 그때까지는 병행 기록한다.

-- 1) 컬럼 추가 + 백필 (이미 적용됨)
alter table public.api_keys add column if not exists key_hash varchar;
alter table public.api_keys add column if not exists key_prefix varchar;

update public.api_keys
set key_hash = encode(extensions.digest(key::bytea, 'sha256'), 'hex'),
    key_prefix = left(key, 12)
where key is not null and (key_hash is null or key_prefix is null);

create unique index if not exists uq_api_keys_key_hash on public.api_keys (key_hash);

-- 2) 신규 가입 시 기본 키 생성 트리거: 해시/prefix 병행 기록
create or replace function public.auto_create_api_key()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  generated_key text;
begin
  generated_key := 'hd_live_' || encode(extensions.gen_random_bytes(16), 'hex');

  insert into public.api_keys (user_id, key, key_hash, key_prefix, name, is_active)
  values (new.id, generated_key,
          encode(extensions.digest(generated_key::bytea, 'sha256'), 'hex'),
          left(generated_key, 12), 'Default', true);

  return new;
exception
  when unique_violation then
    generated_key := 'hd_live_' || encode(extensions.gen_random_bytes(16), 'hex');
    insert into public.api_keys (user_id, key, key_hash, key_prefix, name, is_active)
    values (new.id, generated_key,
            encode(extensions.digest(generated_key::bytea, 'sha256'), 'hex'),
            left(generated_key, 12), 'Default', true);
    return new;
end;
$function$;

-- 3) 발급 RPC: 해시/prefix 병행 기록, 전체 키는 반환값으로 1회만 노출
--    (returning 에서 api_keys.key 대신 지역변수 new_key 를 돌려주므로 key 컬럼 드롭 후에도 동작한다)
create or replace function public.issue_api_key(key_name text)
returns table (id uuid, key text, name text)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
  new_key text;
  trimmed text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  trimmed := btrim(coalesce(key_name, ''));
  if length(trimmed) = 0 or length(trimmed) > 100 then
    raise exception 'invalid key name';
  end if;

  delete from public.api_keys k where k.user_id = uid;

  new_key := 'hd_live_' || encode(extensions.gen_random_bytes(16), 'hex');

  return query
  insert into public.api_keys (user_id, key, key_hash, key_prefix, name, is_active)
  values (uid, new_key,
          encode(extensions.digest(new_key::bytea, 'sha256'), 'hex'),
          left(new_key, 12), trimmed, true)
  returning api_keys.id, new_key, api_keys.name::text;
end;
$function$;

revoke execute on function public.issue_api_key(text) from public, anon;
grant execute on function public.issue_api_key(text) to authenticated;

-- 4) 회전 RPC: 해시/prefix 갱신, 새 전체 키를 1회 반환
create or replace function public.rotate_api_key(p_key_id uuid)
returns text
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
  new_key text;
  updated_id uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  new_key := 'hd_live_' || encode(extensions.gen_random_bytes(16), 'hex');

  update public.api_keys
  set key = new_key,
      key_hash = encode(extensions.digest(new_key::bytea, 'sha256'), 'hex'),
      key_prefix = left(new_key, 12),
      updated_at = now()
  where id = p_key_id and user_id = uid
  returning id into updated_id;

  if updated_id is null then
    raise exception 'key not found';
  end if;

  return new_key;
end;
$function$;

revoke execute on function public.rotate_api_key(uuid) from public, anon;
grant execute on function public.rotate_api_key(uuid) to authenticated;

-- 5) 클라이언트 쓰기 권한은 20260724000002 와 동일하게 유지된다
--    (insert 불가, update 는 name/is_active 컬럼만). 신규 컬럼에 대한 update 권한은 부여하지 않는다.
