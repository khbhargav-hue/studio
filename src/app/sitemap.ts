import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.turfista.in';

  // Static routes
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
    '/teams',
    '/challenges',
    '/mysuru',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Note: For a fully persistent sitemap with dynamic turfs, 
  // one would normally fetch the turf IDs from Firestore here.
  // For the MVP, we prioritize the core discovery routes.

  return [...routes];
}