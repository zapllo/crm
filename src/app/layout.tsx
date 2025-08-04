import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import { UserProvider } from "@/contexts/userContext";
import { ThemeLayoutWrapper } from "@/components/theme-layout-wrapper";
import { PermissionsProvider } from "@/contexts/permissionsContext";
import { PreloadPermissions } from "@/components/preload-permissions";
import Script from "next/script";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Zapllo CRM | AI-Powered Customer Relationship Management",
  description: "Zapllo CRM helps businesses build deeper customer relationships, automate sales workflows, and close deals 2x faster. Save 15+ hours weekly on administrative tasks. Perfect for SMEs & MSMEs.",
  keywords: "CRM software, business productivity, MSME solutions, sales automation, customer management, small business CRM, workflow automation, cloud CRM, AI CRM, productivity tools",
  authors: [{ name: "Zapllo Team" }],
  creator: "Zapllo",
  publisher: "Zapllo",
  applicationName: "Zapllo CRM",
  metadataBase: new URL("https://crm.zapllo.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://crm.zapllo.com",
    title: "Zapllo CRM | Smart Customer Relationship Management",
    description: "Transform your business with AI-powered customer management and sales automation. Save 15+ hours weekly on tasks and build deeper customer relationships.",
    siteName: "Zapllo CRM",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zapllo CRM Dashboard",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zapllo CRM | Intelligent Customer Management",
    description: "The smart CRM solution trusted by 10,000+ businesses to build deeper customer relationships and close deals faster.",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: "Business Software",
  verification: {
    // Add your verification codes when you have them
    google: "google-site-verification-code",
  },
  alternates: {
    canonical: "https://crm.zapllo.com",
    languages: {
      'en-US': "https://crm.zapllo.com",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
          async
        />
        {/* Structured data for rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Zapllo CRM",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "description": "AI-powered CRM software for SMEs and MSMEs to build better customer relationships and streamline sales processes",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1024"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Zapllo",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://zapllo.com/logo.png"
                }
              },
              "potentialAction": {
                "@type": "ViewAction",
                "target": "https://crm.zapllo.com/signup"
              }
            })
          }}
        />
        {/* Breadcrumb structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Zapllo",
                  "item": "https://zapllo.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Zapllo CRM",
                  "item": "https://crm.zapllo.com"
                }
              ]
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeLayoutWrapper>
          <NextTopLoader />
          <UserProvider>
            <PermissionsProvider>
              <PreloadPermissions />
              {children}
            </PermissionsProvider>
          </UserProvider>
        </ThemeLayoutWrapper>
      </body>
    </html>
  );
}
