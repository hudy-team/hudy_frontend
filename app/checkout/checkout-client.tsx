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

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
    const env = process.env.NEXT_PUBLIC_PADDLE_ENV

    if (!token || !env) {
      console.error("Paddle environment variables not set")
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
    }).then((paddleInstance) => {
      if (paddleInstance) {
        paddleInstance.Checkout.open({
          customer: { email: userEmail },
          items: [{ priceId, quantity: 1 }],
        })
        setLoading(false)
      }
    })
  }, [priceId, userEmail, router])

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      <div className="paddle-checkout-frame" />
    </div>
  )
}
