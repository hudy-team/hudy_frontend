import { createClient } from "@/lib/supabase/client"

export interface CalendarToken {
  id: string
  user_id: string
  token: string
  include_custom: boolean
  created_at: string
  updated_at: string
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(48))
  return Array.from(bytes)
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 64)
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
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) throw new Error("인증 정보를 확인할 수 없습니다.")

  const { data, error } = await supabase
    .from("calendar_tokens")
    .insert({
      user_id: user.id,
      token: generateToken(),
      include_custom: true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function regenerateCalendarToken(): Promise<CalendarToken> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) throw new Error("인증 정보를 확인할 수 없습니다.")

  // 기존 토큰 삭제
  await supabase.from("calendar_tokens").delete().eq("user_id", user.id)

  // 새 토큰 생성
  return createCalendarToken()
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
