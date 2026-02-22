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
  /Yeti|Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|facebookexternalhit|Twitterbot|LinkedInBot|crawler|spider|bot/i

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Webhook 경로는 인증 없이 통과
  if (pathname.startsWith('/api/webhook')) {
    return NextResponse.next()
  }

  // 검색엔진 봇은 세션 체크 없이 바로 통과
  const userAgent = request.headers.get('user-agent') ?? ''
  if (BOT_UA_PATTERN.test(userAgent)) {
    return NextResponse.next()
  }

  // 공개 경로는 세션 체크 없이 통과
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith('/api/'))) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
