
import { MetadataRoute } from 'next';

const URL = process.env.NEXT_PUBLIC_APP_URL || 'https://delhi-estate-luxe.com';

// This function will be executed at build time on the server.
// We cannot use client-side Firebase SDK here.
// For a dynamic sitemap with Firestore data, you would need to use the Firebase Admin SDK.
// Since this environment doesn't support the Admin SDK, we'll create a static sitemap
// and can enhance it later if server-side data fetching is enabled.

async function getDynamicPaths() {
  // This is a placeholder. In a real scenario with server-side capabilities,
  // you would fetch data from Firestore using the Admin SDK here.
  // For now, it returns an empty array to prevent build errors.
  return Promise.resolve([]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/properties',
    '/interiors',
    '/professionals',
    '/services',
    '/contact',
    '/pricing',
    '/login',
    '/about',
    '/privacy-policy',
    '/terms-and-conditions',
    '/refund-policy',
  ].map(route => ({
    url: `${URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
  
  // Since getDynamicPaths is a placeholder, we'll just return static routes for now.
  // This resolves the build error.
  const dynamicRoutes: MetadataRoute.Sitemap = await getDynamicPaths().catch(err => {
      console.error("Sitemap generation for dynamic paths failed, returning static paths only. Error:", err);
      return [];
  });
  
  return [...staticRoutes, ...dynamicRoutes];
}
