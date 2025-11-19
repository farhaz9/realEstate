
import { MetadataRoute } from 'next';

const URL = 'https://www.farhazhomes.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/properties',
    '/builders',
    '/interiors',
    '/services',
    '/recommendations',
    '/contact',
  ];

  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${URL}${route}`,
    lastModified,
  }));
}
