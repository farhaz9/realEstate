
import { MetadataRoute } from 'next';

const URL = 'https://www.farhazhomes.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/properties',
    '/services',
    '/contact',
  ];

  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${URL}${route}`,
    lastModified,
  }));
}
