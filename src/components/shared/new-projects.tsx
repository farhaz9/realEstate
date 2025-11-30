
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import type { Property } from '@/types';
import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export function NewProjects() {
  const firestore = useFirestore();

  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Fetch a reasonable number of recent properties to group
    return query(collection(firestore, 'properties'), limit(50));
  }, [firestore]);

  const { data: properties, isLoading } = useCollection<Property>(propertiesQuery);

  const projectsByLocation = useMemo(() => {
    if (!properties) return {};
    return properties.reduce((acc, property) => {
      const location = property.location?.state;
      if (location) {
        if (!acc[location]) {
          acc[location] = [];
        }
        acc[location].push(property);
      }
      return acc;
    }, {} as Record<string, Property[]>);
  }, [properties]);

  const locations = Object.keys(projectsByLocation);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">New Projects in Delhi</h2>
           <div className="space-y-4">
              <Skeleton className="h-10 w-1/3" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
           </div>
        </div>
      </section>
    );
  }
  
  if (locations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">New Projects in Delhi</h2>
        <div className="h-1 w-20 bg-primary mb-8"></div>
        
        <Tabs defaultValue={locations[0]} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 h-auto">
            {locations.map((location) => (
              <TabsTrigger key={location} value={location}>{location}</TabsTrigger>
            ))}
          </TabsList>

          {locations.map((location) => (
            <TabsContent key={location} value={location}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4 mt-6">
                {projectsByLocation[location]?.slice(0, 8).map((project) => (
                   <Link 
                     key={project.id} 
                     href={`/properties/${project.id}`} 
                     className="text-muted-foreground hover:text-primary hover:underline transition-colors text-sm truncate"
                   >
                     {project.title}
                   </Link>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
