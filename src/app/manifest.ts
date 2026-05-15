import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Turfista | Premium Sports Discovery',
    short_name: 'Turfista',
    description: 'Find and book the best sports turfs, join teams, and challenge opponents in Mysuru.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#AAFF00',
    orientation: 'portrait',
    icons: [
      {
        src: 'https://res.cloudinary.com/turfista/image/upload/v1/favicon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'https://res.cloudinary.com/turfista/image/upload/v1/favicon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
    ],
  };
}
