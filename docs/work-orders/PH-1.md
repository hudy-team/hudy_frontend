# PH-1: 공개 공휴일 데이터 레이어 `lib/holidays.ts`

## 목적

`/holidays/[year]` 페이지가 쓸 서버 전용 데이터 모듈. Supabase `public_holidays` 를 admin client 로 읽는다.

## 구현

새 파일 `lib/holidays.ts`:

```ts
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PublicHoliday {
  name: string;
  date: string;        // "YYYY-MM-DD"
  dayOfWeek: string;   // DB day_of_week 원본
  isSubstitute: boolean; // name 에 "대체" 포함 여부
}

/** DB 에 존재하는 연도 목록 (오름차순). */
export async function getAvailableYears(): Promise<number[]>

/** 해당 연도 공휴일 전체, 날짜 오름차순. */
export async function getHolidaysByYear(year: number): Promise<PublicHoliday[]>
```

- `getAvailableYears`: `select year` 후 중복 제거·정렬 (`distinct` 는 supabase-js 에 없으므로 JS 로 dedupe).
- `getHolidaysByYear`: `select name, date, day_of_week` + `.eq("year", year)` + `.order("date")`.
- 두 함수 모두 supabase error 시 `throw new Error(...)` (빈 배열로 삼키지 말 것 — 페이지가 조용히 비는 것 방지).
- `isSubstitute` 는 `name.includes("대체")`.

## 금지사항

- 클라이언트 컴포넌트에서 import 가능하게 만들지 말 것 (`server-only` 필수. 미설치 패키지면 `pnpm add server-only`).
- `custom_holidays` 테이블 접근 금지 (공개 페이지는 법정공휴일만).
- 캐싱 로직을 이 모듈에 넣지 말 것 (페이지 레벨 `revalidate` 가 담당).

## 수용 기준

- `pnpm build` 성공 (타입 에러 없음).
- 검증 명령: `node --experimental-strip-types -e "console.log('type-only module, build 검증으로 갈음')" && pnpm build`
  (이 모듈 단독 실행 검증은 불가 — env 필요. build 통과 + PH-3 프리렌더 결과로 최종 검증된다.)
