"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CreditCard, Calendar, Zap, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getSubscription } from "@/lib/paddle/get-subscription"
import { cancelSubscription } from "@/lib/paddle/cancel-subscription"
import { HUDY_PRO_PLAN } from "@/lib/paddle/pricing-config"

// Subscription type matching the DB schema
interface Subscription {
  id: string
  user_id: string
  paddle_subscription_id: string | null
  paddle_customer_id: string | null
  paddle_price_id: string | null
  status: string
  starts_at: string | null
  ends_at: string | null
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    getSubscription().then((data) => {
      setSubscription(data as Subscription | null)
      setLoading(false)
    })
  }, [])

  const handleCancel = async () => {
    if (!subscription) return
    setCanceling(true)
    const result = await cancelSubscription(subscription.id)
    setCanceling(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("구독이 해지 예약되었습니다. 현재 결제 기간까지 이용 가능합니다.")
      // Refresh subscription data
      const updated = await getSubscription()
      setSubscription(updated as Subscription | null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground">구독 및 결제 관리</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // No active subscription
  if (!subscription) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground">구독 및 결제 관리</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              HuDy Pro 구독하기
            </CardTitle>
            <CardDescription>
              월 ${HUDY_PRO_PLAN.price}으로 모든 API 기능을 이용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="mb-6 space-y-2">
              {HUDY_PRO_PLAN.features.slice(0, 4).map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild>
              <Link href="/checkout">구독 시작하기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Has subscription
  const statusBadge = {
    active: <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10">활성</Badge>,
    canceled: <Badge variant="destructive">해지 예약</Badge>,
    paused: <Badge variant="secondary">일시정지</Badge>,
    inactive: <Badge variant="outline">비활성</Badge>,
  }[subscription.status] || <Badge variant="outline">{subscription.status}</Badge>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground">구독 및 결제 관리</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              {HUDY_PRO_PLAN.name}
            </CardTitle>
            {statusBadge}
          </div>
          <CardDescription>
            ${HUDY_PRO_PLAN.price} / month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {subscription.starts_at && (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">구독 시작일</p>
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(subscription.starts_at), "yyyy년 M월 d일", { locale: ko })}
                  </p>
                </div>
              </div>
            )}
            {subscription.ends_at && (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {subscription.canceled_at ? "이용 만료일" : "다음 결제일"}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(subscription.ends_at), "yyyy년 M월 d일", { locale: ko })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {subscription.status === "active" && !subscription.canceled_at && (
            <div className="pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    구독 해지
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>구독을 해지하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      현재 결제 기간이 끝나면 서비스가 중단됩니다.
                      {subscription.ends_at && (
                        <> {format(new Date(subscription.ends_at), "yyyy년 M월 d일", { locale: ko })}까지 이용 가능합니다.</>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      disabled={canceling}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {canceling ? "처리중..." : "해지하기"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {subscription.canceled_at && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-sm text-destructive">
                구독 해지가 예약되었습니다.
                {subscription.ends_at && (
                  <> {format(new Date(subscription.ends_at), "yyyy년 M월 d일", { locale: ko })}까지 이용 가능합니다.</>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
