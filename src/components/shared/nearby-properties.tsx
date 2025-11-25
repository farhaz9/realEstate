
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Property } from '@/types';
import { PropertyCard } from '@/components/property-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedProperties() {
  const firestore = useFirestore();

  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'properties'), where('isFeatured', '==', true), limit(10));
  }, [firestore]);

  const { data: properties, isLoading: isLoadingProperties } = useCollection<Property>(propertiesQuery);
  
  const title = 'Featured Properties';
  const subtitle = 'A curated selection of our top properties';

  if (isLoadingProperties) {
    return (
        <section className="py-16 md:py-24 bg-primary/5">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">Finding Properties...</h2>
                    <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                        Please wait while we fetch the best properties for you.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex flex-col h-full overflow-hidden border rounded-lg">
                            <Skeleton className="h-56 w-full" />
                            <div className="p-6 flex-grow flex flex-col">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-5 w-2/3 mt-2" />
                                <Skeleton className="h-4 w-1/2 mt-1" />
                                <div className="mt-4 flex items-center space-x-4 border-t pt-4">
                                    <Skeleton className="h-5 w-1/4" />
                                    <Skeleton className="h-5 w-1/4" />
                                    <Skeleton className="h-5 w-1/4" />
                                </div>
                            </div>
                             <div className="p-6 pt-0 mt-auto">
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
  }
  
  if (!properties || properties.length === 0) {
    return null;
  }
  
  return (
    <section id="featured-listings" className="py-16 md:py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {properties.map((property) => (
              <CarouselItem key={property.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <PropertyCard property={property} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
}
