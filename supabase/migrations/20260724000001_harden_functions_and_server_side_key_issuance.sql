-- 적용 완료: 2026-07-24 (Supabase MCP 경유). 이 파일은 이력 기록용이다.
--
-- 목적
--  1) get_user_id_by_email 이 anon 에게 노출되어 이메일->user_id 오라클로 쓰일 수 있었다
--  2) 트리거 전용 함수들이 REST /rpc/ 로 직접 호출 가능했다
--  3) API 키를 클라이언트가 생성해 INSERT 하는 구조라 임의 키 삽입이 가능했다

-- 1) 이메일 오라클 차단: Paddle webhook(service_role) 전용
revoke execute on function public.get_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.get_user_id_by_email(text) to service_role;

-- 2) 트리거 함수 REST RPC 노출 차단
revoke execute on function public.auto_create_api_key() from public, anon, authenticated;
revoke execute on function public.notify_api_key_state_change() from public, anon, authenticated;
revoke execute on function public.notify_new_signup() from public, anon, authenticated;
revoke execute on function public.notify_new_subscription() from public, anon, authenticated;

-- 3) search_path 고정 (advisor: function_search_path_mutable)
alter function public.notify_new_signup() set search_path = '';
alter function public.notify_new_subscription() set search_path = '';

-- 4) auto_create_api_key: search_path 고정에 따라 gen_random_bytes 를 스키마 한정 호출로 변경
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

  insert into public.api_keys (user_id, key, name, is_active)
  values (new.id, generated_key, 'Default', true);

  return new;
exception
  when unique_violation then
    generated_key := 'hd_live_' || encode(extensions.gen_random_bytes(16), 'hex');
    insert into public.api_keys (user_id, key, name, is_active)
    values (new.id, generated_key, 'Default', true);
    return new;
end;
$function$;

-- 5) 서버측 키 발급 RPC (클라이언트가 키 값을 결정할 수 없게 한다)
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
  insert into public.api_keys (user_id, key, name, is_active)
  values (uid, new_key, trimmed, true)
  returning api_keys.id, api_keys.key::text, api_keys.name::text;
end;
$function$;

revoke execute on function public.issue_api_key(text) from public, anon;
grant execute on function public.issue_api_key(text) to authenticated;

-- 6) 서버측 키 회전 RPC (key 문자열만 교체, id/name 유지)
create or replace function public.rotate_api_key(p_key_id uuid)
returns text
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
  new_key text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  update public.api_keys
  set key = 'hd_live_' || encode(extensions.gen_random_bytes(16), 'hex'),
      updated_at = now()
  where id = p_key_id and user_id = uid
  returning key into new_key;

  if new_key is null then
    raise exception 'key not found';
  end if;

  return new_key;
end;
$function$;

revoke execute on function public.rotate_api_key(uuid) from public, anon;
grant execute on function public.rotate_api_key(uuid) to authenticated;
