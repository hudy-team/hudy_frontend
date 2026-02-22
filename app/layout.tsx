import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

const SITE_URL = 'https://www.hudy.co.kr'
const SITE_NAME = 'HuDy'
const SITE_DESCRIPTION = '대한민국 공휴일 조회, 영업일 계산, 커스텀 공휴일 관리를 위한 REST API. 한 줄의 API 호출로 공휴일 데이터를 통합하세요.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'HuDy - 대한민국 공휴일 API',
    template: '%s | HuDy',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    '공휴일 API',
    '대한민국 공휴일',
    'Korean holidays API',
    '영업일 계산',
    '공휴일 조회',
    'REST API',
    '커스텀 공휴일',
    'business day calculator',
    'holiday API Korea',
    '한국 공휴일 API',
    'MCP 서버',
  ],
  authors: [{ name: 'HuDy' }],
  creator: 'HuDy',
  icons: {
    icon: '/hudy-icon.webp',
    apple: '/hudy-icon.webp',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'HuDy - 대한민국 공휴일 API',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HuDy - 대한민국 공휴일 API 서비스',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HuDy - 대한민국 공휴일 API',
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
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
