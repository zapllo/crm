import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import DemoSection from '@/components/landing/DemoSection'
import IntegrationSection from '@/components/landing/IntegrationSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'

export const metadata = {
  title: 'Zapllo CRM - AI-Powered Customer Relationship Management Platform',
  description: 'Transform your business with Zapllo\'s intelligent CRM platform. AI-powered lead scoring, automated workflows, smart quotations, and seamless integrations with 20,000+ apps. Start your free trial today.',
  keywords: 'CRM, AI CRM, customer relationship management, sales automation, lead management, business growth, SaaS, India CRM',
  openGraph: {
    title: 'Zapllo CRM - The Future of Customer Relationship Management',
    description: 'Join 15,000+ businesses using AI-powered CRM to automate sales, manage customers, and drive growth. Features smart quotations, voice calling, and 20K+ integrations.',
    url: 'https://crm.zapllo.com',
    siteName: 'Zapllo CRM',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Zapllo CRM Dashboard Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zapllo CRM - AI-Powered Growth Platform',
    description: 'Transform your customer relationships with AI-powered CRM. Smart automation, predictive analytics, and seamless integrations.',
    images: ['/og-image.jpg'],
    creator: '@zapllohq',
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
  verification: {
    google: 'your-google-verification-code',
  },
}

// Schema.org structured data
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Zapllo CRM',
  description: 'AI-powered customer relationship management platform for modern businesses',
  url: 'https://crm.zapllo.com',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'CRM',
  operatingSystem: 'Web, iOS, Android',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: '7-day free trial',
  },
  provider: {
    '@type': 'Organization',
    name: 'Zapllo Technologies',
    url: 'https://zapllo.com',
    logo: 'https://crm.zapllo.com/logo.png',
    sameAs: [
      'https://twitter.com/zapllohq',
      'https://linkedin.com/company/zapllo',
      'https://facebook.com/zapllohq',
    ],
  },
  featureList: [
    'AI-Powered Lead Scoring',
    'Smart Contact Management', 
    'Automated Quotation Generation',
    'Voice Calling Integration',
    'Advanced Analytics & Reporting',
    '20,000+ App Integrations',
    'Mobile Apps (iOS & Android)',
    'Real-time Collaboration',
  ],
  screenshot: 'https://crm.zapllo.com/demo/dashboard.png',
  softwareVersion: '2.0',
  releaseNotes: 'Major update with AI features and enhanced integrations',
  requirements: 'Modern web browser, Internet connection',
  permissions: 'contacts, calendar, notifications',
}

export default function LandingPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <FeaturesSection id="features" />
          <DemoSection id="demo" />
          <IntegrationSection id="integrations" />
          <TestimonialsSection id="testimonials" />
        </main>
        <Footer />
      </div>
    </>
  )
}