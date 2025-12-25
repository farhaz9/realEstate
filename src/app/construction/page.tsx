
'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/shared/page-hero";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Property, User } from '@/types';
import { ProfessionalCard } from '@/components/shared/professional-card';
import { Loader2, Search, Building, Brush, Sofa, DraftingCompass, ArrowRight, Home, Briefcase, Bot, Lightbulb, Handshake, CheckCircle2, Ruler, Wrench, Lamp, HardHat, FileText, GanttChart, ShieldCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSearchParams, useRouter } from 'next/navigation';
import { PropertyCard } from '@/components/property-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const constructionServices = [
  {
    title: "Residential Construction",
    description: "Building homes that last a lifetime, from foundation to finish.",
    icon: Home,
    features: [
        "Independent houses & villas",
        "Apartments & builder floors",
        "Duplex and luxury homes",
        "Turnkey home construction",
    ],
    imageId: "service-properties",
  },
  {
    title: "Commercial Construction",
    description: "Creating functional and impressive commercial spaces for your business.",
    icon: Briefcase,
    features: [
        "Office buildings",
        "Retail spaces & showrooms",
        "Warehouses & industrial units",
        "Hospitality structures (hotels, resorts)",
    ],
    imageId: "service-architecture",
  },
  {
    title: "Design & Engineering",
    description: "Technical excellence in planning and structural design.",
    icon: DraftingCompass,
    features: [
        "Architectural layout & site planning",
        "Structural engineering",
        "2D working drawings & approvals",
        "Soil testing & foundation planning",
    ],
    imageId: "why-us-3",
  },
  {
    title: "Turnkey Construction",
    description: "Seamless end-to-end project management for a hassle-free experience.",
    icon: HardHat,
    features: [
        "End-to-end construction execution",
        "Material procurement & logistics",
        "Site supervision & quality control",
        "Contractor & vendor coordination",
    ],
     imageId: "service-construction",
  },
  {
    title: "Renovation & Structural Upgrades",
    description: "Modernize and strengthen your existing property.",
    icon: Wrench,
    features: [
        "Structural repairs & retrofitting",
        "Building extensions / additional floors",
        "Redevelopment of old properties",
    ],
    imageId: "service-consultancy",
  },
  {
    title: "Project Management",
    description: "Professional oversight to ensure your project is on time and budget.",
    icon: GanttChart,
    features: [
        "Cost estimation & BOQ preparation",
        "Timeline & milestone planning",
        "Risk & safety management",
        "Quality audits & reporting",
    ],
    imageId: "why-us-2",
  },
  {
    title: "Legal & Approval Support",
    description: "Navigating the complexities of permits and documentation.",
    icon: ShieldCheck,
    features: [
        "Building plan sanction",
        "Liaison with local authorities",
        "Occupancy / completion certificates",
        "Compliance & documentation",
    ],
    imageId: "contact-hero",
  },
  {
    title: "Green & Smart Construction",
    description: "Building for the future with sustainable and intelligent solutions.",
    icon: Lightbulb,
    features: [
        "Sustainable materials & methods",
        "Solar & rainwater harvesting",
        "Energy-efficient building design",
    ],
    imageId: "service-styling",
  }
];


function ConstructionPageContent() {
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
    router.replace(`/professionals?${params.toString()}`);
  };
  
  const buildersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'users'), 
      where('category', 'in', ['real-estate-agent', 'vendor'])
    );
  }, [firestore]);

  const { data: builders, isLoading, error } = useCollection<User>(buildersQuery);

   const newPropertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'properties'),
        where('propertyType', 'in', ['Plot', 'Commercial']),
        limit(6)
    );
  }, [firestore]);

  const { data: newProperties, isLoading: isLoadingProperties } = useCollection<Property>(newPropertiesQuery);


  const filteredBuilders = builders?.filter(d => {
    if (d.isBlocked || d.isFeatured === false) {
        return false;
    }
    return d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.companyName && d.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  });
  
  return (
    <div>
      <PageHero
        title={
          <>
            Build Your Vision <br/>
            From the Ground Up
          </>
        }
        subtitle="From residential homes to commercial landmarks, our construction services bring your architectural dreams to life."
        imageUrl="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2940&auto=format&fit=crop"
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
                  id="search-builder"
                  placeholder="Search for builders or contractors"
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
      
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest">Our Expertise</p>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Construction Services</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              We provide a full spectrum of construction services, ensuring quality, precision, and excellence from start to finish.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {constructionServices.map((service) => {
              const serviceImage = PlaceHolderImages.find(p => p.id === service.imageId);
              return (
                 <Card key={service.title} className="bg-card text-card-foreground border rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <CardHeader className="p-0 relative h-56">
                        {serviceImage && (
                            <Image
                                src={serviceImage.imageUrl}
                                alt={service.title}
                                data-ai-hint={serviceImage.imageHint}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        )}
                    </CardHeader>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 h-10">{service.description}</p>
                        <ul className="space-y-2">
                            {service.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="top-builders" className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
           <div className="flex justify-between items-center mb-8">
             <h2 className="text-3xl md:text-4xl font-bold">Top Builders & Contractors</h2>
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
           ) : filteredBuilders && filteredBuilders.length > 0 ? (
             <>
                {/* Desktop View */}
                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredBuilders.slice(0, 3).map((builder) => (
                    <ProfessionalCard key={builder.id} professional={builder} />
                  ))}
                </div>
                {/* Mobile View */}
                <div className="sm:hidden divide-y rounded-lg border overflow-hidden">
                   {filteredBuilders.slice(0, 3).map((builder) => (
                    <ProfessionalCard key={builder.id} professional={builder} variant="compact" />
                  ))}
                </div>
             </>
           ) : (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No builders found.</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search.</p>
            </div>
           )}
        </div>
      </section>
      
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Explore Plots & Commercial Sites</h2>
            <Link href="/properties" className="flex items-center text-sm font-semibold text-primary hover:underline">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
           {isLoadingProperties ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <div className="relative aspect-[4/3] bg-muted rounded-xl animate-pulse" />
                        <div className="space-y-2 p-2">
                            <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                ))}
             </div>
           ) : (
             <Carousel opts={{ align: 'start' }} className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {newProperties?.slice(0,3).map((property) => (
                    <CarouselItem key={property.id} className="basis-[90%] sm:basis-1/2 lg:basis-1/3 pl-2 md:pl-4">
                      <div className="h-full">
                         <PropertyCard property={property} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                 <div className="mt-8 flex justify-center md:hidden">
                    <div className="bg-background border rounded-full p-1 flex items-center gap-1">
                        <CarouselPrevious className="relative translate-y-0 left-0 top-0 h-10 w-10 hover:bg-primary/10 active:bg-primary/20" />
                        <CarouselNext className="relative translate-y-0 right-0 top-0 h-10 w-10 hover:bg-primary/10 active:bg-primary/20" />
                    </div>
                </div>
            </Carousel>
           )}
        </div>
      </section>

    </div>
  );
}


function LoadingFallback() {
  return (
    <div className='container mx-auto px-4'>
      <div className="py-16 md:py-24 bg-background">
          <Skeleton className="h-8 w-1/3 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                      <Skeleton className="relative aspect-square rounded-xl" />
                      <div className="space-y-2 p-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  )
}

export default function ConstructionPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConstructionPageContent />
    </Suspense>
  )
}
