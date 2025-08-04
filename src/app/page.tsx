import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import CTASection from '@/components/landing/CTASection'
import IntegrationSection from '@/components/landing/IntegrationSection'
import DemoSection from '@/components/landing/DemoSection'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection id='features' />
      <DemoSection id='demo' />
      <IntegrationSection id='integrations' />
      <TestimonialsSection id='testimonials' />
      {/* <CTASection /> */}
      <Footer />
    </div>
  )
}