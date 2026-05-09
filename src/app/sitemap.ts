
import { MetadataRoute } from 'next';

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

  // Note: For dynamic turfs in production, you would fetch all IDs from Firestore here.
  // Example: 
  // const turfs = await getTurfsFromFirestore();
  // const turfRoutes = turfs.map(t => ({ url: `${baseUrl}/turf/${t.id}`, ... }));

  return [...routes];
}
