import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * 현재 사용자의 활성 구독 1건을 조회한다.
 *
 * RLS 로 user_id 스코프가 걸려 있으므로 별도 user 필터 없이도 호출자 본인의 행만 반환된다.
 * 서버 클라이언트(`lib/supabase/server`)와 브라우저 클라이언트(`lib/supabase/client`) 모두 인자로 받을 수 있다.
 * 취소된 중복 구독을 피하기 위해 status='active' 로 필터하고 최신 1건만 가져온다.
 *
 * @param columns 조회할 컬럼 (기본: "id")
 * @returns 활성 구독 행 또는 null
 */
export async function getActiveSubscription(
  supabase: SupabaseClient<any, any, any>,
  columns = "id"
): Promise<Record<string, any> | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select(columns)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return data as Record<string, any>
}

/** 활성 구독 보유 여부만 필요할 때 쓰는 헬퍼. */
export async function hasActiveSubscription(
  supabase: SupabaseClient<any, any, any>
): Promise<boolean> {
  return (await getActiveSubscription(supabase)) !== null
}
