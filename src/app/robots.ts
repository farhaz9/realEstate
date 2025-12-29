
import { MetadataRoute } from 'next';

const URL = 'https://estates.falconaxe.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin', 
          '/settings', 
          '/login', 
          '/profile',
          '/add-property'
        ],
      },
    ],
    sitemap: `${URL}/sitemap.xml`,
  };
}
