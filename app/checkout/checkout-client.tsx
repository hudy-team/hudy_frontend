"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { initializePaddle, type Paddle, type Environments } from "@paddle/paddle-js"

interface Props {
  userEmail: string
  priceId: string
}

export function CheckoutClient({ userEmail, priceId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
    const env = process.env.NEXT_PUBLIC_PADDLE_ENV

    if (!token || !env) {
      console.error("Paddle environment variables not set")
      setError("결제 모듈 설정이 올바르지 않습니다. 잠시 후 다시 시도해주세요.")
      setLoading(false)
      return
    }

    initializePaddle({
      token,
      environment: env as Environments,
      eventCallback: (event) => {
        if (event.name === "checkout.completed") {
          router.push("/checkout/success")
        }
        if (event.name === "checkout.closed") {
          router.push("/dashboard")
        }
      },
      checkout: {
        settings: {
          variant: "one-page",
          displayMode: "inline",
          theme: "dark",
          frameTarget: "paddle-checkout-frame",
          frameInitialHeight: 450,
          frameStyle: "width: 100%; background-color: transparent; border: none;",
          allowLogout: false,
        },
      },
    })
      .then((paddleInstance) => {
        if (!paddleInstance) {
          setError("결제 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.")
          return
        }
        paddleInstance.Checkout.open({
          customer: { email: userEmail },
          items: [{ priceId, quantity: 1 }],
        })
      })
      .catch((err) => {
        console.error("Failed to initialize Paddle:", err)
        setError("결제 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [priceId, userEmail, router])

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      {!loading && error && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground">
            문제가 계속되면 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
          >
            다시 시도
          </button>
        </div>
      )}
      {!error && <div className="paddle-checkout-frame" />}
    </div>
  )
}
