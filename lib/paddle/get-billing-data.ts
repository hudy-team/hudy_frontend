"use server"

import * as Sentry from "@sentry/nextjs"
import { createClient } from "@/lib/supabase/server"
import { getActiveSubscription } from "@/lib/subscription"
import { getPaddleInstance } from "./get-paddle-instance"

/** 결제 내역 목록에 표시할 최근 트랜잭션 건수 */
const TRANSACTION_LIMIT = 12

export interface BillingTransaction {
  id: string
  status: string
  amount: string
  currency: string
  createdAt: string
}

export interface BillingSubscription {
  id: string
  paddleSubscriptionId: string
  status: string
  startsAt: string | null
  endsAt: string | null
  canceledAt: string | null
  nextBilledAt: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
}

export interface BillingData {
  subscription: BillingSubscription | null
  transactions: BillingTransaction[]
  customerId: string | null
}

export async function getBillingData(): Promise<BillingData> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { subscription: null, transactions: [], customerId: null }
  }

  // 1~2. 활성 구독과 customer 는 서로 독립이므로 병렬로 조회한다
  const [subData, { data: customerData }] = await Promise.all([
    getActiveSubscription(supabase, "*"),
    supabase
      .from("customers")
      .select("customer_id")
      .eq("user_id", user.id)
      .maybeSingle(),
  ])

  const customerId = customerData?.customer_id || null

  let subscription: BillingSubscription | null = null
  const transactions: BillingTransaction[] = []

  // 3. If we have a paddle subscription ID, get fresh data from Paddle
  if (subData?.paddle_subscription_id) {
    try {
      const paddle = getPaddleInstance()
      const paddleSub = await paddle.subscriptions.get(subData.paddle_subscription_id)

      // Detect scheduled cancellation from Paddle API
      const scheduledChange = (paddleSub as any).scheduledChange
      const isScheduledCancel = scheduledChange?.action === "cancel"

      subscription = {
        id: subData.id,
        paddleSubscriptionId: subData.paddle_subscription_id,
        status: subData.status,
        startsAt: subData.starts_at,
        endsAt: isScheduledCancel ? scheduledChange.effectiveAt : subData.ends_at,
        canceledAt: isScheduledCancel ? (subData.canceled_at || new Date().toISOString()) : subData.canceled_at,
        nextBilledAt: (paddleSub as any).nextBilledAt || null,
        currentPeriodStart: (paddleSub as any).currentBillingPeriod?.startsAt || null,
        currentPeriodEnd: (paddleSub as any).currentBillingPeriod?.endsAt || null,
      }
    } catch (e) {
      console.error("[billing] Failed to fetch Paddle subscription:", e)
      Sentry.captureException(e, { tags: { area: "paddle-billing-subscription" } })
      // Fallback to DB data only
      subscription = {
        id: subData.id,
        paddleSubscriptionId: subData.paddle_subscription_id,
        status: subData.status,
        startsAt: subData.starts_at,
        endsAt: subData.ends_at,
        canceledAt: subData.canceled_at,
        nextBilledAt: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
      }
    }
  } else if (subData) {
    subscription = {
      id: subData.id,
      paddleSubscriptionId: subData.paddle_subscription_id || "",
      status: subData.status,
      startsAt: subData.starts_at,
      endsAt: subData.ends_at,
      canceledAt: subData.canceled_at,
      nextBilledAt: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
    }
  }

  // 4. Get transactions from Paddle API if customer exists
  //    인보이스 PDF 는 여기서 조회하지 않는다 (전건 순차 조회 = N+1).
  //    사용자가 다운로드를 누를 때 getInvoiceUrl 서버 액션으로 지연 조회한다.
  if (customerId) {
    try {
      const paddle = getPaddleInstance()
      const txCollection = await paddle.transactions.list({
        customerId: [customerId],
        status: ["completed", "paid"],
        perPage: TRANSACTION_LIMIT,
      })

      for await (const tx of txCollection) {
        if (transactions.length >= TRANSACTION_LIMIT) break

        const details = (tx as any).details
        const total = details?.totals?.total || "0"
        const currencyCode = (tx as any).currencyCode || "USD"

        transactions.push({
          id: tx.id,
          status: tx.status || "unknown",
          amount: (parseInt(total) / 100).toFixed(2),
          currency: currencyCode,
          createdAt: (tx as any).createdAt || new Date().toISOString(),
        })
      }
    } catch (e) {
      console.error("[billing] Failed to fetch transactions:", e)
      Sentry.captureException(e, { tags: { area: "paddle-billing-transactions" } })
    }
  }

  return { subscription, transactions, customerId }
}
