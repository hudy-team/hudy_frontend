import { isBusinessDay, addBusinessDays, countBusinessDays } from "../lib/business-day.ts";

// 2026년 실데이터 기준 공휴일 (DB 실측, PH-1 조회 결과와 대조 완료)
// 광복절(8/15, 토) + 대체공휴일(8/17, 월), 추석 연휴(9/24~9/26), 개천절 대체(10/5)
const holidays2026 = [
  "2026-08-15",
  "2026-08-17",
  "2026-09-24",
  "2026-09-25",
  "2026-09-26",
  "2026-10-05",
];

let failures = 0;

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) {
    failures++;
    console.error(`FAIL: ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  } else {
    console.log(`PASS: ${label}`);
  }
}

// 1. 2026-08-14 (금) 은 평일이고 공휴일 아님 → 영업일
assertEqual(isBusinessDay("2026-08-14", { holidays: holidays2026 }), true, "isBusinessDay(2026-08-14) 금요일 영업일");

// 2. 2026-08-15 (토) 는 주말이면서 공휴일 → 영업일 아님
assertEqual(isBusinessDay("2026-08-15", { holidays: holidays2026 }), false, "isBusinessDay(2026-08-15) 토요일+광복절");

// 3. 2026-08-17 (월) 은 평일이지만 대체공휴일 → 영업일 아님
assertEqual(isBusinessDay("2026-08-17", { holidays: holidays2026 }), false, "isBusinessDay(2026-08-17) 대체공휴일");

// 4. 2026-08-14(금) 다음 영업일: 8/15(토,공휴일) 8/16(일) 8/17(월,대체공휴일) 모두 건너뛰고 8/18(화)
assertEqual(
  addBusinessDays("2026-08-14", 1, { holidays: holidays2026 }),
  "2026-08-18",
  "addBusinessDays(2026-08-14, 1) → 2026-08-18",
);

// 5. 2026-08-14(금) 부터 5영업일 후: 8/18(화,1) 8/19(수,2) 8/20(목,3) 8/21(금,4) 8/22(토)skip 8/23(일)skip 8/24(월,5)
assertEqual(
  addBusinessDays("2026-08-14", 5, { holidays: holidays2026 }),
  "2026-08-24",
  "addBusinessDays(2026-08-14, 5) → 2026-08-24",
);

// 6. [2026-08-14, 2026-08-21] 구간(양끝 포함) 영업일 수를 직접 손으로 센다:
//    8/14 금(영업일) 8/15 토+광복절(제외) 8/16 일(제외) 8/17 월+대체공휴일(제외)
//    8/18 화(영업일) 8/19 수(영업일) 8/20 목(영업일) 8/21 금(영업일)
//    → 14,18,19,20,21 총 5일
assertEqual(
  countBusinessDays("2026-08-14", "2026-08-21", { holidays: holidays2026 }),
  5,
  "countBusinessDays(2026-08-14, 2026-08-21) → 5",
);

// 7. 공휴일 목록이 비어 있으면 주말만 제외된다: 2026-08-15(토) 는 공휴일 목록 없이도 영업일 아님
assertEqual(isBusinessDay("2026-08-15", { holidays: [] }), false, "isBusinessDay(2026-08-15) 공휴일 없이도 토요일이라 제외");

if (failures > 0) {
  console.error(`\n${failures}건 실패`);
  process.exit(1);
}

console.log("\nALL PASS");
