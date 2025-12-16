

'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ProfessionalCard } from '@/components/shared/professional-card';
import { Card, CardContent } from '@/components/ui/card';

export function FeaturedProfessionals() {
  const firestore = useFirestore();

  const professionalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'users'), 
        where('category', 'in', ['real-estate-agent', 'interior-designer']),
        where('isFeatured', '==', true),
        limit(8)
    );
  }, [firestore]);

  const { data: professionals, isLoading } = useCollection<User>(professionalsQuery);
  
  const title = 'Connect with Professionals';
  const subtitle = 'Find top-rated agents and designers to help you with your journey.';

  if (!isLoading && (!professionals || professionals.length === 0)) {
    return null;
  }
  
  return (
    <section id="featured-professionals" className="py-16 md:py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
          <Link href="/professionals" className="flex items-center text-sm font-semibold text-primary hover:underline">
            See all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <p className="text-muted-foreground max-w-2xl mb-12">
          {subtitle}
        </p>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Carousel
            opts={{
              align: 'start',
            }}
            className="w-full"
          >
            <CarouselContent>
              {professionals?.map((professional) => (
                <CarouselItem key={professional.id} className="basis-[90%] sm:basis-1/2 md:basis-1/3 pl-2 md:pl-4">
                   <div className="h-full p-1">
                    <ProfessionalCard professional={professional} />
                   </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>
    </section>
  );
}
