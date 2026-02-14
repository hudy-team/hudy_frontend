"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCustomerId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email) {
    const { data: customerData } = await supabase
      .from("customers")
      .select("customer_id")
      .eq("email", user.email)
      .single();

    if (customerData?.customer_id) {
      return customerData.customer_id;
    }
  }
  return "";
}
