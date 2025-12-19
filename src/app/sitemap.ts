
import { MetadataRoute } from 'next';
import { collection, getDocs, query } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase'; // Assuming a simplified init

const URL = process.env.NEXT_PUBLIC_APP_URL || 'https://delhi-estate-luxe.com';

async function getDynamicPaths() {
  const { firestore } = initializeFirebase();
  
  const propertiesSnapshot = await getDocs(query(collection(firestore, 'properties')));
  const propertyPaths = propertiesSnapshot.docs.map(doc => ({
    url: `${URL}/properties/${doc.id}`,
    lastModified: doc.data().dateListed?.toDate() || new Date(),
  }));

  const professionalsSnapshot = await getDocs(query(collection(firestore, 'users')));
  const professionalPaths = professionalsSnapshot.docs.map(doc => ({
    url: `${URL}/professionals/${doc.id}`,
    lastModified: doc.data().dateJoined?.toDate() || new Date(),
  }));

  return [...propertyPaths, ...professionalPaths];
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
    '/support',
    '/privacy-policy',
    '/terms-and-conditions',
    '/refund-policy',
  ].map(route => ({
    url: `${URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
  
  try {
    const dynamicRoutes = await getDynamicPaths();
    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error("Failed to generate dynamic sitemap paths:", error);
    return staticRoutes;
  }
}
