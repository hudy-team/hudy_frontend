# PH-5: SEO — metadata·JSON-LD·sitemap

선행: PH-3. 미완료면 BLOCKED.

## 구현

1. `app/holidays/[year]/page.tsx` 에 `generateMetadata`:
   - title: `"{year}년 대한민국 공휴일 · 대체공휴일 총정리 | HuDy"`
   - description: `"{year}년 법정공휴일 {n}일 전체 목록과 대체공휴일, 영업일 계산기. 임시공휴일 지정 즉시 반영되는 공휴일 API 데이터 기준."` (n 은 실데이터 수)
   - `alternates.canonical`: `https://www.hudy.co.kr/holidays/{year}`
   - openGraph title/description 동일 계열. 기존 루트 `opengraph-image.tsx` 상속이면 별도 이미지 작업 불필요.
2. JSON-LD (`<script type="application/ld+json">`, 페이지 서버 컴포넌트에서 렌더):
   - `@type: "ItemList"`, `itemListElement` 각 항목 `@type: "Event"` — `name`, `startDate`(YYYY-MM-DD), `eventAttendanceMode` 생략, `location` 은 `@type: "Country", name: "대한민국"` 하나로.
   - `dangerouslySetInnerHTML` + `JSON.stringify` 사용, XSS 방지 위해 `<` 이스케이프(`.replace(/</g, "\\u003c")`).
3. `app/sitemap.ts`: `/holidays/{year}` 항목 추가. **정적 하드코딩 금지** — sitemap 함수를 async 로 바꾸고 `getAvailableYears()` 로 생성. `changeFrequency: "monthly"`, `priority: 0.8`.
4. `app/robots.ts` 확인 — `/holidays` 가 차단되어 있지 않은지만 확인 (차단이면 허용으로 수정).

## 금지사항

- 키워드 스터핑 금지 — title/description 은 위 문안 그대로.
- `metadataBase` 등 루트 layout 의 기존 설정 변경 금지 (필요 시에만 최소 추가).

## 수용 기준

- `pnpm build` 후:
  - `grep -q "application/ld+json" .next/server/app/holidays/2026.html && echo PASS`
  - `grep -q "2026년 대한민국 공휴일" .next/server/app/holidays/2026.html && echo PASS`
  - `grep -q "holidays/2026" .next/server/app/sitemap.xml.* 2>/dev/null || node -e "import('./.next/server/app/sitemap.xml/route.js').catch(()=>process.exit(0))"` — sitemap 빌드 산출 검증이 어려우면 `pnpm build` 성공 + sitemap.ts 코드 리뷰로 갈음하고 그 사실을 진행 로그에 명시.
- `pnpm lint` 통과.
