import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { StatsSection } from "@/components/landing/stats-section"
import { GlobeSection } from "@/components/landing/globe-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { DocsSection } from "@/components/landing/docs-section"
import { Footer } from "@/components/landing/footer"

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
          price: '0',
          priceCurrency: 'KRW',
          description: 'Free 플랜 제공',
        },
        featureList: [
          '대한민국 법정 공휴일 조회',
          '영업일 계산 (영업일 수 계산, 영업일 더하기/빼기)',
          '커스텀 공휴일 등록 및 관리',
          'MCP 서버 지원 (Claude, Cursor 등)',
          'REST API / JSON 응답',
        ],
      },
      {
        '@type': 'Organization',
        name: 'HuDy',
        url: 'https://www.hudy.co.kr',
        logo: 'https://www.hudy.co.kr/hudy-icon.webp',
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
        <Footer />
      </main>
    </>
  )
}
