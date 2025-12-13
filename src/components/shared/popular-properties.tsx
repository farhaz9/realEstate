
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import type { Property } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PopularPropertyCard } from './popular-property-card';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export function PopularProperties() {
  const firestore = useFirestore();

  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // For now, "popular" is just the 8 most recent listings.
    return query(collection(firestore, 'properties'), limit(8));
  }, [firestore]);

  const { data: properties, isLoading: isLoadingProperties } = useCollection<Property>(propertiesQuery);
  
  const title = 'Popular Properties';
  const subtitle = 'Check out some of the most popular listings from our owners.';

  if (!isLoadingProperties && (!properties || properties.length === 0)) {
    return null; // Don't render the section if there are no properties
  }
  
  return (
    <section id="popular-listings" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
          <Link href="/properties" className="flex items-center text-sm font-semibold text-primary hover:underline">
            See all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <p className="text-muted-foreground max-w-2xl mb-12">
          {subtitle}
        </p>
        
        {isLoadingProperties ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
              </div>
            ))}
          </div>
        ) : (
          <Carousel
            opts={{
              align: 'start',
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {properties?.map((property) => (
                <CarouselItem key={property.id} className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pl-2 md:pl-4">
                   <div className="h-full">
                    <PopularPropertyCard property={property} />
                   </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="md:hidden flex justify-center items-center gap-4 mt-8">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        )}
      </div>
    </section>
  );
}
