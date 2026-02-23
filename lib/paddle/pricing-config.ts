/** 무료 플랜 설정 */
export const HUDY_FREE_PLAN = {
  name: "Free",
  price: 0,
  currency: "USD",
  monthlyQuota: 100,
  features: [
    "월 100회 API 호출",
    "x-api-key 기반 인증",
    "대한민국 법정공휴일 전체 제공",
    "연도별 / 기간별 조회",
    "API 사용량 대시보드",
    "99.9% Uptime SLA",
  ],
} as const;

/** 유료 Pro 플랜 설정 */
export const HUDY_PRO_PLAN = {
  name: "HuDy Pro",
  productId: "pro_01khe31vwkkqyswk484177fpw6",
  priceId: {
    month: "pri_01khznxcxjy7tzfrqrrhgjxgv6",        // 무료체험 포함
    monthNoTrial: "pri_01khe32kbr9f7270tdf08wedyb",  // 무료체험 없음
  },
  price: 3,
  currency: "USD",
  interval: "month" as const,
  monthlyQuota: 5000,
  features: [
    "월 5,000회 API 호출",
    "커스텀 공휴일 등록",
    "우선 기술 지원",
  ],
  /** 무료 플랜 포함 전체 기능 (Pro = Free + extras) */
  allFeatures: [
    "월 5,000회 API 호출",
    "커스텀 공휴일 등록",
    "x-api-key 기반 인증",
    "대한민국 법정공휴일 전체 제공",
    "연도별 / 기간별 조회",
    "우선 기술 지원",
    "API 사용량 대시보드",
    "99.9% Uptime SLA",
  ],
} as const;

/** 무료체험 포함 priceId인지 확인 */
export function isPriceWithTrial(priceId: string): boolean {
  return priceId === HUDY_PRO_PLAN.priceId.month;
}

/** 모든 유효한 priceId 목록 */
export function isValidPriceId(priceId: string): boolean {
  return (
    priceId === HUDY_PRO_PLAN.priceId.month ||
    priceId === HUDY_PRO_PLAN.priceId.monthNoTrial
  );
}
