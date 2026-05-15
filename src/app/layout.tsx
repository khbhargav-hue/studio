import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from "@/firebase"
import GoogleAnalytics from '@/components/google-analytics';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { FaviconProvider } from '@/components/favicon-provider';
import Script from 'next/script';

export const viewport: Viewport = {
  themeColor: '#AAFF00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://turfista.in'),
  title: {
    default: 'Turfista | Book Football Turf, Cricket Ground & Sports in Mysuru',
    template: '%s | Turfista'
  },
  description: 'Book football turf, cricket ground, pickleball court, swimming pool and coaching in Mysuru. Instant WhatsApp booking. 20+ venues. Turfista — Mysuru\'s #1 sports network.',
  keywords: ['football turf Mysuru', 'cricket ground Mysore', 'turf booking Mysuru', 'pickleball Mysuru', 'swimming pool Mysore', 'sports booking Mysuru', 'box cricket Mysore', 'Matchbox Mysore', 'football coaching Mysuru'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://turfista.in',
    siteName: 'Turfista',
    title: 'Turfista | Book Sports in Mysuru',
    description: 'Football, Cricket, Pickleball, Swimming & Coaching in Mysuru. Book via WhatsApp instantly.',
    images: [
      {
        url: 'https://turfista.in/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Turfista Network Mysuru',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Turfista | Mysuru Sports Booking',
    description: 'Premium sports discovery and match circuit platform in Mysuru.',
    images: ['https://turfista.in/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://turfista.in/',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {/* Local Business Schema (JSON-LD) */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsActivityLocation",
              "name": "Turfista",
              "description": "Book football turf, cricket, pickleball, swimming in Mysuru",
              "url": "https://turfista.in",
              "areaServed": "Mysuru, Karnataka, India",
              "telephone": "+917411322492",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Mysuru",
                "addressRegion": "Karnataka",
                "addressCountry": "IN"
              }
            })
          }}
        />
      </head>
      <body className="bg-[#0A0A0A] text-[#F5F5F5] antialiased selection:bg-[#AAFF00] selection:text-[#0A0A0A]">
        <GoogleAnalytics />
        <FirebaseClientProvider>
          <FaviconProvider />
          <div className="flex flex-col min-h-screen">
            <main className="flex-1 pb-20 md:pb-0">
              {children}
            </main>
            <Toaster />
          </div>
        </FirebaseClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}