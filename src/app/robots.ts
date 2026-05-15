import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/studio/', 
        '/login/', 
        '/admin/', 
        '/_next/', 
        '/api/'
      ],
    },
    sitemap: 'https://turfista.in/sitemap.xml',
    host: 'https://turfista.in'
  };
}
