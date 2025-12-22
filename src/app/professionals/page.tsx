
'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { User } from '@/types';
import { Loader2, Search, Verified } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProfessionalCard } from '@/components/shared/professional-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import Fuse from 'fuse.js';
import { VerificationModal } from '@/components/shared/verification-modal';

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
  const { user, isUserLoading } = useUser();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('all');
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const currentSearchTerm = searchParams.get('q') || '';

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

   const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    params.set('q', searchTerm);
    router.replace(`/professionals?${params.toString()}`);
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

  const { data: professionals, isLoading: areProfessionalsLoading, error } = useCollection<User>(professionalsQuery);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<User>(userDocRef);

  const fuse = useMemo(() => {
    if (!professionals) return null;
    const options = {
      keys: ['fullName', 'username', 'companyName', 'category', 'bio', 'servicesProvided'],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true,
    };
    return new Fuse(professionals.filter(p => !p.isBlocked && p.isFeatured !== false), options);
  }, [professionals]);

  const filteredProfessionals = useMemo(() => {
    const activeProfessionals = professionals?.filter(p => !p.isBlocked && p.isFeatured !== false) || [];

    if (!currentSearchTerm.trim()) {
      return activeProfessionals;
    }

    if (!fuse) {
      return activeProfessionals;
    }

    return fuse.search(currentSearchTerm).map(result => result.item);
  }, [professionals, currentSearchTerm, fuse]);
  
  const isProfessionalUser = userProfile && ['real-estate-agent', 'interior-designer', 'vendor'].includes(userProfile.category);
  const isCurrentlyVerified = userProfile?.verifiedUntil && userProfile.verifiedUntil.toDate() > new Date();

  const isLoading = isUserLoading || areProfessionalsLoading;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="divide-y border rounded-lg">
          {[...Array(8)].map((_, i) => (
             <div key={i} className="flex items-center space-x-4 p-4">
                <Skeleton className="relative w-12 h-12 rounded-full" />
                <div className="space-y-2 w-full flex-grow">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-9 w-24 rounded-lg" />
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
         <div className="overflow-hidden">
          {filteredProfessionals.map((professional) => (
            <ProfessionalCard key={professional.id} professional={professional} variant="compact" searchTerm={currentSearchTerm} />
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
      <div className="bg-muted/30 min-h-screen">
        <div className="container mx-auto px-4 pt-8 pb-16">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Find a Professional</h1>
                <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Connect with top-rated real estate agents, interior designers, and vendors.
                </p>
            </div>
          <form id="professionals-search" className="relative mb-6 max-w-xl mx-auto" onSubmit={handleSearch}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input 
                  placeholder="Search by name, role, company or service"
                  className="pl-12 h-12 text-base rounded-full bg-background shadow-sm border-border"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </form>

          <div className="mb-8">
              <div className="flex justify-center border-b">
                {filterTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "relative px-4 py-2.5 text-sm font-semibold transition-all text-muted-foreground hover:text-primary",
                            activeTab === tab.id && "text-primary"
                        )}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                ))}
              </div>
              {!isUserLoading && isProfessionalUser && !isCurrentlyVerified && (
                  <div className="mt-6 sm:hidden">
                    <Button onClick={() => setIsVerificationModalOpen(true)} size="lg" className="w-full h-12 text-base">
                        <Verified className="mr-2 h-5 w-5" />
                        Get Verified as a Professional
                    </Button>
                  </div>
              )}
          </div>

          {renderContent()}
        </div>
      </div>
      <VerificationModal open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen} />
    </>
  );
}

function LoadingFallback() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-1/2" />
                <div className="divide-y border rounded-lg">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4">
                            <Skeleton className="relative w-12 h-12 rounded-full" />
                            <div className="space-y-2 w-full flex-grow">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-9 w-24 rounded-lg" />
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

