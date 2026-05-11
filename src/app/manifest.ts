
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Turfista | Premium Sports Discovery',
    short_name: 'Turfista',
    description: 'Find and book the best sports turfs, join teams, and challenge opponents in Mysuru.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#39FF14',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: 'https://picsum.photos/seed/turf-icon-192/192/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'https://picsum.photos/seed/turf-icon-512/512/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
    ],
  };
}
