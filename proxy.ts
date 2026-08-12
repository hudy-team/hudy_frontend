import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

// 인증이 필요 없는 공개 경로
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/terms',
  '/privacy',
  '/checkout',
  '/feed.xml',
  '/sitemap.xml',
  '/robots.txt',
]

// 검색엔진 봇 User-Agent 패턴
const BOT_UA_PATTERN =
  /Yeti|Googlebot|Google-InspectionTool|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Applebot|facebookexternalhit|Twitterbot|LinkedInBot|Discordbot|TelegramBot|WhatsApp|Naverbot|Daumoa|AhrefsBot|SemrushBot/i

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Webhook 경로는 인증 없이 통과
  if (pathname.startsWith('/api/webhook')) {
    return NextResponse.next()
  }

  // API 라우트는 자체적으로 인증을 처리하므로 세션 체크 없이 통과
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // 인증이 필요한 보호 경로
  const isProtectedPath = pathname.startsWith('/dashboard')

  // 검색엔진 봇은 공개 영역에 한해 세션 체크 없이 통과
  // (보호 경로는 UA와 무관하게 항상 세션을 검사한다)
  if (!isProtectedPath) {
    const userAgent = request.headers.get('user-agent') ?? ''
    if (BOT_UA_PATTERN.test(userAgent)) {
      return NextResponse.next()
    }
  }

  // 공개 경로는 세션 체크 없이 통과
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
