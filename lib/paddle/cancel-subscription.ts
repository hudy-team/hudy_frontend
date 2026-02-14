"use server";

import { createClient } from "@/lib/supabase/server";
import { getPaddleInstance } from "./get-paddle-instance";

export async function cancelSubscription(subscriptionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify ownership
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("paddle_subscription_id")
    .eq("id", subscriptionId)
    .eq("user_id", user.id)
    .single();

  if (!subscription?.paddle_subscription_id) {
    return { error: "Subscription not found" };
  }

  try {
    const paddle = getPaddleInstance();
    await paddle.subscriptions.cancel(subscription.paddle_subscription_id, {
      effectiveFrom: "next_billing_period",
    });

    await supabase
      .from("subscriptions")
      .update({
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId);

    return { success: true };
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return { error: "Failed to cancel subscription" };
  }
}
