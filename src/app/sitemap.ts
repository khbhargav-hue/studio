
import { MetadataRoute } from 'next';
import { MOCK_TURFS } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://turfista.vercel.app';

  const routes = [
    '',
    '/about',
    '/contact',
    '/areas',
    '/featured',
    '/partner',
    '/privacy',
    '/terms',
    '/disclaimer',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const turfRoutes = MOCK_TURFS.map(t => ({
    url: `${baseUrl}/turf/${t.id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...routes, ...turfRoutes];
}
