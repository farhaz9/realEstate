
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Property } from '@/types';
import { PropertyCard } from '@/components/property-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Loader2, MapPin } from 'lucide-react';
import { Button } from '../ui/button';

export function NearbyProperties() {
  const firestore = useFirestore();
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [isLoading, setIsLoading] = useState(true);

  // For MVP, we simulate location detection and show properties from a default "nearby" location.
  const nearbyLocation = 'South Delhi';

  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    
    let q = query(collection(firestore, 'properties'));
    
    // If location permission is granted, we show "nearby" properties.
    // Otherwise, we show featured properties.
    if (permissionStatus === 'granted') {
      q = query(q, where('location', '==', nearbyLocation), limit(10));
    } else {
      q = query(q, where('isFeatured', '==', true), limit(10));
    }
    return q;
  }, [firestore, permissionStatus]);

  const { data: properties, isLoading: isLoadingProperties } = useCollection<Property>(propertiesQuery);
  
  const handleRequestLocation = () => {
    setIsLoading(true);
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        setPermissionStatus('granted');
      } else if (result.state === 'prompt') {
        navigator.geolocation.getCurrentPosition(
          () => setPermissionStatus('granted'),
          () => setPermissionStatus('denied'),
        );
      } else {
        setPermissionStatus(result.state);
      }
    });
  }

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);
        setIsLoading(false);
      });
    } else {
        setIsLoading(false);
        setPermissionStatus('denied'); // Geolocation not supported
    }
  }, []);
  
  const title = permissionStatus === 'granted' ? 'Properties Near You' : 'Featured Properties';
  const subtitle = permissionStatus === 'granted' 
    ? `Showing properties in ${nearbyLocation}`
    : 'A curated selection of our top properties';


  if (isLoading || isLoadingProperties) {
    return (
        <section className="py-16 md:py-24 bg-primary/5">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">Finding Properties...</h2>
                    <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                        Please wait while we fetch the best properties for you.
                    </p>
                </div>
                <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        </section>
    );
  }

  if (permissionStatus !== 'granted') {
     return (
        <section className="py-16 md:py-24 bg-primary/5">
            <div className="container mx-auto px-4 text-center">
                 <div className="max-w-2xl mx-auto">
                    <MapPin className="h-12 w-12 mx-auto text-primary" />
                    <h2 className="text-3xl md:text-4xl font-bold mt-4">Discover Properties Near You</h2>
                    <p className="mt-2 text-muted-foreground">
                        Enable location services to see listings in your area for a more personalized experience.
                    </p>
                    <Button onClick={handleRequestLocation} className="mt-6">
                        <MapPin className="mr-2 h-4 w-4" />
                        Detect my location
                    </Button>
                </div>
            </div>
        </section>
     )
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
