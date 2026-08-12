"use server"

import * as Sentry from "@sentry/nextjs"
import { createClient } from "@/lib/supabase/server"
import { getPaddleInstance } from "./get-paddle-instance"

export interface InvoiceUrlResult {
  url?: string
  error?: string
}

/**
 * 트랜잭션의 인보이스 PDF URL 을 지연 조회한다.
 *
 * 결제 내역 목록 로딩 시 전건을 순차 조회하면 N+1 이 되므로,
 * 사용자가 다운로드를 누른 시점에만 이 액션을 호출한다.
 * 다른 사용자의 트랜잭션 ID 를 넘겨 인보이스를 가로채지 못하도록
 * 트랜잭션의 customerId 가 호출자 본인의 customer_id 와 일치하는지 검증한다.
 */
export async function getInvoiceUrl(
  transactionId: string
): Promise<InvoiceUrlResult> {
  if (!transactionId) {
    return { error: "Invalid transaction" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: customerData } = await supabase
    .from("customers")
    .select("customer_id")
    .eq("user_id", user.id)
    .maybeSingle()

  const customerId = customerData?.customer_id
  if (!customerId) {
    return { error: "Not found" }
  }

  try {
    const paddle = getPaddleInstance()
    const transaction = await paddle.transactions.get(transactionId)

    // 소유자 검증: 본인 Paddle customer 의 트랜잭션만 허용
    if ((transaction as any).customerId !== customerId) {
      return { error: "Not found" }
    }

    const invoice = await paddle.transactions.getInvoicePDF(transactionId)
    const url = (invoice as any)?.url || null

    if (!url) {
      return { error: "Invoice not available" }
    }

    return { url }
  } catch (e) {
    console.error("[billing] Failed to fetch invoice PDF:", e)
    Sentry.captureException(e, { tags: { area: "paddle-invoice-url" } })
    return { error: "Invoice not available" }
  }
}
