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

export async function validateApiKey(
  apiKey: string | null
): Promise<AuthContext | null> {
  if (!apiKey) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, user_id, is_active")
    .eq("key", apiKey)
    .single();

  if (error || !data || !data.is_active) return null;

  return {
    apiKeyId: data.id,
    userId: data.user_id,
    apiKey,
  };
}
