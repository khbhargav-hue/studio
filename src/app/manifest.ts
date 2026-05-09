
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Turfista | Premium Sports Turf Discovery',
    short_name: 'Turfista',
    description: 'Find and book the best sports turfs in Mysuru.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#39FF14',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
