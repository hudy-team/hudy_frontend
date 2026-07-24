import { createClient } from "@/lib/supabase/client"

export interface CalendarToken {
  id: string
  user_id: string
  token: string
  include_custom: boolean
  created_at: string
  updated_at: string
}

export async function getCalendarToken(): Promise<CalendarToken | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("calendar_tokens")
    .select("*")
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createCalendarToken(): Promise<CalendarToken> {
  const supabase = createClient()
  // 토큰 값은 서버(SECURITY DEFINER RPC)가 생성한다. 기존 토큰 삭제도 RPC 내부에서 처리된다.
  const { error } = await supabase.rpc("issue_calendar_token", {
    p_include_custom: true,
  })

  if (error) throw error

  const created = await getCalendarToken()
  if (!created) throw new Error("캘린더 토큰 생성에 실패했습니다.")
  return created
}

export async function regenerateCalendarToken(): Promise<CalendarToken> {
  const supabase = createClient()

  // 기존 토큰이 없으면 회전할 대상이 없으므로 신규 발급으로 처리한다.
  const existing = await getCalendarToken()
  if (!existing) return createCalendarToken()

  // 회전은 token 문자열만 교체하므로 include_custom 설정이 보존된다.
  const { error } = await supabase.rpc("rotate_calendar_token")
  if (error) throw error

  const rotated = await getCalendarToken()
  if (!rotated) throw new Error("캘린더 토큰 재생성에 실패했습니다.")
  return rotated
}

export async function updateIncludeCustom(
  id: string,
  includeCustom: boolean
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("calendar_tokens")
    .update({ include_custom: includeCustom, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}

export function getCalendarUrl(token: string): string {
  return `https://api.hudy.co.kr/v2/calendar/${token}.ics`
}
