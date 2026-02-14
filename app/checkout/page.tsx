import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HUDY_PRO_PLAN } from "@/lib/paddle/pricing-config"
import { CheckoutClient } from "./checkout-client"

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">HuDy Pro 구독</h1>
          <p className="mt-2 text-muted-foreground">
            월 $3으로 모든 기능을 이용하세요
          </p>
        </div>
        <CheckoutClient
          userEmail={user.email || ""}
          priceId={HUDY_PRO_PLAN.priceId}
        />
      </div>
    </div>
  )
}
