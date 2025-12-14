
'use client';

import { useState, useEffect } from 'react';
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
import { useSearchParams, useRouter } from 'next/navigation';

export default function InteriorsPage() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [heroSearchTerm, setHeroSearchTerm] = useState('');

  useEffect(() => {
    // Update search term from URL query parameters
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    params.set('q', heroSearchTerm);
    router.replace(`/interiors?${params.toString()}`);
  };
  
  const designersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'users'), 
      where('category', '==', 'interior-designer')
    );
  }, [firestore]);

  const { data: designers, isLoading, error } = useCollection<User>(designersQuery);

  const filteredDesigners = designers?.filter(d => 
    d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.companyName && d.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
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
        subtitle="Connect with top-rated interior designers to bring your vision to life."
        imageUrl="https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2728&auto=format&fit=crop"
        titleClassName="text-4xl md:text-5xl lg:text-6xl"
        className="h-[80vh] md:h-[90vh]"
      >
        <div className="w-full max-w-xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="flex w-full items-center rounded-full bg-white p-2 shadow-lg"
            >
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="search-designer"
                  placeholder="Search by designer name or firm"
                  className="pl-12 pr-4 h-12 text-base rounded-full border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
                  value={heroSearchTerm}
                  onChange={(e) => setHeroSearchTerm(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="rounded-full px-8 text-base h-12"
              >
                Search
              </Button>
            </form>
          </div>
      </PageHero>
      
      <section id="top-designers" className="py-16 md:py-24 bg-background">
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
