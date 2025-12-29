
import { MetadataRoute } from 'next';

const URL = 'https://estates.falconaxe.com';

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
  // Define static routes with their SEO priority and change frequency
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${URL}/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${URL}/properties?type=rent`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${URL}/properties?type=pg`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${URL}/professionals`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
     {
      url: `${URL}/interiors`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${URL}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${URL}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${URL}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
  
  // Placeholder for dynamic routes (e.g., individual properties, professionals)
  const dynamicRoutes: MetadataRoute.Sitemap = await getDynamicPaths().catch(err => {
      console.error("Sitemap generation for dynamic paths failed, returning static paths only. Error:", err);
      return [];
  });
  
  return [...staticRoutes, ...dynamicRoutes];
}
