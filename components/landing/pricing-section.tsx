import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Zap } from "lucide-react"

const features = [
  "월 5,000회 API 호출",
  "커스텀 공휴일 등록",
  "x-api-key 기반 인증",
  "대한민국 법정공휴일 전체 제공",
  "연도별 / 기간별 조회",
  "우선 기술 지원",
  "API 사용량 대시보드",
  "99.9% Uptime SLA",
]

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">Pricing</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {"심플한 단일 요금제"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            {"복잡한 요금 체계는 없습니다. 모든 기능을 월 $3에 이용하세요."}
          </p>
        </div>

        <div className="mx-auto max-w-lg">
          <div className="relative flex flex-col rounded-2xl border border-primary bg-card p-8 shadow-lg shadow-primary/5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
              All-in-One
            </div>

            <div className="mb-2 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">HuDy Pro</h3>
            </div>

            <div className="mb-2 flex items-baseline gap-1">
              <span className="text-5xl font-bold text-foreground">$3</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </div>

            <p className="mb-8 text-sm text-muted-foreground">
              {"모든 기능, 하나의 요금제. 지금 바로 시작하세요."}
            </p>

            <ul className="mb-8 flex flex-col gap-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button size="lg" className="w-full" asChild>
              <Link href="/checkout">{"지금 시작하기"}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
