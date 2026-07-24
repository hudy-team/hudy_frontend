# HuDy 대시보드 이슈 수정 작업 원장

> 단일 진실원본(single source of truth). 어떤 세션이 죽어도 이 문서 + git log 만으로 이어받는다.
> 작성: 2026-07-24 (아키텍트 세션). 실행 모델: Sonnet.

## 배경

프로덕션(hudy.co.kr) 대시보드 스크린샷에서 "일별 API 사용량" 차트가 카드 밖으로 넘치는 현상이 발견되어
전체 점검을 수행했다. Supabase MCP로 실 DB를 크로스체크한 결과 UI 결함 외에 **보안 결함 2건**이 확인됐다.

### DB에서 실측 확인된 사실 (2026-07-24)

| 항목 | 실측값 |
|---|---|
| `api_usage_daily` 데이터 범위 | 2026-02-14 ~ 2026-07-24, distinct date **118개**, 총 192콜 |
| 이번 달(7월) 사용량 | 18 (스크린샷 "18 / 100"과 일치) |
| RLS | 전 테이블 활성 + 정책 존재 (최초 우려는 오탐) |
| `api_keys` 컬럼 권한 (수정 전) | `authenticated`가 `key` 컬럼에 INSERT/UPDATE 보유 → **임의 키 삽입 가능** |
| `get_user_id_by_email` (수정 전) | `anon` 실행 가능 → **이메일→user_id 오라클** |
| 백엔드 quota 상수 | FREE=100, PRO=5000 (`api_key_auth.rs:12-13`) — 프론트 하드코딩과 일치 |

차트가 넘친 직접 원인: 쿼리에 기간 필터가 없어 118개 날짜를 전부 렌더 + `overflow` 미처리.
부수 효과로 2월 15일 대량 호출이 `maxCalls` 기준이 되어 최근 데이터가 전부 바닥에 깔림.

## 이미 완료된 작업 (아키텍트가 Supabase MCP로 직접 적용)

DDL은 실행 모델에게 위임하지 않는다. 아래는 **적용 및 검증 완료**.

- `migration: harden_functions_and_server_side_key_issuance`
  - `get_user_id_by_email` EXECUTE를 `service_role` 전용으로 회수 (이메일 오라클 차단)
  - 트리거 함수 4종(`auto_create_api_key`, `notify_*`)의 REST RPC 노출 회수
  - `notify_new_signup`/`notify_new_subscription` `search_path` 고정
  - `issue_api_key(text)` / `rotate_api_key(uuid)` SECURITY DEFINER RPC 신설 (서버측 키 생성)
- `migration: lock_api_key_column_writes_and_rls_initplan`
  - `api_keys`의 INSERT 권한/정책 제거, UPDATE는 `(name, is_active)` 컬럼만 허용
  - 전 테이블 RLS 정책을 `(select auth.uid())` + `to authenticated` 로 재작성 (initplan 최적화)
- `migration: fix_issue_api_key_return_types` (varchar→text 캐스팅 수정)

검증 결과 (authenticated 역할 시뮬레이션, 롤백 트랜잭션):

```
[1 INSERT_ARBITRARY_KEY = BLOCKED: permission denied for table api_keys]
[2 UPDATE_KEY_COL       = BLOCKED: permission denied for table api_keys]
[3 UPDATE_IS_ACTIVE     = ALLOWED ok]          <- 회귀 없음
[4 EMAIL_ORACLE         = BLOCKED]
[5 CROSS_USER_ROWS_VISIBLE = 0]
[6 OWN_ROWS_VISIBLE     = 1]
[rotate ok len=40 prefix=hd_live_] [rotate_foreign BLOCKED ok]
[issue ok name=Production len=40] [blank BLOCKED ok] [toolong BLOCKED ok]
```

프로덕션 데이터 무결성 확인: `api_keys` 4행 / 4유저 유지, 테스트 잔여물 0.

> **중요**: DB는 이미 잠겼다. 따라서 FE-2(프론트 RPC 전환)를 배포하기 전까지
> **현재 프로덕션의 API 키 생성/재생성 UI는 동작하지 않는다.** FE-2가 최우선 태스크다.

## 골 정의 (DoD 게이트)

- [ ] G1. 대시보드 차트가 모바일 폭(375px)에서 카드 경계를 넘지 않는다
- [ ] G2. 차트가 최근 30일만 표시하고, 스케일이 최근 데이터를 판독 가능하게 보여준다
- [ ] G3. API 키 생성/재생성이 서버측 RPC를 통해서만 이루어진다 (클라이언트가 키 값을 결정하지 않는다)
- [ ] G4. 월 사용량 집계가 KST 기준으로 계산된다 (백엔드 쿼터 판정과 월 경계 일치)
- [ ] G5. `pnpm build` 성공
- [ ] G6. 문서(CLAUDE.md)가 실제 구현 상태를 반영한다

