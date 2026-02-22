import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인',
  description: 'HuDy에 로그인하고 대한민국 공휴일 API를 시작하세요. Google, GitHub 또는 이메일로 간편 로그인.',
  robots: { index: false, follow: false },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
