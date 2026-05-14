import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.turfista.in';

  // Core static routes for discovery
  const routes = [
    '',
    '/teams',
    '/challenges',
    '/profile',
    '/featured',
    '/areas',
    '/about',
    '/contact',
    '/partner',
    '/privacy',
    '/terms',
    '/mysuru',
    '/mysuru/football',
    '/mysuru/cricket',
    '/mysuru/pickleball',
    '/mysuru/badminton'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // In a full production build, we would fetch all turf IDs from Firestore 
  // here to generate dynamic pages like /turf/[id]
  
  return [...routes];
}
