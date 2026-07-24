# FE-3 — DB 마이그레이션 repo 기록 + 문서 갱신

담당 파일 (아래 외에는 **어떤 파일도 수정 금지**):

- 신규 `supabase/migrations/20260724000001_harden_functions_and_server_side_key_issuance.sql`
- 신규 `supabase/migrations/20260724000002_lock_api_key_column_writes_and_rls_initplan.sql`
- 수정 `CLAUDE.md`

## 배경

2026-07-24에 Supabase MCP로 DB 하드닝 마이그레이션을 **프로덕션에 직접 적용**했다.
적용은 끝났지만 repo에 SQL 원본이 없어 이력이 코드와 함께 움직이지 않는다.
이 태스크는 이미 적용된 DDL을 repo에 **기록**한다.

> **이 태스크는 DB를 변경하지 않는다.** SQL 파일을 만들어 커밋할 뿐이다.
> Supabase CLI(`supabase db push` 등)를 실행하지 말 것. 이미 적용된 내용이라
> 재실행은 불필요하고, 프로덕션에 예상치 못한 영향을 줄 수 있다.

## 1. 신규 `supabase/migrations/20260724000001_harden_functions_and_server_side_key_issuance.sql`

`supabase/migrations/` 디렉토리가 없으면 만든다. 아래 내용을 그대로 저장한다.

```sql
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
```

## 2. 신규 `supabase/migrations/20260724000002_lock_api_key_column_writes_and_rls_initplan.sql`

```sql
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
```

## 3. 수정 `CLAUDE.md`

### 3-1. 사실과 다른 서술 교체

**Before** ("Key Notes" 섹션):

```markdown
- 현재 **백엔드 미연동** 상태 — 대시보드 데이터는 모두 목업/로컬 state
```

**After**:

```markdown
- **Supabase 연동 완료** — 대시보드는 `api_keys` / `api_usage_daily` / `subscriptions` 를 직접 조회한다 (목업 아님)
- **API 키 발급은 서버측 RPC 전용** — `issue_api_key(key_name)` / `rotate_api_key(p_key_id)`.
  `api_keys` 테이블에 대한 클라이언트 INSERT 권한은 없고 UPDATE 는 `name`/`is_active` 컬럼만 허용된다
- **타임존은 KST(UTC+9) 고정** — 날짜 계산에는 `lib/date.ts` 의 헬퍼를 쓴다. `new Date().getMonth()` 같은
  로컬 타임존 의존 코드를 쓰지 말 것
- **플랜 쿼터는 `lib/plan.ts`** — 백엔드 `hudy_backend/src/middleware/api_key_auth.rs` 상수와 동기화 필요
```

### 3-2. 아키텍처 섹션에 데이터 계층 추가

"### 유틸리티 및 훅" 섹션의 기존 목록 **아래에** 다음 항목을 추가한다.

```markdown
- `lib/supabase/client.ts` — 브라우저 Supabase 클라이언트 (anon 키)
- `lib/date.ts` — KST 기준 날짜 헬퍼 (`kstDateString`, `kstMonthPrefix`, `kstDaysAgoString`)
- `lib/plan.ts` — 플랜별 월 쿼터 및 대시보드 표시 상수
```

그리고 같은 섹션 아래에 새 소제목을 추가한다.

```markdown
### 데이터베이스

Supabase PostgreSQL. 스키마 원본은 코어 API 서버 repo(`hudy_backend/migrations/`)에 있고,
프론트에서 적용한 보안/RLS 관련 마이그레이션만 `supabase/migrations/` 에 기록한다.

전 테이블 RLS 활성. 정책은 `(select auth.uid()) = user_id` 형태이며 `authenticated` 역할에 한정된다.
```

## 금지 사항

- `app/**` 아래 어떤 파일도 수정하지 말 것 (FE-1 / FE-2 담당).
- `lib/date.ts`, `lib/plan.ts` 를 만들지 말 것 — FE-1이 만든다. `CLAUDE.md` 에서 언급만 한다.
- Supabase CLI 명령(`supabase db push`, `supabase migration up` 등)을 실행하지 말 것.
- `supabase/config.toml` 을 만들지 말 것. 이 repo는 Supabase CLI 프로젝트가 아니다.
- 마이그레이션 SQL 내용을 "개선"하지 말 것. 프로덕션에 적용된 것과 **바이트 단위로 일치**해야 이력으로서 의미가 있다.

## 수용 기준

```bash
cd /Users/minkyu/Documents/hudy/hudy_frontend

# 1. 마이그레이션 파일 2개 존재
ls supabase/migrations/

# 2. 핵심 구문이 담겼는지
grep -l 'issue_api_key' supabase/migrations/*.sql          # 1건
grep -l 'revoke insert, update on public.api_keys' supabase/migrations/*.sql  # 1건

# 3. 사실과 다른 서술이 사라졌는지
grep -n '백엔드 미연동\|목업/로컬 state' CLAUDE.md
# → 출력이 없어야 한다.

# 4. 갱신된 서술이 들어갔는지
grep -c 'issue_api_key\|KST\|lib/plan.ts' CLAUDE.md        # 3 이상

# 5. app/ 을 건드리지 않았는지 (금지사항 자체 검증)
git status --porcelain app/ | wc -l                        # 0 이어야 함
```

## 커밋

```bash
git add supabase/migrations/ CLAUDE.md
git commit -m "docs: DB 하드닝 마이그레이션 기록 및 CLAUDE.md 실제 구현 상태 반영"
```

커밋 후 `WORKPLAN.md` 의 FE-3 체크박스를 `[x]` 로 바꾸고 진행 로그에 한 줄 추가한 뒤 함께 커밋한다.
