-- 적용 완료: 2026-07-24 (Supabase MCP 경유). 이 파일은 이력 기록용이다.
--
-- 목적
--  1) api_keys.key 컬럼 직접 쓰기를 차단해 issue_api_key/rotate_api_key RPC 를 유일한 경로로 만든다
--  2) RLS 정책의 auth.<fn>() 재평가(initplan) 제거 + 역할 한정

-- 1) api_keys 쓰기 권한 축소
revoke insert, update on public.api_keys from anon, authenticated;
revoke select on public.api_keys from anon;

grant update (name, is_active) on public.api_keys to authenticated;
grant select on public.api_keys to authenticated;

drop policy if exists api_keys_insert_own on public.api_keys;

-- 2) RLS initplan 최적화 + 역할 한정
drop policy if exists api_keys_select_own on public.api_keys;
create policy api_keys_select_own on public.api_keys
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists api_keys_update_own on public.api_keys;
create policy api_keys_update_own on public.api_keys
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists api_keys_delete_own on public.api_keys;
create policy api_keys_delete_own on public.api_keys
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists custom_holidays_select_own on public.custom_holidays;
create policy custom_holidays_select_own on public.custom_holidays
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists custom_holidays_insert_own on public.custom_holidays;
create policy custom_holidays_insert_own on public.custom_holidays
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists custom_holidays_update_own on public.custom_holidays;
create policy custom_holidays_update_own on public.custom_holidays
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists custom_holidays_delete_own on public.custom_holidays;
create policy custom_holidays_delete_own on public.custom_holidays
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists public_holidays_select_authenticated on public.public_holidays;
create policy public_holidays_select_authenticated on public.public_holidays
  for select to authenticated using (true);

drop policy if exists "Users can view own usage" on public.api_usage_daily;
create policy "Users can view own usage" on public.api_usage_daily
  for select to authenticated
  using (api_key_id in (select id from public.api_keys where user_id = (select auth.uid())));

drop policy if exists "Users can view own monthly usage" on public.api_usage;
create policy "Users can view own monthly usage" on public.api_usage
  for select to authenticated
  using (api_key_id in (select id from public.api_keys where user_id = (select auth.uid())));

drop policy if exists "Users can read own customer data" on public.customers;
create policy "Users can read own customer data" on public.customers
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own subscriptions" on public.subscriptions;
create policy "Users can read own subscriptions" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists calendar_tokens_select on public.calendar_tokens;
create policy calendar_tokens_select on public.calendar_tokens
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists calendar_tokens_insert on public.calendar_tokens;
create policy calendar_tokens_insert on public.calendar_tokens
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists calendar_tokens_update on public.calendar_tokens;
create policy calendar_tokens_update on public.calendar_tokens
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists calendar_tokens_delete on public.calendar_tokens;
create policy calendar_tokens_delete on public.calendar_tokens
  for delete to authenticated using ((select auth.uid()) = user_id);
