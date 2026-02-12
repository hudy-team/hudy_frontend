import { NextResponse } from "next/server"

import { signApiKeyToken } from "@/lib/api-key-token"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const ONE_DAY_SECONDS = 24 * 60 * 60

type RouteContext = {
  params: Promise<{ id: string }>
}

function parseTtlDays(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? "", 10)
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 365
  }
  return Math.min(parsed, 3650)
}

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params

  const secret = process.env.API_KEY_JWT_SECRET
  if (!secret) {
    return NextResponse.json(
      { message: "Server configuration error: missing API_KEY_JWT_SECRET" },
      { status: 500 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { data: apiKey, error: keyError } = await supabase
    .from("api_keys")
    .select("id, user_id, is_active, token_version")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (keyError) {
    return NextResponse.json({ message: "Failed to load API key" }, { status: 500 })
  }

  if (!apiKey) {
    return NextResponse.json({ message: "API key not found" }, { status: 404 })
  }

  if (!apiKey.is_active) {
    return NextResponse.json(
      { message: "Inactive API key cannot issue token" },
      { status: 400 },
    )
  }

  const now = Math.floor(Date.now() / 1000)
  const ttlDays = parseTtlDays(process.env.API_KEY_TOKEN_TTL_DAYS)
  const exp = now + ttlDays * ONE_DAY_SECONDS

  const token = signApiKeyToken(
    {
      api_key_id: apiKey.id,
      user_id: user.id,
      token_version: apiKey.token_version,
      iat: now,
      exp,
    },
    secret,
  )

  return NextResponse.json(
    {
      token,
      api_key_id: apiKey.id,
      token_version: apiKey.token_version,
      expires_at: new Date(exp * 1000).toISOString(),
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  )
}
