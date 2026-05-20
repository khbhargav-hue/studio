
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://turfista.in';

  const routes = [
    '',
    '/players',
    '/arenas',
    '/matches',
    '/leaderboard',
    '/profile',
    '/about',
    '/contact',
    '/partner',
    '/privacy',
    '/terms'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes];
}
