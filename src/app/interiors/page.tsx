
'use client';

import Image from "next/image";
import { interiorProjects } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/shared/page-hero";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { User } from '@/types';
import { ProfessionalCard } from '@/components/shared/professional-card';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function InteriorsPage() {
  const firestore = useFirestore();

  const designersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'users'), 
      where('category', '==', 'interior-designer')
    );
  }, [firestore]);

  const { data: designers, isLoading, error } = useCollection<User>(designersQuery);
  
  return (
    <div>
      <PageHero
        title="Interior Design"
        subtitle="Transform your house into a home with personalized interior design services from Delhi's best company. Explore our portfolio."
        image={{
          id: "interiors-hero",
          imageHint: "modern living room",
        }}
      />
      
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Our Design Projects</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Get inspired by our portfolio of stunning interior transformations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {interiorProjects.map((project) => {
              const projectImage = PlaceHolderImages.find(p => p.id === project.images[0]);
              return (
                <Card key={project.id} className="overflow-hidden group relative">
                  <div className="relative h-96 w-full">
                    {projectImage && (
                      <Image
                        src={projectImage.imageUrl}
                        alt={project.title}
                        data-ai-hint={projectImage.imageHint}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                    <p className="mt-2 text-sm text-neutral-300 line-clamp-2">{project.description}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
      
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
           <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Meet Our Designers</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Connect with talented professionals who can bring your vision to life.
            </p>
          </div>
          
          {isLoading && (
             <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          
          {error && (
            <div className="text-center text-destructive py-16">Error: {error.message}</div>
          )}
          
          {designers && designers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {designers.map((designer) => (
                <ProfessionalCard key={designer.id} professional={designer} />
              ))}
            </div>
          )}

          {designers && designers.length === 0 && !isLoading && (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No designers found.</h3>
                <p className="text-muted-foreground mt-2">Check back later to see our list of talented designers.</p>
              </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
           <div className="flex justify-between items-center mb-8">
             <h2 className="text-3xl md:text-4xl font-bold">Interior Designers Near You</h2>
             <Link href="/professionals" className="flex items-center text-sm font-semibold text-primary hover:underline">
                View All <ArrowRight className="ml-1 h-4 w-4" />
             </Link>
           </div>
           <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">Feature Coming Soon</h3>
                <p className="text-muted-foreground mt-2">We are working on a feature to show you designers based on your location.</p>
            </div>
        </div>
      </section>
      
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
           <div className="flex justify-between items-center mb-8">
             <h2 className="text-3xl md:text-4xl font-bold">Top Interior Designers</h2>
             <Link href="/professionals" className="flex items-center text-sm font-semibold text-primary hover:underline">
                View All <ArrowRight className="ml-1 h-4 w-4" />
             </Link>
           </div>
           {isLoading ? (
             <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(designers || []).slice(0,3).map((designer) => (
                <ProfessionalCard key={designer.id} professional={designer} />
              ))}
            </div>
           )}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
           <div className="flex justify-between items-center mb-8">
             <h2 className="text-3xl md:text-4xl font-bold">Top Interior Design Companies</h2>
              <Link href="/professionals" className="flex items-center text-sm font-semibold text-primary hover:underline">
                View All <ArrowRight className="ml-1 h-4 w-4" />
             </Link>
           </div>
           <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">Coming Soon</h3>
                <p className="text-muted-foreground mt-2">A curated list of top interior design firms will be available here.</p>
            </div>
        </div>
      </section>

    </div>
  );
}
