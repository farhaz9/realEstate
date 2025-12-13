
'use client';

import { useState } from 'react';
import Image from "next/image";
import { interiorProjects } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/shared/page-hero";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { User } from '@/types';
import { ProfessionalCard } from '@/components/shared/professional-card';
import { Loader2, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function InteriorsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const designersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'users'), 
      where('category', '==', 'interior-designer')
    );
  }, [firestore]);

  const { data: designers, isLoading, error } = useCollection<User>(designersQuery);

  const filteredDesigners = designers?.filter(d => 
    d.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      <PageHero
        title={
          <>
            Find the Best <br />
            Interior Designers
          </>
        }
        subtitle=""
        imageUrl="https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2728&auto=format&fit=crop"
        titleClassName="text-4xl md:text-5xl lg:text-6xl !mt-0"
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <Badge className="bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
            TRANSFORM YOUR SPACE
          </Badge>
          <p className="mt-2 text-lg max-w-3xl">
            Connect with top-rated interior designers to bring your vision to life.
          </p>
          <form 
              className="relative flex w-full items-center max-w-xl" 
              onSubmit={(e) => {
                e.preventDefault();
                // Search logic is handled by filtering the list
              }}
            >
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground z-10" />
              <Input 
                  placeholder="Search by designer name..."
                  className="pl-12 pr-28 h-14 text-base rounded-full bg-background/80 backdrop-blur-sm focus-visible:ring-offset-0 border-white/20 shadow-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button size="lg" type="submit" className="absolute right-2 h-11 rounded-full px-8 text-base">Search</Button>
          </form>
        </div>
      </PageHero>
      
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
           <div className="flex justify-between items-center mb-8">
             <h2 className="text-3xl md:text-4xl font-bold">Top Interior Designers</h2>
             <Link href="/professionals" className="flex items-center text-sm font-semibold text-primary hover:underline">
                View All <ArrowRight className="ml-1 h-4 w-4" />
             </Link>
           </div>
           {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <div className="relative aspect-square bg-muted rounded-xl animate-pulse" />
                        <div className="space-y-2 p-2">
                            <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                ))}
             </div>
           ) : error ? (
              <div className="text-center text-destructive py-16">Error: {error.message}</div>
           ) : filteredDesigners && filteredDesigners.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDesigners.slice(0,3).map((designer) => (
                <ProfessionalCard key={designer.id} professional={designer} />
              ))}
            </div>
           ) : (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No designers found.</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search.</p>
            </div>
           )}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary/5">
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
      
      <section className="py-16 md:py-24 bg-background">
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
          
          {filteredDesigners && filteredDesigners.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDesigners.map((designer) => (
                <ProfessionalCard key={designer.id} professional={designer} />
              ))}
            </div>
          )}

          {filteredDesigners && filteredDesigners.length === 0 && !isLoading && (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No designers found.</h3>
                <p className="text-muted-foreground mt-2">Check back later to see our list of talented designers.</p>
              </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary/5">
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
