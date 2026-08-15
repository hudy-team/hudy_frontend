# HuDy 공개 공휴일 페이지 작업 원장

> 단일 진실원본(single source of truth). 어떤 세션이 죽어도 이 문서 + git log 만으로 이어받는다.
> 작성: 2026-08-15 (아키텍트 세션). 실행 모델: Sonnet. 브랜치: `feat/public-holiday-pages` (worktree `hudy_frontend-loop`).
> 이전 원장(대시보드 이슈, 완료)은 `docs/WORKPLAN-2026-07-dashboard.md` 로 아카이브.

## 배경 / 목적

로그인 없이 볼 수 있는 공휴일 콘텐츠 페이지가 없어 검색 유입이 랜딩에서 끝난다.
`/holidays/[year]` 공개 페이지를 만들어 "2026년 공휴일" 류 검색 트래픽을 받고,
페이지 안의 영업일 계산기(제품 데모)와 API CTA 로 가입 퍼널을 만든다.

### 아키텍트가 실측 확인한 사실 (2026-08-15)

- DB `public_holidays`: 2025년 20건 / 2026년 21건 / 2027년 21건 존재 (Supabase MCP 실측)
- 테이블 컬럼: `id, name(varchar), date(date), year(int), month(int), day(int), day_of_week(varchar), created_at, updated_at`
- RLS 는 authenticated 한정이므로 **공개 페이지는 서버 컴포넌트에서 `createAdminClient()`(`lib/supabase/admin.ts`) 로 조회**한다. anon 키로는 못 읽는다.
- 인증 미들웨어(`proxy.ts` matcher)는 `/dashboard`, `/checkout` 만 가드 → `/holidays` 는 추가 작업 없이 공개다.
- 디자인 목업(아키텍트 확정)은 각 지시서의 "레이아웃 명세" 절에 텍스트로 옮겨 두었다. 기존 다크 테마·primary(빨강)·JetBrains Mono 토큰을 그대로 쓴다.

## 골 게이트 (전부 검증되어야 완료)

- [ ] G1. `/holidays/2026` 이 로그인 없이 정적 렌더되고 DB 실데이터(공휴일 이름·날짜)가 표시된다. 2025·2027 도 동일.
- [ ] G2. `/holidays` 접속 시 KST 기준 현재 연도 페이지로 redirect 된다.
- [ ] G3. 영업일 계산기 로직이 검증 스크립트(`scripts/verify-business-days.ts`)의 전 케이스를 통과한다 (KST·대체공휴일 포함).
- [ ] G4. 연도별 `generateMetadata`(title/description) + JSON-LD + `sitemap.ts` 에 연도 페이지 포함.
- [ ] G5. 랜딩 navbar·footer 에서 공개 페이지로 진입 가능하고, 페이지 안에 API 가입 CTA 가 있다.
- [ ] G6. `pnpm build` 성공 (기존 페이지 영향 없음). lint 게이트는 D5 로 제거.
- [ ] G7. `CLAUDE.md` 라우팅/주의사항이 실제 구현 상태를 반영한다.

**골에서 제외 (사용자 액션)**: PR 생성·머지, 프로덕션 배포, Search Console 등록.

## 태스크

- [x] **PH-1** — 데이터 레이어 `lib/holidays.ts` (지시서: `docs/work-orders/PH-1.md`)
- [x] **PH-2** — 영업일 계산 로직 `lib/business-day.ts` + 검증 스크립트 (지시서: `docs/work-orders/PH-2.md`)
- [x] **PH-3** — `/holidays/[year]` 페이지 + `/holidays` redirect (지시서: `docs/work-orders/PH-3.md`)
- [x] **PH-4** — 영업일 계산기 클라이언트 컴포넌트 (지시서: `docs/work-orders/PH-4.md`)
- [x] **PH-5** — SEO: metadata·JSON-LD·sitemap (지시서: `docs/work-orders/PH-5.md`)
- [ ] **PH-6** — navbar/footer 링크 + CLAUDE.md 갱신 + 전체 게이트 재검증 (지시서: `docs/work-orders/PH-6.md`) — PH-3 블로커 해소됨. PH-3 체크 후 착수.

## 루프 프로토콜

