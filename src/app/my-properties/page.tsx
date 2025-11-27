
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import type { Property } from '@/types';
import { PageHero } from '@/components/shared/page-hero';
import { Loader2, Plus } from 'lucide-react';
import { PropertyCard } from '@/components/property-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default function MyPropertiesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userPropertiesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'properties'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: properties, isLoading, error } = useCollection<Property>(userPropertiesQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to view your properties.",
        variant: "destructive",
      });
      router.push('/login');
    }
  }, [user, isUserLoading, router, toast]);

  const renderContent = () => {
    if (isLoading || isUserLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    
    if (error) {
        return <div className="text-center text-destructive py-16">Error: {error.message}</div>;
    }

    if (properties && properties.length > 0) {
      return (
        <>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Manage Your Listings</h2>
            <p className="text-muted-foreground mt-2">You have {properties.length} active propert{properties.length === 1 ? 'y' : 'ies'}.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
             <Link href="/add-property">
              <Card className="h-full flex items-center justify-center border-2 border-dashed bg-muted/50 hover:bg-muted/80 hover:border-primary transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">List a New Property</h3>
                  <p className="text-sm text-muted-foreground">Your next listing could be someone's dream home.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </>
      );
    }

    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-2xl font-semibold">You haven't listed any properties yet.</h3>
            <p className="text-muted-foreground mt-2">Your first listing is on us!</p>
            <Button asChild className="mt-6">
                <Link href="/add-property">List a Property</Link>
            </Button>
        </div>
    );
  };

  return (
    <>
      <PageHero
        title="My Properties"
        subtitle="Manage your property listings."
        image={{ id: 'interiors-hero', imageHint: 'keys on a table' }}
      />
      <div className="container mx-auto px-4 py-16">
        {renderContent()}
      </div>
    </>
  );
}
