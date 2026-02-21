import { AsyncLocalStorage } from "node:async_hooks";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AuthContext {
  apiKeyId: string;
  userId: string;
  apiKey: string;
}

export const authStore = new AsyncLocalStorage<AuthContext>();

export function getAuthContext(): AuthContext {
  const ctx = authStore.getStore();
  if (!ctx) throw new Error("No auth context available");
  return ctx;
}

export type ValidateResult =
  | { ok: true; context: AuthContext }
  | { ok: false; reason: "invalid_key" | "no_subscription" };

export async function validateApiKey(
  apiKey: string | null
): Promise<ValidateResult> {
  if (!apiKey) return { ok: false, reason: "invalid_key" };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, user_id, is_active")
    .eq("key", apiKey)
    .single();

  if (error || !data || !data.is_active)
    return { ok: false, reason: "invalid_key" };

  // 구독 상태 확인 - active 구독이 없으면 API 사용 불가
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", data.user_id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!subscription) return { ok: false, reason: "no_subscription" };

  return {
    ok: true,
    context: { apiKeyId: data.id, userId: data.user_id, apiKey },
  };
}
