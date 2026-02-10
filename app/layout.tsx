import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'HuDy - 대한민국 공휴일 API',
  description: '대한민국 공휴일을 쉽게 조회하고, 나만의 커스텀 공휴일을 추가하세요. 개발자를 위한 프리미엄 공휴일 API 서비스.',
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
