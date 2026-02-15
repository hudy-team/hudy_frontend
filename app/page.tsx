import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { StatsSection } from "@/components/landing/stats-section"
import { GlobeSection } from "@/components/landing/globe-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { DocsSection } from "@/components/landing/docs-section"
import { Footer } from "@/components/landing/footer"

export default function Page() {
  return (
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
  )
}
