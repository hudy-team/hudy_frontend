import { EventEntity, EventName } from "@paddle/paddle-node-sdk";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getPaddleInstance } from "./get-paddle-instance";

function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

async function logWebhookEvent(
  eventType: string,
  payload: unknown,
  status: "processed" | "error" = "processed",
  errorMessage?: string
) {
  try {
    const supabase = createServiceClient();
    await supabase.from("webhook_events").insert({
      event_type: eventType,
      payload: payload as Record<string, unknown>,
      status,
      error_message: errorMessage,
    });
  } catch (e) {
    console.error("[webhook-log] Failed to log event:", e);
  }
}

export async function processWebhookEvent(eventData: EventEntity) {
  const eventType = eventData.eventType;
  console.log(`[webhook] Processing: ${eventType}`);

  try {
    switch (eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
      case EventName.SubscriptionCanceled:
        await handleSubscriptionEvent(eventData);
        break;
      case EventName.CustomerCreated:
      case EventName.CustomerUpdated:
        await handleCustomerEvent(eventData);
        break;
      case EventName.TransactionCompleted:
        await handleTransactionCompleted(eventData);
        break;
      default:
        console.log(`[webhook] Unhandled event: ${eventType}`);
    }
    await logWebhookEvent(eventType, eventData.data);
  } catch (error) {
    await logWebhookEvent(
      eventType,
      eventData.data,
      "error",
      error instanceof Error ? error.message : "Unknown"
    );
    throw error; // Re-throw so webhook route returns 500 → Paddle retries
  }
}

function mapPaddleStatus(paddleStatus: string): string {
  switch (paddleStatus) {
    case "active":
    case "trialing":
    case "past_due": // Keep as active during payment retry period
      return "active";
    case "canceled":
      return "canceled";
    case "paused":
      return "paused";
    default:
      return "inactive";
  }
}

async function cancelDuplicateSubscriptions(
  supabase: ReturnType<typeof createServiceClient>,
  currentSubscriptionId: string,
  paddleCustomerId: string,
  userId: string | null
) {
  console.log(
    `[duplicate-check] Checking for duplicates: current=${currentSubscriptionId}`
  );

  // Query for other active subscriptions
  let query = supabase
    .from("subscriptions")
    .select("paddle_subscription_id, created_at")
    .eq("status", "active")
    .neq("paddle_subscription_id", currentSubscriptionId);

  // Match by user_id if available, otherwise by customer_id
  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    query = query.eq("paddle_customer_id", paddleCustomerId);
  }

  const { data: duplicates, error } = await query;

  if (error) {
    console.error("[duplicate-check] Query failed:", error);
    throw error;
  }

  if (!duplicates || duplicates.length === 0) {
    console.log("[duplicate-check] No duplicates found");
    return;
  }

  console.log(
    `[duplicate-check] Found ${duplicates.length} duplicate(s), cancelling older ones`
  );

  const paddle = getPaddleInstance();

  for (const dup of duplicates) {
    try {
      console.log(
        `[duplicate-cancel] Cancelling ${dup.paddle_subscription_id}`
      );
      await paddle.subscriptions.cancel(dup.paddle_subscription_id, {
        effectiveFrom: "immediately",
      });
      console.log(
        `[duplicate-cancel] Successfully cancelled ${dup.paddle_subscription_id}`
      );
    } catch (cancelError) {
      console.error(
        `[duplicate-cancel] Failed to cancel ${dup.paddle_subscription_id}:`,
        cancelError
      );
      // Continue cancelling other duplicates even if one fails
    }
  }
}

