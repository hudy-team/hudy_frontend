# PH-2: 영업일 계산 로직 `lib/business-day.ts` + 검증 스크립트

## 목적

공개 페이지 계산기가 쓸 순수 함수. 백엔드 `/v2/business-days/*` 와 동일한 의미론 (주말 + 법정공휴일 제외).

## 구현

새 파일 `lib/business-day.ts` — **의존성 없는 순수 함수만** (supabase·react import 금지, `@/` alias import 도 금지 — 검증 스크립트가 node 로 직접 실행한다):

```ts
export interface BizDayInput {
  holidays: string[]; // "YYYY-MM-DD" 목록 (여러 연도 합쳐서 전달 가능)
}

/** date 가 영업일인지 (주말·공휴일 아님) */
export function isBusinessDay(date: string, input: BizDayInput): boolean

/** from 에서 n 영업일 후의 날짜 (n>=1, from 자신은 미포함) */
export function addBusinessDays(from: string, n: number, input: BizDayInput): string

/** [from, to] 구간(양끝 포함)의 영업일 수 */
export function countBusinessDays(from: string, to: string, input: BizDayInput): number
```

- 날짜 연산은 문자열 "YYYY-MM-DD" 를 `Date.UTC` 로 파싱해 UTC 자정 기준으로만 가감한다.
  **로컬 타임존이 절대 개입하면 안 된다** (`new Date("2026-08-15")` 는 UTC 파싱이라 안전하지만, `getDay()` 대신 `getUTCDay()` 를 쓸 것).
- 주말 판정: `getUTCDay() === 0 || 6`.
- `addBusinessDays` 는 하루씩 전진하며 영업일을 n 회 셀 때까지 반복. 안전 상한 1000일 루프 가드.

새 파일 `scripts/verify-business-days.ts` — 아래 케이스를 assert 하고 하나라도 실패하면 exit 1:

2026년 실데이터 기준 고정 케이스 (공휴일 목록은 스크립트에 하드코딩:
`2026-08-15`(광복절·토), `2026-08-17`(광복절 대체·월), `2026-09-24`,`2026-09-25`,`2026-09-26`(추석 연휴), `2026-10-05`(개천절 대체) — DB 실데이터와 대조해 다르면 DB 값을 따르고 스크립트 주석에 명시):

1. `isBusinessDay("2026-08-14")` === true (금)
2. `isBusinessDay("2026-08-15")` === false (토+공휴일)
3. `isBusinessDay("2026-08-17")` === false (대체공휴일)
4. `addBusinessDays("2026-08-14", 1)` === "2026-08-18" (토·일·대체휴일 건너뜀)
5. `addBusinessDays("2026-08-14", 5)` === "2026-08-24"
6. `countBusinessDays("2026-08-14", "2026-08-21")` === 4 (14,18,19,20,21 중 21 포함 → 금·화·수·목·금 = 5? **직접 손으로 세어 기대값을 확정하고 주석으로 근거를 적을 것.** 계산 근거 없는 기대값 금지)
7. 공휴일 목록이 비어 있으면 주말만 제외되는지 1케이스.

## 금지사항

- date-fns 사용 금지 (이 모듈은 스크립트에서 alias 없이 실행되어야 한다).
- 백엔드 Rust 코드 수정 금지 (참고만: `hudy_backend/src/services/business_day.rs` 가 의미론 원본).

## 수용 기준

- 검증 명령: `node --experimental-strip-types scripts/verify-business-days.ts` → exit 0, "ALL PASS" 출력.
- `pnpm build` 성공.
- 역검증: `addBusinessDays` 의 주말 건너뛰기 조건을 일시적으로 깨고 스크립트가 실패하는지 확인 후 원복 (커밋 메시지에 "역검증 완료" 명시).
