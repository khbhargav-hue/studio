
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from "@/firebase"
import GoogleAnalytics from '@/components/google-analytics';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { MobileNav } from '@/components/mobile-nav';

export const viewport: Viewport = {
  themeColor: '#39FF14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://turfista.in'),
  title: {
    default: 'Turfista | Football, Cricket, Badminton & Pickleball in Mysuru',
    template: '%s | Turfista'
  },
  description: 'The elite platform to discover sports arenas, join teams, and challenge rivals in Mysuru. Play more, book easy.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Turfista',
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    title: 'Turfista | Premium Sports Community in Mysuru',
    description: 'Find your squad, book your pitch, and dominate the city circuits.',
    url: 'https://turfista.in',
    siteName: 'Turfista',
    locale: 'en_IN',
    type: 'website',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-foreground selection:bg-primary selection:text-primary-foreground antialiased">
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
