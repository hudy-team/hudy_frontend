import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if user has any existing API keys
        const { data: existingKeys, error: keysError } = await supabase
          .from('api_keys')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        // If no keys exist, create default API key
        if (!keysError && (!existingKeys || existingKeys.length === 0)) {
          const defaultKey = 'hd_live_' + randomBytes(16).toString('hex')

          const { error: insertError } = await supabase
            .from('api_keys')
            .insert({
              user_id: user.id,
              key: defaultKey,
              name: 'Default'
            })

          if (insertError) {
            console.error('Failed to create default API key:', insertError)
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