## 태스크

파일 겹침이 없도록 분할했다. FE-1 / FE-2 / FE-3 은 서로 다른 파일만 만지므로 병렬 실행 가능.

- [ ] **FE-1** — `app/dashboard/page.tsx` 전면 수정 + `lib/date.ts`·`lib/plan.ts` 신설
      (차트 30일 필터 / overflow / 스케일, 월 사용량 KST, 쿼터 상수 분리, 테이블 정리)
      지시서: `docs/work-orders/FE-1.md`
- [ ] **FE-2** — `app/dashboard/api-keys/page.tsx` 를 `issue_api_key`/`rotate_api_key` RPC 호출로 전환
      지시서: `docs/work-orders/FE-2.md`  **[최우선 — 배포 전까지 키 발급 UI 장애]**
- [ ] **FE-3** — `CLAUDE.md` 갱신 + 적용된 DB 마이그레이션을 `supabase/migrations/` 에 기록
      지시서: `docs/work-orders/FE-3.md`
- [ ] **BE-1** — (별도 repo `hudy_backend`) UTC→KST 전환. 지시서: `hudy_backend/docs/work-orders/BE-1.md`

## 루프 프로토콜

1. 매 반복마다 이 문서를 먼저 읽는다. 미완료(`[ ]`) 태스크 중 위에서부터 하나를 고른다.
2. 해당 `docs/work-orders/<ID>.md` 를 읽고 **그대로** 구현한다. 지시서에 없는 설계 판단을 임의로 하지 않는다.
3. 지시서가 없거나 지시서로 판단이 안 서면 태스크에 `BLOCKED: <사유>` 를 적고 다음 태스크로 넘어간다.
4. 지시서의 "수용 기준" 검증 명령을 **실제로 실행**하고 통과했을 때만 체크박스를 채운다. 자기 승인 금지.
5. 태스크 1개 = 커밋 1개. 커밋 메시지는 `fix: <한국어 요약>` 또는 `refactor: <한국어 요약>`.
6. 진행 로그에 한 줄 추가한다.

## 코드 밖 부수 작업 체크리스트 (지시서 스코프 누락 방어)

실행 모델은 지시서에 없는 일을 하지 않으므로, 아래는 아키텍트가 매 태스크에서 점검한다.

- [ ] 새 환경변수 추가 여부 → 없음 (이번 작업 범위에 env 변경 없음)
- [ ] DB 마이그레이션 → 아키텍트가 MCP로 적용 완료, FE-3에서 repo 기록만
- [ ] 배포 순서 의존성 → **DB(적용됨) → FE-2 → 나머지**. FE-2 미배포 상태가 길어지면 키 발급 장애 지속
- [ ] 백엔드 재빌드 필요 여부 → BE-1은 Rust 재빌드/재배포 필요

## 결정 로그

- **D1**: 키 생성을 Edge Function이 아닌 **Postgres SECURITY DEFINER RPC**로 구현. 이유: Edge Function이 이 프로젝트에 하나도 없어(=배포 파이프라인 부재) 신규 인프라 도입 비용이 크고, 키 생성은 순수 DB 연산이라 RPC로 충분하다.
- **D2**: `issue_api_key` 는 기존 키를 **삭제 후 재발급**하는 기존 UX(1유저 1키)를 그대로 유지한다. 정책 변경은 이번 범위 밖.
- **D3**: 차트 기간을 30일로 고정한다. 기간 선택 UI는 범위 밖(별도 기능).
- **D4**: 타임존 기준을 **KST(UTC+9) 고정**으로 통일한다. 한국 공휴일 API 서비스이므로 사용자 로컬 타임존이 아니라 KST가 도메인 기준이다.
- **D5**: `webhook_events` 의 "RLS 활성 + 정책 없음" 은 **의도된 상태**로 판단해 유지한다 (service_role 전용 테이블). advisor INFO는 무시.

## 미결 / 사용자 결정 필요

- `pg_net` 확장이 `public` 스키마에 설치됨 (advisor WARN). 이동 시 `notify_*` 트리거 함수의 `net.http_post` 참조가 깨질 수 있어 **보류**. 별도 작업으로 분리 권장.
- Supabase Auth의 "Leaked password protection" 비활성 (advisor WARN). 대시보드 토글이라 코드 변경 불가 — 사용자가 직접 켜야 한다.

## 진행 로그

- 2026-07-24: 아키텍트 세션. Supabase 크로스체크 완료, DB 하드닝 3개 마이그레이션 적용·검증. 원장 및 지시서 4건 작성.
