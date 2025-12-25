
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
import { Loader2, Search, Building, Brush, Sofa, DraftingCompass, ArrowRight, Home, Briefcase, Bot, Lightbulb, Handshake, CheckCircle2, Ruler, Wrench, Lamp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSearchParams, useRouter } from 'next/navigation';
import { PropertyCard } from '@/components/property-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const designServices = [
  {
    title: "Residential Interior Design",
    description: "Personalized home interiors designed around how you live.",
    icon: Home,
    features: [
        "Living rooms & family spaces",
        "Bedrooms & wardrobes",
        "Kitchens & dining areas",
        "Villas, apartments & homes",
    ],
    imageId: "service-interiors-page",
  },
  {
    title: "Commercial Interior Design",
    description: "Professional spaces that enhance productivity and brand identity.",
    icon: Briefcase,
    features: [
        "Offices & corporate spaces",
        "Retail stores & showrooms",
        "Restaurants, cafés & hotels",
        "Clinics & wellness centers",
    ],
    imageId: "service-architecture",
  },
  {
    title: "Concept Design & Space Planning",
    description: "A strong foundation for every project.",
    icon: Lightbulb,
    features: [
        "Layout planning & zoning",
        "Mood boards & color schemes",
        "Furniture planning",
        "Lighting concepts",
    ],
    imageId: "why-us-3",
  },
  {
    title: "Turnkey Interior Solutions",
    description: "End-to-end execution with a stress-free experience.",
    icon: Handshake,
    features: [
        "Design + execution",
        "Material selection",
        "On-site supervision",
        "Final styling & handover",
    ],
     imageId: "service-construction",
  },
  {
    title: "Custom Furniture & Joinery",
    description: "Bespoke pieces tailored to your space.",
    icon: Sofa,
    features: [
        "Modular kitchens & wardrobes",
        "Custom sofas, beds & cabinets",
        "Storage solutions",
    ],
    imageId: "service-furniture",
  },
  {
    title: "Lighting & False Ceiling Design",
    description: "Enhancing mood, depth, and functionality.",
    icon: Lamp,
    features: [
        "Ambient, task & accent lighting",
        "False ceilings & feature designs",
    ],
    imageId: "service-styling",
  },
  {
    title: "Renovation & Remodeling",
    description: "Upgrade your space without starting from scratch.",
    icon: Wrench,
    features: [
        "Home renovations",
        "Office redesigns",
        "Space optimization",
    ],
    imageId: "service-consultancy",
  },
  {
    title: "Design Consultation",
    description: "Perfect for clients who need expert guidance.",
    icon: Ruler,
    features: [
        "Design advice & styling tips",
        "Material & color consultation",
        "Budget planning support",
    ],
    imageId: "why-us-2",
  }
];

function InteriorsPageContent() {
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

   const interiorPropertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'properties'),
        where('propertyType', 'in', ['Apartment', 'Villa', 'Independent House', 'Penthouse']),
        limit(6)
    );
  }, [firestore]);

  const { data: interiorProperties, isLoading: isLoadingProperties } = useCollection<Property>(interiorPropertiesQuery);


  const filteredDesigners = designers?.filter(d => {
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
      
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest">What we offer</p>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Explore Our Services</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              From single-room makeovers to full-scale renovations, we have the expertise to handle projects of any size.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designServices.map((service) => {
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

      <section id="top-designers" className="py-16 md:py-24 bg-primary/5">
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
             <>
                {/* Desktop View */}
                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredDesigners.slice(0, 3).map((designer) => (
                    <ProfessionalCard key={designer.id} professional={designer} />
                  ))}
                </div>
                {/* Mobile View */}
                <div className="sm:hidden divide-y rounded-lg border overflow-hidden">
                   {filteredDesigners.slice(0, 3).map((designer) => (
                    <ProfessionalCard key={designer.id} professional={designer} variant="compact" />
                  ))}
                </div>
             </>
           ) : (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No designers found.</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search.</p>
            </div>
           )}
        </div>
      </section>
      
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Explore Properties</h2>
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
                  {interiorProperties?.slice(0,3).map((property) => (
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

export default function InteriorsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InteriorsPageContent />
    </Suspense>
  )
}
    

    

    
