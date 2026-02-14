"use server"

import { createClient } from "@/lib/supabase/server"
import { getPaddleInstance } from "./get-paddle-instance"

export interface BillingTransaction {
  id: string
  status: string
  amount: string
  currency: string
  createdAt: string
  invoiceUrl: string | null
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

  // 1. Get active subscription from DB (filter by status to avoid canceled duplicates)
  const { data: subData } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  // 2. Get customer from DB
  const { data: customerData } = await supabase
    .from("customers")
    .select("customer_id")
    .eq("user_id", user.id)
    .single()

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
  if (customerId) {
    try {
      const paddle = getPaddleInstance()
      const txCollection = await paddle.transactions.list({
        customerId: [customerId],
        status: ["completed", "paid"],
      })

      // Iterate through transactions
      for await (const tx of txCollection) {
        let invoiceUrl: string | null = null

        // Try to get invoice PDF
        try {
          if (tx.id && tx.status === "completed") {
            const invoice = await paddle.transactions.getInvoicePDF(tx.id)
            invoiceUrl = (invoice as any)?.url || null
          }
        } catch {
          // Invoice might not be available
        }

        const details = (tx as any).details
        const total = details?.totals?.total || "0"
        const currencyCode = (tx as any).currencyCode || "USD"

        transactions.push({
          id: tx.id,
          status: tx.status || "unknown",
          amount: (parseInt(total) / 100).toFixed(2),
          currency: currencyCode,
          createdAt: (tx as any).createdAt || new Date().toISOString(),
          invoiceUrl,
        })
      }
    } catch (e) {
      console.error("[billing] Failed to fetch transactions:", e)
    }
  }

  return { subscription, transactions, customerId }
}
