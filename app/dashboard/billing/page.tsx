"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { ko } from "date-fns/locale"
import { CreditCard, Calendar, Zap, AlertTriangle, Clock, FileText, ExternalLink, Loader2, Check, ArrowRight, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { getBillingData, type BillingData } from "@/lib/paddle/get-billing-data"
import { cancelSubscription } from "@/lib/paddle/cancel-subscription"
import { HUDY_PRO_PLAN } from "@/lib/paddle/pricing-config"

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCanceling, setIsCanceling] = useState(false)

  useEffect(() => {
    async function loadBillingData() {
      try {
        const data = await getBillingData()
        setBillingData(data)
      } catch (error) {
        console.error("Failed to load billing data:", error)
        toast.error("결제 정보를 불러오는데 실패했습니다")
      } finally {
        setIsLoading(false)
      }
    }

    loadBillingData()
  }, [])

  const handleCancelSubscription = async () => {
    if (!billingData?.subscription?.id) return

    setIsCanceling(true)
    try {
      await cancelSubscription(billingData.subscription.id)
      toast.success("구독이 취소되었습니다. 현재 결제 기간이 끝나면 자동으로 종료됩니다.")

      // Reload billing data
      const data = await getBillingData()
      setBillingData(data)
    } catch (error) {
      console.error("Failed to cancel subscription:", error)
      toast.error("구독 취소에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsCanceling(false)
    }
  }

  const getStatusBadge = (subscription: BillingData["subscription"]) => {
    if (!subscription) return null

    if (subscription.canceledAt) {
      return <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">해지 예약</Badge>
    }

    if (subscription.status === "active") {
      return <Badge variant="outline" className="border-green-500/50 text-green-500">활성</Badge>
    }

    return <Badge variant="outline" className="border-muted-foreground">비활성</Badge>
  }

  const getTransactionStatusBadge = (status: string) => {
    if (status === "completed") {
      return <Badge variant="outline" className="border-green-500/50 text-green-500">완료</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return format(new Date(dateString), "PPP", { locale: ko })
  }

  const formatShortDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return format(new Date(dateString), "M월 d일", { locale: ko })
  }

  const calculateDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null
    const days = differenceInDays(new Date(endDate), new Date())
    return days > 0 ? days : 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const { subscription, transactions } = billingData || {}
  const hasSubscription = !!subscription
  const isCanceled = !!subscription?.canceledAt
  const isActive = subscription?.status === "active" && !isCanceled

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">구독 및 결제 관리</p>
      </div>

      {/* Current Plan */}
      {hasSubscription ? (
        <Card className="border-border rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  HuDy Pro
                  {getStatusBadge(subscription)}
                </CardTitle>
                <CardDescription className="mt-1.5">
                  <span className="text-2xl font-bold text-foreground">$3</span>
                  <span className="text-muted-foreground">/월</span>
                </CardDescription>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Canceled Notice Banner */}
            {isCanceled && (
              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-yellow-500">구독이 해지 예약되었습니다</p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.endsAt && (
                      <>
                        {formatDate(subscription.endsAt)}까지 이용 가능합니다.
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">구독 시작일</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(subscription.startsAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    {isCanceled ? "이용 만료일" : "다음 결제일"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(isCanceled ? subscription.endsAt : subscription.nextBilledAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">현재 결제 기간</p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.currentPeriodStart && subscription.currentPeriodEnd
                      ? `${formatShortDate(subscription.currentPeriodStart)} ~ ${formatShortDate(subscription.currentPeriodEnd)}`
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Zap className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">남은 일수</p>
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      const targetDate = isCanceled ? subscription.endsAt : subscription.nextBilledAt
                      const daysRemaining = calculateDaysRemaining(targetDate)
                      return daysRemaining !== null ? `${daysRemaining}일` : "-"
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            {isActive && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">구독 취소</p>
                    <p className="text-sm text-muted-foreground">
                      구독을 취소하면 현재 결제 기간이 끝날 때까지 이용 가능합니다
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isCanceling}>
                        {isCanceling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            처리 중...
                          </>
                        ) : (
                          "구독 취소"
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>구독을 취소하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>구독을 취소하면:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>현재 결제 기간이 끝날 때까지 HuDy Pro를 계속 이용할 수 있습니다</li>
                            <li>다음 결제가 진행되지 않습니다</li>
                            <li>만료 후 Free 플랜으로 자동 전환됩니다</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancelSubscription}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          구독 취소
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        /* No Subscription - Resubscribe */
        <div className="space-y-6">
          {/* Status Banner */}
          <Card className="relative rounded-xl border-border overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                    <XCircle className="h-6 w-6 text-primary/70" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-semibold text-foreground">구독이 만료되었습니다</h3>
                      <Badge variant="outline" className="border-primary/30 text-primary text-xs">만료</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Pro 기능을 다시 이용하려면 구독을 재개하세요
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resubscribe Card */}
          <Card className="relative rounded-xl border-primary/15 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
                {/* Left: Plan info + Features */}
                <div className="flex-1 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-5 w-5 text-primary" />
                      <span className="text-lg font-bold text-foreground">HuDy Pro</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      모든 기능을 하나의 요금제로
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
                    {HUDY_PRO_PLAN.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2.5">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Pricing + CTA */}
                <div className="lg:w-[260px] shrink-0">
                  <div className="rounded-xl bg-muted/50 border border-border p-6 space-y-5">
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold tracking-tight text-foreground">$3</span>
                        <span className="text-muted-foreground">/월</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">30일 무료 체험 포함</p>
                    </div>
                    <Button asChild size="lg" className="w-full group">
                      <Link href="/checkout">
                        다시 시작하기
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment History */}
      {transactions && transactions.length > 0 && (
        <Card className="border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">결제 내역</CardTitle>
            <CardDescription>과거 결제 기록을 확인할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">영수증</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell>
                      {transaction.currency.toUpperCase()} ${transaction.amount}
                    </TableCell>
                    <TableCell>{getTransactionStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-right">
                      {transaction.invoiceUrl ? (
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={transaction.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2"
                          >
                            다운로드
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty State for No Transactions */}
      {(!transactions || transactions.length === 0) && hasSubscription && (
        <Card className="border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">결제 내역</CardTitle>
            <CardDescription>과거 결제 기록을 확인할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">결제 내역이 없습니다</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