async function handleSubscriptionEvent(eventData: EventEntity) {
  const supabase = createServiceClient();
  const data = eventData.data as unknown as Record<string, unknown>;
  const paddleSubscriptionId = data.id as string;
  const paddleCustomerId = data.customerId as string;

  const items = data.items as Array<{ price?: { id?: string } }> | undefined;
  const priceId = items?.[0]?.price?.id ?? null;
  const status = mapPaddleStatus(data.status as string);

  console.log(
    `[subscription] ${eventData.eventType}: ${paddleSubscriptionId} customer=${paddleCustomerId} status=${status}`
  );

  // Calculate ends_at
  let endsAt: string | null = null;
  const scheduledChange = data.scheduled_change as
    | { action?: string; effective_at?: string }
    | undefined;
  const currentBillingPeriod = data.currentBillingPeriod as
    | { endsAt?: string }
    | undefined;

  if (scheduledChange?.action === "cancel") {
    endsAt = scheduledChange.effective_at || null;
  } else if (data.next_billed_at) {
    endsAt = data.next_billed_at as string;
  } else if (currentBillingPeriod?.endsAt) {
    endsAt = currentBillingPeriod.endsAt;
  }

  // Try to find user_id from customers table
  const { data: customerData } = await supabase
    .from("customers")
    .select("user_id")
    .eq("customer_id", paddleCustomerId)
    .single();

  const userId = customerData?.user_id || null;

  // Idempotent upsert on paddle_subscription_id
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      paddle_subscription_id: paddleSubscriptionId,
      paddle_customer_id: paddleCustomerId,
      paddle_price_id: priceId,
      status,
      starts_at: (data.startedAt as string) || new Date().toISOString(),
      ends_at: endsAt,
      canceled_at: status === "canceled" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "paddle_subscription_id" }
  );

  if (error) {
    console.error("[subscription] Upsert failed:", error);
    throw error;
  }

  console.log(
    `[subscription] Upserted: ${paddleSubscriptionId} status=${status} user=${userId || "unlinked"}`
  );

  // 구독 상태 변경에 따라 API 키 활성/비활성 처리
  // is_active 변경 시 notify_api_key_state_change 트리거가 api.hudy.co.kr 캐시 무효화
  if (userId) {
    const shouldBeActive = status === "active";
    const { error: keyError } = await supabase
      .from("api_keys")
      .update({ is_active: shouldBeActive, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (keyError) {
      console.error(`[subscription] API key ${shouldBeActive ? "activate" : "deactivate"} failed:`, keyError);
    } else {
      console.log(`[subscription] API keys ${shouldBeActive ? "activated" : "deactivated"} for user ${userId}`);
    }
  }

  // Auto-cancel duplicate subscriptions (only on creation)
  if (eventData.eventType === EventName.SubscriptionCreated) {
    try {
      await cancelDuplicateSubscriptions(
        supabase,
        paddleSubscriptionId,
        paddleCustomerId,
        userId
      );
    } catch (dupError) {
      console.error(
        "[subscription] Duplicate cancellation failed (non-fatal):",
        dupError
      );
      // Don't throw - let the main subscription creation succeed
    }
  }
}

async function handleCustomerEvent(eventData: EventEntity) {
  const supabase = createServiceClient();
  const data = eventData.data as unknown as Record<string, unknown>;
  const customerId = data.id as string;
  const email = data.email as string;

  console.log(
    `[customer] ${eventData.eventType}: ${customerId} email=${email}`
  );

  // Use RPC function instead of listUsers()
  const { data: userId } = await supabase.rpc("get_user_id_by_email", {
    lookup_email: email,
  });

  // Upsert customer record
  const { error } = await supabase.from("customers").upsert(
    {
      customer_id: customerId,
      email,
      user_id: userId || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "customer_id" }
  );

  if (error) {
    console.error("[customer] Upsert failed:", error);
    throw error;
  }

  // If user found, link any orphaned subscriptions
  if (userId) {
    const { data: orphanedSubs } = await supabase
      .from("subscriptions")
      .select("id, status")
      .eq("paddle_customer_id", customerId)
      .is("user_id", null);

    if (orphanedSubs && orphanedSubs.length > 0) {
      console.log(
        `[customer] Linking ${orphanedSubs.length} orphaned subscription(s) to user ${userId}`
      );
      for (const sub of orphanedSubs) {
        await supabase
          .from("subscriptions")
          .update({ user_id: userId, updated_at: new Date().toISOString() })
          .eq("id", sub.id);
      }
    }
  }

  console.log(
    `[customer] Upserted: ${customerId} user=${userId || "not found"}`
  );
}

async function handleTransactionCompleted(eventData: EventEntity) {
  const supabase = createServiceClient();
  const data = eventData.data as unknown as Record<string, unknown>;
  const customerId = data.customerId as string;

  if (!customerId) {
    console.log("[transaction.completed] No customer_id");
    return;
  }

  console.log(
    `[transaction.completed] Processing for customer ${customerId}`
  );

  // 1. Get customer email from Paddle API (with DB fallback)
  let customerEmail: string | null = null;

  try {
    const paddle = getPaddleInstance();
    const paddleCustomer = await paddle.customers.get(customerId);
    customerEmail = paddleCustomer.email;
  } catch {
    const { data: dbCustomer } = await supabase
      .from("customers")
      .select("email")
      .eq("customer_id", customerId)
      .single();
    customerEmail = dbCustomer?.email || null;
  }

  if (!customerEmail) {
    console.error(
      `[transaction.completed] No email for customer ${customerId}`
    );
    throw new Error(`No email found for customer ${customerId}`);
  }

  // 2. Upsert customer record using RPC instead of listUsers()
  const { data: userId } = await supabase.rpc("get_user_id_by_email", {
    lookup_email: customerEmail,
  });

  const { error: customerUpsertError } = await supabase
    .from("customers")
    .upsert(
      {
        customer_id: customerId,
        email: customerEmail,
        user_id: userId || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "customer_id" }
    );

  if (customerUpsertError) {
    console.error(
      "[transaction.completed] Customer upsert failed:",
      customerUpsertError
    );
    throw customerUpsertError;
  }

  // 3. Link orphaned subscriptions if user found
  if (userId) {
    const { data: orphanedSubs } = await supabase
      .from("subscriptions")
      .select("id, paddle_subscription_id, status")
      .eq("paddle_customer_id", customerId)
      .is("user_id", null);

    if (orphanedSubs && orphanedSubs.length > 0) {
      console.log(
        `[transaction.completed] Linking ${orphanedSubs.length} subscription(s) to user ${userId}`
      );

      for (const sub of orphanedSubs) {
        const { error: linkError } = await supabase
          .from("subscriptions")
          .update({ user_id: userId, updated_at: new Date().toISOString() })
          .eq("id", sub.id);

        if (linkError) {
          console.error(
            `[transaction.completed] Failed to link subscription ${sub.id}:`,
            linkError
          );
          throw linkError;
        }

        console.log(
          `[transaction.completed] Linked subscription ${sub.id} to user ${userId}`
        );
      }
    }

    console.log(
      `[transaction.completed] Successfully processed for customer ${customerId} → user ${userId}`
    );
  } else {
    console.warn(
      `[transaction.completed] No user found for email ${customerEmail}`
    );
    throw new Error(`No user found for email ${customerEmail}`);
  }
}
