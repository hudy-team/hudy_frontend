-- 적용 완료: 2026-07-24 (Supabase MCP 경유). 이 파일은 이력 기록용이다.
--
-- 목적: 캘린더 구독 토큰도 서버가 생성하게 한다.
--
-- 기존 구조에서는 클라이언트(lib/calendar.ts)가 token 값을 생성해 직접 INSERT 했다.
-- calendar_tokens.token 에는 UNIQUE 제약이 있으므로, 피해자가 토큰을 회전한 직후
-- 공격자가 그 옛 토큰 문자열을 자기 계정으로 선점하면, 해당 구독 URL 을 등록해 둔
-- 캘린더 앱들이 공격자의 공휴일 데이터를 받게 된다.
-- api_keys 에 적용한 것과 동일한 원칙(시크릿은 서버가 생성)을 적용한다.

create or replace function public.issue_calendar_token(p_include_custom boolean default true)
returns table (id uuid, token text, include_custom boolean)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
  new_token text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  delete from public.calendar_tokens t where t.user_id = uid;

  -- varchar(64) 에 맞춘 32바이트 hex
  new_token := encode(extensions.gen_random_bytes(32), 'hex');

  return query
  insert into public.calendar_tokens (user_id, token, include_custom)
  values (uid, new_token, coalesce(p_include_custom, true))
  returning calendar_tokens.id,
            calendar_tokens.token::text,
            calendar_tokens.include_custom;
end;
$function$;

revoke execute on function public.issue_calendar_token(boolean) from public, anon;
grant execute on function public.issue_calendar_token(boolean) to authenticated;

create or replace function public.rotate_calendar_token()
returns text
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
  new_token text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  update public.calendar_tokens
  set token = encode(extensions.gen_random_bytes(32), 'hex'),
      updated_at = now()
  where user_id = uid
  returning token into new_token;

  if new_token is null then
    raise exception 'calendar token not found';
  end if;

  return new_token;
end;
$function$;

revoke execute on function public.rotate_calendar_token() from public, anon;
grant execute on function public.rotate_calendar_token() to authenticated;

-- 클라이언트의 token 컬럼 직접 쓰기 차단. include_custom 토글만 남긴다.
revoke insert, update on public.calendar_tokens from anon, authenticated;
revoke select on public.calendar_tokens from anon;
grant select on public.calendar_tokens to authenticated;
grant update (include_custom, updated_at) on public.calendar_tokens to authenticated;

drop policy if exists calendar_tokens_insert on public.calendar_tokens;
