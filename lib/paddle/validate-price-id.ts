import { HUDY_PRO_PLAN, isPriceWithTrial } from "./pricing-config";
import { createClient as createServiceClient } from "@supabase/supabase-js";

function createAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

/**
 * 서버 측에서 priceId를 검증하고, 필요시 무료체험 없는 버전으로 교체합니다.
 *
 * @param userEmail - 현재 사용자 이메일
 * @returns 검증된 Price ID (무료체험 이력이 있으면 noTrial 버전으로 교체)
 */
export async function validateAndGetPriceId(
  userEmail: string
): Promise<string> {
  const supabase = createAdminClient();

  // customers 테이블에서 무료체험 이력 확인
  const { data: customer } = await supabase
    .from("customers")
    .select("has_used_free_trial")
    .eq("email", userEmail)
    .single();

  // customer 레코드가 없으면 첫 구매 → 무료체험 허용
  if (!customer) {
    console.log(`[validate-price] No customer record for ${userEmail}, allowing free trial`);
    return HUDY_PRO_PLAN.priceId.month;
  }

  // 무료체험 사용 이력이 있으면 noTrial 버전으로 교체
  if (customer.has_used_free_trial) {
    console.log(`[validate-price] ${userEmail} already used free trial, using noTrial price`);
    return HUDY_PRO_PLAN.priceId.monthNoTrial;
  }

  // 이력 없으면 무료체험 제공
  console.log(`[validate-price] ${userEmail} eligible for free trial`);
  return HUDY_PRO_PLAN.priceId.month;
}
