import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Zap, Sparkles } from "lucide-react"
import { HUDY_FREE_PLAN, HUDY_PRO_PLAN } from "@/lib/paddle/pricing-config"

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">Pricing</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {"요금제"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            {"무료로 시작하고, 필요할 때 업그레이드하세요."}
          </p>
        </div>

        <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 무료 플랜 */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-8">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">{HUDY_FREE_PLAN.name}</h3>
            </div>

            <div className="mb-2 flex items-baseline gap-1">
              <span className="text-5xl font-bold text-foreground">{"무료"}</span>
            </div>

            <p className="mb-8 text-sm text-muted-foreground">
              {"기본 공휴일 API를 무료로 이용하세요."}
            </p>

            <ul className="mb-8 flex flex-col gap-3 flex-1">
              {HUDY_FREE_PLAN.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button size="lg" variant="outline" className="w-full" asChild>
              <Link href="/login">{"무료로 시작하기"}</Link>
            </Button>
          </div>

          {/* 유료 플랜 */}
          <div className="relative flex flex-col rounded-2xl border border-primary bg-card p-8 shadow-lg shadow-primary/5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
              Popular
            </div>

            <div className="mb-2 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">{HUDY_PRO_PLAN.name}</h3>
            </div>

            <div className="mb-2 flex items-baseline gap-1">
              <span className="text-5xl font-bold text-foreground">${HUDY_PRO_PLAN.price}</span>
              <span className="text-sm text-muted-foreground">/ {HUDY_PRO_PLAN.interval}</span>
            </div>

            <p className="mb-2 text-sm font-medium text-primary">
              {"30일 무료 체험"}
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              {"모든 기능, 한달 커피 한 잔 값으로 부담 없이 시작하세요."}
            </p>

            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {"무료 플랜의 모든 기능 +"}
            </p>
            <ul className="mb-8 flex flex-col gap-3 flex-1">
              {HUDY_PRO_PLAN.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button size="lg" className="w-full" asChild>
              <Link href="/checkout">{"30일 무료로 시작하기"}</Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {"무료 체험 후 월 $" + HUDY_PRO_PLAN.price + " · 언제든 취소 가능"}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
