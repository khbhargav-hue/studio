
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://turfista.com';

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

  // Note: For dynamic turfs, in a real production environment, 
  // you would fetch all IDs from Firestore here to include them in the sitemap.
  // Since this is a client-side environment, we'll stick to static routes 
  // or handle dynamic ones via Search Console discovery.

  return [...routes];
}
