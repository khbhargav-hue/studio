
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from "@/firebase"

export const viewport: Viewport = {
  themeColor: '#39FF14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'Turfista | Book Football & Cricket Turfs in Mysuru',
    template: '%s | Turfista'
  },
  description: 'Find and book the best football, cricket, and pickleball turfs in Mysuru, Karnataka. Discover elite arenas with floodlights, parking, and premium facilities.',
  keywords: ['Mysuru Turfs', 'Mysore Football', 'Box Cricket Mysuru', 'Pickleball Mysore', 'Turf Booking Karnataka', 'Sports Arenas Mysuru'],
  authors: [{ name: 'Turfista Team' }],
  creator: 'Turfista',
  publisher: 'Turfista',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  metadataBase: new URL('https://turfista.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Turfista | Premium Sports Turf Discovery in Mysuru',
    description: 'The elite platform to discover and book sports arenas in Mysuru. Play more, book easy.',
    url: 'https://turfista.com',
    siteName: 'Turfista',
    images: [
      {
        url: '/og-image.jpg', // Placeholder for actual OG image
        width: 1200,
        height: 630,
        alt: 'Turfista - Premium Sports Discovery',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Turfista | Book Turfs in Mysuru',
    description: 'Find your perfect pitch in seconds. Football, Cricket, and Pickleball in Mysuru.',
    images: ['/og-image.jpg'],
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-body bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <FirebaseClientProvider>
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
