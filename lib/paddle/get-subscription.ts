"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveSubscription } from "@/lib/subscription";

export async function getSubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return await getActiveSubscription(supabase, "*");
}
