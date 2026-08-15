# PH-3: `/holidays/[year]` 공개 페이지 + `/holidays` redirect

선행: PH-1 (lib/holidays.ts). 미완료면 BLOCKED.

## 파일

- `app/holidays/page.tsx` — 서버 컴포넌트. `redirect(`/holidays/${kstYear}`)`. KST 연도는 `lib/date.ts` 의 `kstDateString()` 첫 4자리 사용 (새 헬퍼 추가 금지, 있는 걸 조합).
- `app/holidays/[year]/page.tsx` — 서버 컴포넌트, SSG:
  - `export const revalidate = 3600`
  - `generateStaticParams`: `getAvailableYears()` 결과를 `{ year: string }[]` 로.
  - params 의 year 가 정수가 아니거나 `getAvailableYears()` 에 없으면 `notFound()`.
- `components/holidays/holiday-list.tsx` 등 페이지 전용 컴포넌트는 `components/holidays/` 아래에 만든다.

## 레이아웃 명세 (아키텍트 목업 확정안 — 그대로 구현)

위에서 아래로:

1. **기존 랜딩 navbar 재사용** (`components/landing/navbar.tsx`). props 수정이 필요하면 최소 수정.
2. **헤더 블록**: breadcrumb(`hudy.co.kr / holidays / {year}`, mono 폰트, muted) → `h1`: "{year}년 대한민국 공휴일" (연도만 `text-primary`) → 리드 문장: "법정공휴일과 대체공휴일 전체 목록입니다. 임시공휴일이 지정되면 즉시 반영되며, 같은 데이터를 REST API·iCal 구독으로 받아볼 수 있습니다."
3. **연도 스위처**: `getAvailableYears()` 전체를 pill 링크로. 현재 연도는 primary 테두리+배경 강조, `aria-current="page"`.
4. **스탯 카드 3개** (모바일 1열, sm 이상 3열):
   - "연간 공휴일" — 해당 연도 공휴일 수 + "일"
   - "대체공휴일" — isSubstitute 수 + "일"
   - "다음 공휴일" — KST 오늘 이후 가장 가까운 공휴일 이름과 D-day. 오늘이 공휴일이면 "오늘 · {이름}". 해당 연도에 남은 공휴일이 없으면 "올해 공휴일 종료". 이 카드만 primary 톤 강조.
5. **월별 목록**: 공휴일이 있는 월만, "AUG · 8월" 형식의 mono 라벨(오른쪽으로 border 라인) 아래 행 카드. 각 행: `MM.DD 요일` (mono, 주말·공휴일 요일은 primary 색) + 이름(semibold) + 오른쪽 배지 — 대체공휴일이면 "대체" 배지(primary soft). KST 오늘 이전 날짜 행은 `opacity-45`.
6. **영업일 계산기 섹션**: PH-4 의 컴포넌트를 배치 (PH-4 미완이면 `{/* PH-4 */}` 자리 표시 주석만 두고 진행 — BLOCKED 아님).
7. **API CTA 섹션**: 2열 (모바일 1열). 왼쪽: h2 "이 데이터를 서비스에 넣으세요" + "급여 정산, 배송 예정일, 알림 스케줄링 — 공휴일 하드코딩 대신 API 한 줄이면 됩니다. 임시공휴일 지정도 배포 없이 자동 반영됩니다." + 버튼 2개("무료로 시작하기" → `/login`, "API 문서 보기" → 랜딩의 docs 섹션 앵커). 오른쪽: mono 코드 블록 —
   ```
   # {year}년 공휴일 전체 조회
   curl "https://api.hudy.co.kr/v2/holidays?year={year}" \
     -H "x-api-key: hd_live_..."
   ```
   섹션 전체는 primary soft 그라데이션 배경 + primary 테두리 카드.
8. **기존 랜딩 footer 재사용**.

콘텐츠 폭 `max-w-4xl mx-auto px-6` 기준. 카드류는 `bg-card border border-border rounded-xl`(기존 토큰).

## 금지사항

- 클라이언트 컴포넌트 최소화 — 이 페이지는 계산기(PH-4) 외 전부 서버 컴포넌트.
- 날짜 문자열을 `new Date()` 로컬 파싱해서 요일 재계산하지 말 것 — DB `day_of_week` 를 그대로 표시.
- 스타일 하드코딩 색상 금지 (원장 상시 규칙).

## 수용 기준

- 검증 명령 (순서대로 전부):
  1. `pnpm build` 성공
  2. `ls .next/server/app/holidays` 에 `2025.html 2026.html 2027.html` 존재
  3. `grep -q "광복절" .next/server/app/holidays/2026.html && grep -q "대체" .next/server/app/holidays/2026.html && echo PASS`
  4. `grep -q "성탄절" .next/server/app/holidays/2027.html && echo PASS`
- `pnpm lint` 통과.