1. 매 반복마다 이 문서를 먼저 읽는다. 미완료(`[ ]`) 태스크 중 위에서부터 하나를 고른다.
2. `docs/work-orders/<ID>.md` 지시서를 읽고 그대로 구현한다. 지시서에 없는 설계 판단 금지.
3. 지시서가 없거나 3회 실패하면 해당 태스크에 `BLOCKED: 사유` 를 적고 다음으로 넘어간다.
4. 지시서의 수용 기준 검증 명령을 **실제 실행해 통과했을 때만** 체크박스를 `[x]` 로 바꾼다. 자기 승인 금지.
5. 태스크 1개 = 커밋 1개. 체크박스·진행 로그 갱신을 같은 커밋에 포함한다. main 직접 커밋 금지 (이 worktree 는 `feat/public-holiday-pages`).
6. 골 게이트는 태스크가 전부 끝난 뒤 PH-6 에서 일괄 재검증하고 체크한다.

### 상시 규칙 (모든 태스크 공통)

- 타임존은 KST 고정. `new Date()` 의 로컬 타임존에 의존하는 날짜 계산 금지 — `lib/date.ts` 헬퍼를 쓴다.
- `createAdminClient()` 는 서버 컴포넌트/서버 전용 모듈에서만 import 한다. 클라이언트 번들에 `SUPABASE_SECRET_KEY` 가 새면 안 된다 (`server-only` import 로 방어).
- 다크 테마 전용 프로젝트다. 새 색상 하드코딩 금지, 기존 CSS 변수 토큰(`bg-background`, `bg-card`, `border-border`, `text-muted-foreground`, `text-primary` 등)만 사용.
- 역검증: 로직 버그를 고쳤다고 판단되면 수정을 되돌려 검증이 실패하는지 확인 후 원복한다.

### 코드 밖 부수 작업 체크리스트 (지시서 스코프 누락 방어)

- [ ] 새 환경변수 → 없음 (기존 `SUPABASE_SECRET_KEY` 재사용). 추가되면 `.env.example` 갱신 필수.
- [ ] DB 마이그레이션 → 없음 (읽기 전용 작업).
- [ ] 미들웨어/인증 → `/holidays` 는 이미 공개. `proxy.ts` matcher 를 건드리지 말 것.
- [ ] 배포 → 골 제외. 단 PH-6 에서 `pnpm build` 산출물 기준으로 검증한다.

## 결정 로그

- D1 (2026-08-15, 아키텍트): 공개 페이지 데이터는 백엔드 API 가 아니라 Supabase admin client 직조회. 이유: API 호출은 키·쿼터 관리가 필요하고, 프론트는 이미 대시보드에서 같은 DB를 직접 읽는 구조다.
- D2: 영업일 계산기는 API 호출 없이 **동일 로직을 로컬 계산**한다. 이유: 익명 트래픽에 키를 노출할 수 없고, 로직이 순수 함수라 복제 비용이 낮다. 페이지에는 "API 와 동일한 계산" 문구로 제품 데모임을 명시.
- D3: 대체공휴일 판정은 `name` 에 "대체" 포함 여부로 한다 (DB 에 별도 플래그 없음, 실데이터 확인됨).
- D4: 노출 연도는 DB `distinct year` 로 동적 결정 (하드코딩 금지). 새 연도 sync 시 자동 확장.
- D5 (2026-08-15, 아키텍트): lint 게이트 전면 제거. `pnpm lint`(`next lint`)는 Next 16 에서 명령 자체가 제거되어 이 작업과 무관하게 사전 실패 상태. ESLint CLI 마이그레이션은 이 원장 범위 밖의 별도 백로그로 넘긴다. 이 작업의 품질 게이트는 `pnpm build`(strict TS) + grep 검증으로 충분.
- D6 (2026-08-15, 아키텍트): PH-3 수용 기준 4번의 "성탄절"은 아키텍트 오기 — DB 실측값은 "기독탄신일"이다. 지시서를 DB 값 기준으로 수정했다. DB 값을 페이지에서 임의 변경하지 않는다는 금지사항이 옳았고, 루프가 BLOCKED 를 건 판단이 맞다.
- 참고: 2026-08-15 admin sync 재실행으로 DB 가 2025/2026/2027/2028 = 20/22/24/19건으로 갱신됨(노동절 신설 반영, 2028 추가). D4 에 따라 페이지·sitemap 은 자동 확장되므로 코드 수정 불요. PH-6 게이트의 연도 루프(2025~2027)에 2028 이 추가로 생성되는 것은 정상.

## 진행 로그

