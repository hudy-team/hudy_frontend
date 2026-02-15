"use client"

import { Globe } from "@/components/ui/globe"

export function GlobeSection() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative flex flex-col items-center">
          <div className="relative z-10 mb-8 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
              Global Service
            </p>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              어디서든 빠르게 연결
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
              안정적인 글로벌 인프라로 어디서든 빠른 응답을 보장합니다.
            </p>
          </div>

          <div className="relative h-[320px] w-full max-w-[500px] md:h-[400px] md:max-w-[600px]">
            <Globe className="top-0" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-background/80" />
          </div>
        </div>
      </div>
    </section>
  )
}
