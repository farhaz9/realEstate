
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { User } from '@/types';
import { PageHero } from '@/components/shared/page-hero';
import { Loader2, Search, SlidersHorizontal, List, Building, Brush } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProfessionalCard } from '@/components/shared/professional-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const filterTabs = [
  { id: 'all', label: 'All Professionals', icon: List },
  { id: 'real-estate-agent', label: 'Real Estate Agents', icon: Building },
  { id: 'interior-designer', label: 'Interior Designers', icon: Brush },
];

export default function ProfessionalsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const professionalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q = collection(firestore, 'users');

    const professionalCategories = ['real-estate-agent', 'interior-designer'];
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
        (p.username && p.username.toLowerCase().includes(lowerCaseSearch))
    );
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
             <div key={i} className="flex flex-col space-y-3">
                <div className="relative aspect-square bg-muted rounded-xl animate-pulse" />
                <div className="space-y-2 p-2">
                    <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
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
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
    <>
      <PageHero
        title="Find the Best Professionals for Your Home"
        subtitle="Connect with top-rated agents and interior designers to bring your vision to life."
        imageUrl="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2940&auto=format&fit=crop"
        className="pb-32 md:pb-40"
        titleClassName="text-4xl md:text-5xl lg:text-6xl"
      >
         <div className="absolute top-full -translate-y-1/2 w-full px-4">
            <div className="container mx-auto">
                <div className="max-w-3xl mx-auto flex flex-col items-center">
                  <Badge className="bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm mb-4">TRUSTED BY 50,000+ HOMEOWNERS</Badge>
                   <form 
                      className="relative flex w-full items-center" 
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <Search className="absolute left-4 h-5 w-5 text-muted-foreground z-10" />
                      <Input 
                          placeholder="Search by name, city, or zip code..."
                          className="pl-12 pr-28 h-14 text-base rounded-full bg-background/80 backdrop-blur-sm focus-visible:ring-offset-0 border-white/20 shadow-lg"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button size="lg" className="absolute right-2 h-11 rounded-full px-8 text-base">Search</Button>
                  </form>
                </div>
            </div>
        </div>
      </PageHero>
      <div className="container mx-auto px-4 py-16 mt-12 md:mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2 bg-muted p-1 rounded-lg">
                {filterTabs.map(tab => (
                    <Button 
                        key={tab.id}
                        variant="ghost"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex-1 md:flex-none rounded-md px-4 py-2 text-sm font-semibold transition-all h-auto",
                            activeTab === tab.id 
                                ? 'bg-background shadow-sm text-primary' 
                                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                        )}
                    >
                        <tab.icon className="mr-2 h-4 w-4" />
                        {tab.label}
                    </Button>
                ))}
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  Showing {filteredProfessionals?.length || 0} results
                </p>
                <Select defaultValue="recommended">
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recommended">Recommended</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {renderContent()}

        <div className="mt-16 text-center">
            <Button variant="outline" size="lg">Load More Professionals</Button>
        </div>

      </div>
    </>
  );
}
