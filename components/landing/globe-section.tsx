"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Globe2 } from "lucide-react"

// cobe 는 WebGL 캔버스를 쓰므로 SSR 을 끄고, 뷰포트 진입 시에만 번들을 불러온다
const Globe = dynamic(
  () => import("@/components/ui/globe").then((m) => m.Globe),
  { ssr: false }
)

export function GlobeSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => setReducedMotion(query.matches)
    onChange()
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    const el = containerRef.current
    if (!el) return

    // 뷰포트를 벗어나면 언마운트되어 Globe 의 cleanup(globe.destroy)이 rAF 루프를 멈춘다
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center">
          <div className="mb-8 text-center">
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

          <div
            ref={containerRef}
            className="relative aspect-square w-full max-w-[400px] md:max-w-[550px]"
          >
            {reducedMotion ? (
              // 모션 최소화 설정에서는 회전하는 글로브 대신 정적 표현을 보여준다
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex aspect-square w-full max-w-[400px] items-center justify-center rounded-full border border-border bg-muted/20">
                  <Globe2
                    className="h-1/3 w-1/3 text-primary/60"
                    aria-hidden="true"
                  />
                  <span className="sr-only">전 세계 서비스 지역 지도</span>
                </div>
              </div>
            ) : (
              isVisible && <Globe className="top-0" />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
