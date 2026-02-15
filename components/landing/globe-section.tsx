"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Globe } from "@/components/ui/globe"

export function GlobeSection() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden px-6 pb-12 pt-32 sm:pb-16 md:pt-40">
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
          대한민국 공휴일을 손쉽게 조회하고, 나만의 커스텀 공휴일을 등록하세요. 단 한 줄의 API 호출로 시작할 수 있습니다.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2 px-8" asChild>
            <Link href="/login">
              지금 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent px-8" asChild>
            <Link href="#docs">API 문서 보기</Link>
          </Button>
        </div>

        <div className="mt-16 text-center sm:mt-20">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Global Service
          </p>
          <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            어디서든 빠르게 연결
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
            안정적인 글로벌 인프라로 어디서든 빠른 응답을 보장합니다.
          </p>
        </div>

        <div className="relative mt-8 h-[300px] w-full max-w-[400px] sm:h-[360px] sm:max-w-[500px] md:h-[450px] md:max-w-[600px]">
          <Globe className="top-0" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>
      </div>
    </section>
  )
}
