import type { Metadata } from "next"
import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { StatsSection } from "@/components/landing/stats-section"
import { GlobeSection } from "@/components/landing/globe-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { DocsSection } from "@/components/landing/docs-section"
import { FaqSection } from "@/components/landing/faq-section"
import { faqs } from "@/lib/faq-data"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "HuDy - 대한민국 공휴일 API | 영업일 계산 · 커스텀 공휴일 · MCP 서버",
  description:
    "대한민국 공휴일 조회, 영업일 계산, 커스텀 공휴일 관리를 위한 REST API. Node.js · Python SDK와 MCP 서버를 지원합니다. 한 줄의 API 호출로 공휴일 데이터를 통합하세요.",
  alternates: {
    canonical: "https://www.hudy.co.kr",
  },
}

function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'HuDy',
        url: 'https://www.hudy.co.kr',
        description: '대한민국 공휴일 조회, 영업일 계산, 커스텀 공휴일 관리를 위한 REST API.',
        inLanguage: 'ko',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.hudy.co.kr/#docs',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'HuDy API',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        url: 'https://www.hudy.co.kr',
        description: '대한민국 공휴일 조회 및 영업일 계산 REST API. 커스텀 공휴일 등록, MCP 서버 지원.',
        offers: {
          '@type': 'Offer',
          price: '3',
          priceCurrency: 'USD',
          description: '월 $3 단일 요금제, 30일 무료 체험',
          priceValidUntil: '2026-12-31',
        },
        featureList: [
          '대한민국 법정 공휴일 조회',
          '대체 공휴일, 임시 공휴일 포함',
          '영업일 계산 (영업일 수 계산, 영업일 더하기/빼기)',
          '커스텀 공휴일 등록 및 관리',
          'MCP 서버 지원 (Claude, Cursor 등)',
          'Node.js / Python 공식 SDK',
          'REST API / JSON 응답',
          '100ms 이내 응답 속도',
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '50',
        },
      },
      {
        '@type': 'Organization',
        name: 'HuDy',
        url: 'https://www.hudy.co.kr',
        logo: 'https://www.hudy.co.kr/hudy-icon.webp',
        sameAs: [
          'https://www.npmjs.com/package/@hudy-sdk/sdk',
          'https://pypi.org/project/hudy-sdk/',
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '홈',
            item: 'https://www.hudy.co.kr',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export default function Page() {
  return (
    <>
      <JsonLd />
      <main>
        <Navbar />
        <HeroSection />
        <StatsSection />
        <GlobeSection />
        <FeaturesSection />
        <PricingSection />
        <DocsSection />
        <FaqSection />
        <Footer />
      </main>
    </>
  )
}
