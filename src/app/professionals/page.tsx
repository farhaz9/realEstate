
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { User } from '@/types';
import { PageHero } from '@/components/shared/page-hero';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { ProfessionalCard } from '@/components/shared/professional-card';

export default function ProfessionalsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const professionalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'users'), 
      where('category', 'in', ['real-estate-agent', 'interior-designer'])
    );
  }, [firestore]);

  const { data: professionals, isLoading, error } = useCollection<User>(professionalsQuery);

  const filteredProfessionals = professionals?.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const realEstateAgents = filteredProfessionals?.filter(p => p.category === 'real-estate-agent');
  const interiorDesigners = filteredProfessionals?.filter(p => p.category === 'interior-designer');

  const renderContent = (data: User[] | undefined) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (error) {
      return <div className="text-center text-destructive py-16">Error: {error.message}</div>;
    }

    if (data && data.length > 0) {
      return (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((professional) => (
            <ProfessionalCard key={professional.id} professional={professional} />
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <h3 className="text-xl font-semibold">No professionals found.</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search or check back later.</p>
      </div>
    );
  };

  return (
    <>
      <PageHero
        title="Find a Professional"
        subtitle="Connect with top-rated real estate agents and interior designers in Delhi."
        image={{ id: 'contact-hero', imageHint: 'business meeting' }}
      />
      <div className="container mx-auto px-4 py-16">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="designers">Designers</TabsTrigger>
            </TabsList>
            <div className="w-full sm:w-auto sm:max-w-xs">
              <Input 
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <TabsContent value="all">
            {renderContent(filteredProfessionals)}
          </TabsContent>
          <TabsContent value="agents">
            {renderContent(realEstateAgents)}
          </TabsContent>
          <TabsContent value="designers">
            {renderContent(interiorDesigners)}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
