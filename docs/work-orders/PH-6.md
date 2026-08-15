# PH-6: 진입 링크 + 문서 갱신 + 전체 골 게이트 재검증

선행: PH-1~PH-5 전부. 미완료면 BLOCKED.

## 구현

1. `components/landing/navbar.tsx`: 네비 링크에 "공휴일 조회" → `/holidays` 추가 (기존 링크 스타일 그대로, 모바일 메뉴에도).
2. `components/landing/footer.tsx`: footer 링크에 "{올해}년 공휴일"(KST) → `/holidays/{올해}` 추가.
3. `CLAUDE.md` 갱신:
   - 라우팅 트리에 `holidays/` 추가 (공개 페이지, SSG+revalidate 3600, admin client 사용 명시)
   - Key Notes 에 "공개 페이지는 `lib/holidays.ts`(server-only, admin client) 로 DB 직조회 — anon 으로 못 읽는다" 1줄
4. 전체 골 게이트 재검증 후 WORKPLAN.md 의 G1~G7 체크.

## 골 게이트 검증 명령 (전부 실행)

- G1: `pnpm build` 후 `for y in 2025 2026 2027; do grep -q "년 대한민국 공휴일" .next/server/app/holidays/$y.html || echo "FAIL $y"; done`
- G2: `app/holidays/page.tsx` 에 redirect 구현 존재 + build 성공 (정적 검증으로 갈음, 근거 기록).
- G3: `node --experimental-strip-types scripts/verify-business-days.ts`
- G4: PH-5 수용 기준 명령 재실행.
- G5: `grep -q "/holidays" components/landing/navbar.tsx && grep -q "/holidays" components/landing/footer.tsx && grep -q "무료로 시작하기" .next/server/app/holidays/2026.html`
- G6: `pnpm build` (lint 게이트는 D5 로 제거됨)
- G7: CLAUDE.md diff 육안 확인, 갱신 내용 진행 로그에 요약.

## 금지사항

- 랜딩의 기존 섹션 구조·카피 변경 금지 (링크 추가만).
- 게이트가 하나라도 실패하면 체크하지 말고 원인 태스크에 BLOCKED 사유를 적을 것.

## 수용 기준

- 위 게이트 명령 전부 통과 + WORKPLAN.md G1~G7 및 PH-6 체크 + 진행 로그 갱신.
- 이 태스크 완료 후에만 sentinel 출력 조건이 성립한다.
