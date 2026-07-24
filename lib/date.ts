const KST_OFFSET_MS = 9 * 60 * 60 * 1000

/** KST(UTC+9) 기준 날짜를 YYYY-MM-DD 로 반환한다. */
export function kstDateString(date: Date = new Date()): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10)
}

/** KST 기준 연-월을 YYYY-MM 으로 반환한다. */
export function kstMonthPrefix(date: Date = new Date()): string {
  return kstDateString(date).slice(0, 7)
}

/** KST 기준으로 N일 전 날짜를 YYYY-MM-DD 로 반환한다. */
export function kstDaysAgoString(days: number): string {
  return kstDateString(new Date(Date.now() - days * 24 * 60 * 60 * 1000))
}
