
'use client';

import { useState, useMemo, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { User } from '@/types';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProfessionalCard } from '@/components/shared/professional-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { HomeSearch } from '@/components/shared/home-search';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PageHero } from '@/components/shared/page-hero';
import { Skeleton } from '@/components/ui/skeleton';

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'real-estate-agent', label: 'Agents' },
  { id: 'interior-designer', label: 'Designers' },
  { id: 'vendor', label: 'Vendors' },
];

function ProfessionalsPageContent() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [heroSearchTerm, setHeroSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

   const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(heroSearchTerm);
  };

  const professionalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q = collection(firestore, 'users');

    const professionalCategories = ['real-estate-agent', 'interior-designer', 'vendor'];
    
    let queryConstraints = [];

    if (activeTab !== 'all' && professionalCategories.includes(activeTab)) {
      queryConstraints.push(where('category', '==', activeTab));
    } else {
      queryConstraints.push(where('category', 'in', professionalCategories));
    }
    
    return query(q, ...queryConstraints);

  }, [firestore, activeTab]);

  const { data: professionals, isLoading, error } = useCollection<User>(professionalsQuery);

  const filteredProfessionals = professionals?.filter(p => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    
    // Only show professionals who are not blocked and are featured
    if (p.isBlocked || p.isFeatured === false) {
        return false;
    }

    return (
        p.fullName.toLowerCase().includes(lowerCaseSearch) ||
        (p.username && p.username.toLowerCase().includes(lowerCaseSearch)) ||
        (p.companyName && p.companyName.toLowerCase().includes(lowerCaseSearch))
    );
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-2">
          {[...Array(8)].map((_, i) => (
             <div key={i} className="flex items-center space-y-3 p-2 border rounded-lg">
                <Skeleton className="relative w-12 h-12 rounded-full" />
                <div className="space-y-2 w-full flex-grow ml-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <div className="text-center text-destructive py-16">Error: {error.message}</div>;
    }

    if (filteredProfessionals && filteredProfessionals.length > 0) {
      return (
         <div className="grid grid-cols-1 gap-2">
          {filteredProfessionals.map((professional) => (
            <ProfessionalCard key={professional.id} professional={professional} variant="compact" />
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
        <h3 className="text-xl font-semibold">No professionals found.</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  };

  return (
    <>
      <PageHero
        title="Find a Professional"
        subtitle="Connect with top-rated real estate agents, interior designers, and vendors."
        imageUrl="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2874&auto=format&fit=crop"
        className="h-[80vh] md:h-[90vh]"
      >
        <div className="w-full max-w-xl mx-auto">
          <form
            onSubmit={handleHeroSearch}
            className="flex w-full items-center rounded-full bg-white p-2 shadow-lg"
          >
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="search-professional"
                placeholder="Search by name, category, or company"
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
      <div className="bg-muted/30 min-h-screen">
        <div className="container mx-auto px-4 pt-8 pb-16">
          <form id="professionals-search" className="relative mb-6" onSubmit={(e) => e.preventDefault()}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input 
                  placeholder="Search by name or location"
                  className="pl-12 h-12 text-base rounded-lg bg-background shadow-sm border-border"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </form>

          <div className="mb-8">
              <div className="bg-background border rounded-lg p-1 flex items-center gap-1">
                  {filterTabs.map(tab => (
                      <button 
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                              "flex-1 rounded-md px-3 py-1.5 text-sm font-semibold transition-all",
                              activeTab === tab.id 
                                  ? 'bg-primary/10 text-primary' 
                                  : 'text-muted-foreground hover:bg-muted/50'
                          )}
                      >
                          {tab.label}
                      </button>
                  ))}
              </div>
          </div>

          {renderContent()}
        </div>
      </div>
    </>
  );
}

function LoadingFallback() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-1/2" />
                <div className="grid grid-cols-1 gap-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center space-y-3 p-2 border rounded-lg">
                            <Skeleton className="relative w-12 h-12 rounded-full" />
                            <div className="space-y-2 w-full flex-grow ml-3">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-9 w-24 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function ProfessionalsPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ProfessionalsPageContent />
        </Suspense>
    )
}
