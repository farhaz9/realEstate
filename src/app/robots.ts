
import { MetadataRoute } from 'next';

const URL = process.env.NEXT_PUBLIC_APP_URL || 'https://delhi-estate-luxe.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/settings'],
    },
    sitemap: `${URL}/sitemap.xml`,
  };
}
