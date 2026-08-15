# PH-4: 영업일 계산기 클라이언트 컴포넌트

선행: PH-2 (lib/business-day.ts), PH-3 (페이지). 미완료면 BLOCKED.

## 파일

- `components/holidays/business-day-calculator.tsx` — `"use client"`.
- props: `{ holidays: string[]; initialDate: string }` — 서버(페이지)가 해당 연도 + 다음 연도(DB 에 있으면) 공휴일 날짜 목록과 KST 오늘 날짜를 내려준다. **연말에 +N 영업일이 다음 해로 넘어가는 케이스 때문에 반드시 두 해치를 합쳐 전달** (PH-3 페이지 쪽 수정 포함).

## UI 명세

카드(`bg-card border rounded-xl p-6`) 안에:

- h2 "영업일 계산기" + 설명 "주말과 공휴일을 제외한 영업일을 계산합니다. HuDy Business Days API 와 동일한 계산입니다."
- 입력 행 (flex wrap): 기준일 `<input type="date">` (기본값 initialDate) / 모드 select ("영업일 더하기" | "영업일 수 세기") / 더하기 모드: 일수 number input (기본 5, min 1 max 365) / 세기 모드: 종료일 date input / "계산" 버튼 (primary).
- 결과 박스: 더하기 → "{기준일} 기준 {n}영업일 후는 **{결과 (요일)}** 입니다". 세기 → "{from} ~ {to} 영업일은 **{n}일** 입니다". 결과 강조는 mono + 초록 계열 기존 토큰(없으면 `text-primary`).
- 하단 캡션: "이 계산은 `GET /v2/business-days/add` 호출 결과와 동일합니다." (`/v2/business-days/count` 세기 모드일 때 경로 전환).
- 계산은 `lib/business-day.ts` 의 함수 호출. 버튼 클릭 시 즉시 계산 (요청 없음).
- 결과 날짜의 요일 표시는 UTC 기준 `getUTCDay()` → ["일","월","화","수","목","금","토"] 매핑.

폼 컴포넌트는 기존 shadcn `components/ui/`(input, select, button) 재사용.

## 금지사항

- fetch/API 호출 금지 (D2 결정).
- react-hook-form/zod 끌어오지 말 것 — 로컬 state 2~3개면 충분하다.
- 입력 검증 실패 시 alert 금지 — 결과 박스에 안내 문구.

## 수용 기준

- `pnpm build` 성공. (lint 게이트 제거 — D5 참조)
- `grep -q "use client" components/holidays/business-day-calculator.tsx && echo PASS`
- 클라이언트 번들에 admin 키 유출 없음: `grep -rL "server-only" lib/holidays.ts || true` 가 아니라 → `grep -q "server-only" lib/holidays.ts && echo PASS` 로 확인.
- PH-3 페이지의 자리 표시 주석을 실제 컴포넌트로 교체하고 빌드 재확인.
