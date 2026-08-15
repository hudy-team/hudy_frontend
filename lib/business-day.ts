export interface BizDayInput {
  holidays: string[]; // "YYYY-MM-DD" 목록 (여러 연도 합쳐서 전달 가능)
}

function parseUTC(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function formatUTC(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** date 가 영업일인지 (주말·공휴일 아님) */
export function isBusinessDay(date: string, input: BizDayInput): boolean {
  const ms = parseUTC(date);
  const dow = new Date(ms).getUTCDay();
  if (dow === 0 || dow === 6) return false;
  if (input.holidays.includes(date)) return false;
  return true;
}

/** from 에서 n 영업일 후의 날짜 (n>=1, from 자신은 미포함) */
export function addBusinessDays(from: string, n: number, input: BizDayInput): string {
  let ms = parseUTC(from);
  let counted = 0;
  let guard = 0;
  while (counted < n) {
    guard++;
    if (guard > 1000) {
      throw new Error("addBusinessDays: safety guard exceeded");
    }
    ms += 24 * 60 * 60 * 1000;
    if (isBusinessDay(formatUTC(ms), input)) {
      counted++;
    }
  }
  return formatUTC(ms);
}

/** [from, to] 구간(양끝 포함)의 영업일 수 */
export function countBusinessDays(from: string, to: string, input: BizDayInput): number {
  let ms = parseUTC(from);
  const endMs = parseUTC(to);
  let count = 0;
  let guard = 0;
  while (ms <= endMs) {
    guard++;
    if (guard > 100000) {
      throw new Error("countBusinessDays: safety guard exceeded");
    }
    if (isBusinessDay(formatUTC(ms), input)) {
      count++;
    }
    ms += 24 * 60 * 60 * 1000;
  }
  return count;
}
