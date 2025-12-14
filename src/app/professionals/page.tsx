'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { User } from '@/types';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProfessionalCard } from '@/components/shared/professional-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'real-estate-agent', label: 'Agents' },
  { id: 'interior-designer', label: 'Designers' },
  { id: 'vendor', label: 'Vendors' },
];

export default function ProfessionalsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const professionalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q = collection(firestore, 'users');

    const professionalCategories = ['real-estate-agent', 'interior-designer', 'vendor'];
    if (activeTab !== 'all' && professionalCategories.includes(activeTab)) {
      return query(q, where('category', '==', activeTab));
    }
    return query(q, where('category', 'in', professionalCategories));
  }, [firestore, activeTab]);

  const { data: professionals, isLoading, error } = useCollection<User>(professionalsQuery);

  const filteredProfessionals = professionals?.filter(p => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    return (
        p.fullName.toLowerCase().includes(lowerCaseSearch) ||
        (p.username && p.username.toLowerCase().includes(lowerCaseSearch)) ||
        (p.companyName && p.companyName.toLowerCase().includes(lowerCaseSearch))
    );
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
             <div key={i} className="flex flex-col items-center space-y-3 p-4 border rounded-lg">
                <div className="relative w-24 h-24 bg-muted rounded-full animate-pulse" />
                <div className="space-y-2 w-full flex flex-col items-center">
                    <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
                    <div className="h-9 w-full bg-muted rounded-lg animate-pulse mt-2" />
                </div>
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
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProfessionals.map((professional) => (
            <ProfessionalCard key={professional.id} professional={professional} />
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
    <div className="bg-muted/30 min-h-screen">
      <div className="container mx-auto px-4 pt-8 pb-16">
        <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6">
            <Image 
                src="https://images.unsplash.com/photo-1556742031-c6961e199a9b?q=80&w=2874&auto=format&fit=crop"
                alt="Living room interior"
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 flex items-center justify-center h-full">
                <h1 className="text-4xl font-bold text-white max-w-xs text-center leading-tight">
                    Find the right expert for your home
                </h1>
            </div>
        </div>

        <form className="relative mb-6" onSubmit={(e) => e.preventDefault()}>
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
  );
}
