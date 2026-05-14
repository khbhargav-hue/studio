import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from "@/firebase"
import GoogleAnalytics from '@/components/google-analytics';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { MobileNav } from '@/components/mobile-nav';

export const viewport: Viewport = {
  themeColor: '#AAFF00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.turfista.in'),
  title: {
    default: 'Turfista | Book Sports Turfs in Mysuru',
    template: '%s | Turfista'
  },
  description: 'Find and book elite football, cricket, and pickleball turfs in Mysuru. Join teams and accept match challenges on India\'s premier turf network.',
  keywords: ['Mysuru turf booking', 'Football turfs Mysore', 'Cricket turfs Mysuru', 'Turf challenges Mysuru', 'Pickleball Mysore'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.turfista.in',
    siteName: 'Turfista',
    title: 'Turfista | Mysuru\'s Elite Turf Network',
    description: 'Instant discovery and booking for premium sports arenas in Mysuru.',
    images: [
      {
        url: 'https://res.cloudinary.com/turfista/image/upload/v1/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Turfista Network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Turfista | Book Turfs in Mysuru',
    description: 'Premium sports discovery and match circuit platform.',
    images: ['https://res.cloudinary.com/turfista/image/upload/v1/og-image.jpg'],
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="canonical" href="https://www.turfista.in" />
      </head>
      <body className="bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        <GoogleAnalytics />
        <FirebaseClientProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1 pb-24 md:pb-0">
              {children}
            </main>
            <MobileNav />
            <Toaster />
          </div>
        </FirebaseClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
