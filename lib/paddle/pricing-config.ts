export const HUDY_PRO_PLAN = {
  name: "HuDy Pro",
  productId: "pro_01khe31vwkkqyswk484177fpw6",
  priceId: "pri_01khe32kbr9f7270tdf08wedyb",
  price: 3,
  currency: "USD",
  interval: "month" as const,
  features: [
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