- 2026-08-15: 원장·지시서 작성, worktree `feat/public-holiday-pages` 생성 (아키텍트).
- 2026-08-15: PH-1 완료 — `lib/holidays.ts` 추가 (`getAvailableYears`, `getHolidaysByYear`), `server-only` 패키지 설치. `pnpm build` 통과 확인.
- 2026-08-15: PH-2 완료 — `lib/business-day.ts`(순수 함수) + `scripts/verify-business-days.ts` 추가. `node --experimental-strip-types scripts/verify-business-days.ts` ALL PASS(exit 0) 확인. `tsconfig.json` exclude 에 `scripts` 추가(Next 타입체크에서 스크립트 제외, `.ts` 확장자 상대 import 허용 목적) 후 `pnpm build` 통과. 역검증: 주말 판정(`getUTCDay() === 0 || 6`)을 일시적으로 무력화하니 7케이스 중 4건 실패 확인 후 원복, 재검증 ALL PASS.
- 2026-08-15: PH-3 BLOCKED — `app/holidays/page.tsx`(redirect), `app/holidays/[year]/page.tsx`(SSG, revalidate 3600), `components/holidays/holiday-list.tsx` 구현. `pnpm build` 성공, `.next/server/app/holidays` 에 2025/2026/2027.html 생성 확인, 검증 3번(광복절+대체 in 2026) PASS. 검증 4번(성탄절 in 2027) FAIL — Supabase 실측 결과 2027-12-25 실제 `name` 은 "기독탄신일"("성탄절" 아님). `pnpm lint` 는 이 태스크와 무관하게 사전부터 실패 상태(Next 16 에서 `next lint` 명령 제거됨, stash 로 확인). 부수적으로 worktree 에 남아있던 무관 stash(`stash@{0}`, main 브랜치의 `app/layout.tsx` 변경분)를 실수로 pop 했다가 충돌 확인 후 `git checkout --ours` 로 즉시 원복, stash 는 손상 없이 보존됨.
- 2026-08-15: PH-4 완료 — `components/holidays/business-day-calculator.tsx` 추가(클라이언트, fetch 없이 `lib/business-day.ts` 로컬 계산). PH-3 페이지에서 `year`+`year+1` 공휴일 날짜를 합쳐 `holidays` prop 으로 전달하도록 수정, `{/* PH-4 */}` 자리 표시 주석을 실제 컴포넌트로 교체. `pnpm build` 성공(정적 페이지 2025~2028 재생성 확인), `grep "use client"`/`grep "server-only"` PASS. `pnpm lint` 는 PH-3 에서 이미 확인된 사전 장애(Next 16 `next lint` 제거)로 이 태스크와 무관하게 실패.
- 2026-08-15: PH-6 BLOCKED — 지시서 선행 조건(PH-1~PH-5 전부 완료) 미충족. PH-3 이 여전히 BLOCKED 상태라 착수 불가. 구현/검증 시도 없음. 아키텍트가 PH-3 블로커(수용 기준 4번 지문 vs 실제 DB 데이터 불일치)를 해소한 뒤 재개 필요.
- 2026-08-15: PH-5 완료 — `app/holidays/[year]/page.tsx` 에 `generateMetadata`(title/description/canonical/OG/twitter, 지시서 문안 그대로) + JSON-LD(`ItemList`>`Event`, `<` 이스케이프) 추가. `app/sitemap.ts` 를 async 로 바꾸고 `getAvailableYears()` 로 `/holidays/{year}` 항목 동적 생성(monthly, priority 0.8). `app/robots.ts` 확인 결과 `/holidays` 차단 없음 — 수정 불필요. `pnpm build` 성공, `grep "application/ld+json" .next/server/app/holidays/2026.html` PASS, `grep "2026년 대한민국 공휴일" .next/server/app/holidays/2026.html` PASS, `.next/server/app/sitemap.xml.body` 에서 `holidays/2026` 확인 PASS(지시서 대체 절차 사용 — route.js 직접 import 대신 빌드 산출물 body 파일 grep 으로 검증, 그 사실을 여기 명시). `pnpm lint` 는 PH-3/PH-4 와 동일한 사전 장애(Next 16 `next lint` 제거)로 이 태스크와 무관하게 실패.
- 2026-08-15: 아키텍트 개입 — PH-3 수용 기준 오기(성탄절→기독탄신일) 수정, lint 게이트 제거(D5), PH-3/PH-6 블로커 해소. 루프 재개.
- 2026-08-15: PH-3 완료 — 구현은 기존 상태 그대로(수정 없음), 수정된 수용 기준으로 재검증만 수행. `pnpm build` 성공, `ls .next/server/app/holidays` 에 2025/2026/2027(+2028).html 존재 확인, `grep 광복절/대체 2026.html` PASS, `grep 기독탄신일 2027.html` PASS.
