import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // 세션 갱신이 필요한 경로만 매칭한다.
  // '/checkout' 을 단독으로 등재하는 이유: ':path*' 는 자기 자신(부모 경로)을 매칭하지 않으며,
  // checkout 서버 컴포넌트에서는 쿠키 쓰기가 무효라 미들웨어의 세션 갱신에 의존한다.
  matcher: ['/dashboard', '/dashboard/:path*', '/checkout', '/checkout/:path*'],
}
