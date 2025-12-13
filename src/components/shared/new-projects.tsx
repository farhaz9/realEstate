
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import type { Property } from '@/types';
import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { NewProjectCard } from './new-project-card';

export function NewProjects() {
  const firestore = useFirestore();

  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
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
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">New Projects</h2>
          <div className="h-1 w-20 bg-primary mb-8"></div>
           <div className="space-y-4">
              <Skeleton className="h-10 w-1/3" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-xl" />)}
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
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">New Projects</h2>
        <div className="h-1 w-20 bg-primary mb-8"></div>
        
        <Tabs defaultValue={locations[0]} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 h-auto p-1 bg-muted rounded-lg w-full max-w-2xl">
            {locations.slice(0, 5).map((location) => (
              <TabsTrigger key={location} value={location}>{location}</TabsTrigger>
            ))}
          </TabsList>

          {locations.slice(0, 5).map((location) => (
            <TabsContent key={location} value={location} className="mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectsByLocation[location]?.slice(0, 3).map((project) => (
                   <NewProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
