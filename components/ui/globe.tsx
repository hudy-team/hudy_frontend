"use client"

import { useEffect, useRef } from "react"
import createGlobe, { COBEOptions } from "cobe"
import { useMotionValue, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

const MOVEMENT_DAMPING = 1400

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [0.3, 0.3, 0.3],
  markerColor: [0.84, 0.29, 0.25],
  glowColor: [0.15, 0.15, 0.15],
  markers: [
    // 한국 주요 도시
    { location: [37.5665, 126.978], size: 0.1 },   // 서울
    { location: [35.1796, 129.0756], size: 0.06 },  // 부산
    { location: [35.8714, 128.6014], size: 0.05 },  // 대구
    { location: [33.4996, 126.5312], size: 0.04 },  // 제주
    { location: [35.1595, 126.8526], size: 0.05 },  // 광주
    { location: [36.3504, 127.3845], size: 0.05 },  // 대전
    { location: [37.4563, 126.7052], size: 0.05 },  // 인천
    { location: [35.5384, 129.3114], size: 0.04 },  // 울산
    // 아시아
    { location: [35.6762, 139.6503], size: 0.06 },  // 도쿄
    { location: [34.6937, 135.5023], size: 0.04 },  // 오사카
    { location: [39.9042, 116.4074], size: 0.06 },  // 베이징
    { location: [31.2304, 121.4737], size: 0.06 },  // 상하이
    { location: [22.3193, 114.1694], size: 0.05 },  // 홍콩
    { location: [25.033, 121.5654], size: 0.05 },   // 타이베이
    { location: [1.3521, 103.8198], size: 0.05 },   // 싱가포르
    { location: [13.7563, 100.5018], size: 0.04 },  // 방콕
    { location: [14.5995, 120.9842], size: 0.04 },  // 마닐라
    { location: [21.0285, 105.8542], size: 0.04 },  // 하노이
    { location: [28.6139, 77.209], size: 0.05 },    // 뉴델리
    { location: [19.076, 72.8777], size: 0.05 },    // 뭄바이
    // 유럽
    { location: [51.5074, -0.1278], size: 0.06 },   // 런던
    { location: [48.8566, 2.3522], size: 0.05 },    // 파리
    { location: [52.52, 13.405], size: 0.05 },      // 베를린
    { location: [41.9028, 12.4964], size: 0.04 },   // 로마
    { location: [40.4168, -3.7038], size: 0.04 },   // 마드리드
    { location: [52.3676, 4.9041], size: 0.04 },    // 암스테르담
    { location: [59.3293, 18.0686], size: 0.04 },   // 스톡홀름
    // 북미
    { location: [40.7128, -74.006], size: 0.06 },   // 뉴욕
    { location: [37.7749, -122.4194], size: 0.05 }, // 샌프란시스코
    { location: [34.0522, -118.2437], size: 0.05 }, // 로스앤젤레스
    { location: [47.6062, -122.3321], size: 0.04 }, // 시애틀
    { location: [43.6532, -79.3832], size: 0.04 },  // 토론토
    { location: [19.4326, -99.1332], size: 0.04 },  // 멕시코시티
    // 오세아니아
    { location: [-33.8688, 151.2093], size: 0.05 }, // 시드니
    { location: [-36.8485, 174.7633], size: 0.04 }, // 오클랜드
    // 남미
    { location: [-23.5505, -46.6333], size: 0.05 }, // 상파울루
    { location: [-34.6037, -58.3816], size: 0.04 }, // 부에노스아이레스
    // 중동/아프리카
    { location: [25.2048, 55.2708], size: 0.05 },   // 두바이
    { location: [-1.2921, 36.8219], size: 0.04 },   // 나이로비
    { location: [-33.9249, 18.4241], size: 0.04 },  // 케이프타운
  ],
}

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string
  config?: COBEOptions
}) {
  let phi = 0
  let width = 0
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)

  const r = useMotionValue(0)
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  })

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      r.set(r.get() + delta / MOVEMENT_DAMPING)
    }
  }

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth
      }
    }

    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      width: width * 2,
      height: width * 2,
      onRender: (state) => {
        if (!pointerInteracting.current) phi += 0.005
        state.phi = phi + rs.get()
        state.width = width * 2
        state.height = width * 2
      },
    })

    setTimeout(() => (canvasRef.current!.style.opacity = "1"), 0)
    return () => {
      globe.destroy()
      window.removeEventListener("resize", onResize)
    }
  }, [rs, config])

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
        )}
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX
          updatePointerInteraction(e.clientX)
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  )
}
