import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden px-6 pb-16 pt-28 md:pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">v2.0 Released - Custom Holidays Support</span>
        </div>

        <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-7xl">
          Korean Public Holidays
          <br />
          <span className="text-primary">API Service</span>
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
          {"대한민국 공휴일을 손쉽게 조회하고, 나만의 커스텀 공휴일을 등록하세요. 단 한 줄의 API 호출로 시작할 수 있습니다."}
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2 px-8" asChild>
            <Link href="/login">
              {"지금 시작하기"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="px-8 bg-transparent" asChild>
            <Link href="#docs">API 문서 보기</Link>
          </Button>
        </div>

        <div className="mt-16 w-full max-w-2xl">
          <CodePreview />
        </div>
      </div>
    </section>
  )
}

function CodePreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-left">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-destructive/60" />
        <div className="h-3 w-3 rounded-full bg-chart-4/60" />
        <div className="h-3 w-3 rounded-full bg-primary/60" />
        <span className="ml-3 text-xs text-muted-foreground font-mono">GET /v2/holidays</span>
      </div>
      <div className="p-4 font-mono text-xs leading-relaxed sm:p-5 sm:text-sm">
        <div className="text-muted-foreground whitespace-nowrap overflow-x-auto">
          <span className="text-primary">{"curl"}</span>{" "}
          <span className="text-foreground">{"https://api.hudy.co.kr/v2/holidays?year=2026"}</span>{" "}
          <span className="text-chart-4">{"-H"}</span>{" "}
          <span className="text-foreground">{'"x-api-key: YOUR_API_KEY"'}</span>
        </div>
        <div className="mt-4 border-t border-border pt-4 text-muted-foreground leading-loose">
          <div>{"{"}</div>
          <div className="pl-4">
            <span className="text-primary">{'"result"'}</span>: <span className="text-chart-4">{"true"}</span>,
          </div>
          <div className="pl-4">
            <span className="text-primary">{'"data"'}</span>: [
          </div>
          <div className="pl-8">{"{"}</div>
          <div className="pl-10 sm:pl-12">
            <span className="text-primary">{'"id"'}</span>: <span className="text-foreground">{'"1"'}</span>,
          </div>
          <div className="pl-10 sm:pl-12">
            <span className="text-primary">{'"name"'}</span>: <span className="text-foreground">{'"신정"'}</span>,
          </div>
          <div className="pl-10 sm:pl-12">
            <span className="text-primary">{'"date"'}</span>: <span className="text-foreground">{'"2026-01-01"'}</span>,
          </div>
          <div className="pl-10 sm:pl-12">
            <span className="text-primary">{'"type"'}</span>: <span className="text-foreground">{'"public"'}</span>
          </div>
          <div className="pl-8">{"}"}</div>
          <div className="pl-4">{"]"}</div>
          <div>{"}"}</div>
        </div>
      </div>
    </div>
  )
}
