
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useMemo } from 'react';
import type { Property, User } from '@/types';
import { PageHero } from '@/components/shared/page-hero';
import { Loader2, HeartCrack } from 'lucide-react';
import { PropertyCard } from '@/components/property-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function WishlistPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  const wishlistIds = useMemo(() => userProfile?.wishlist || [], [userProfile]);

  const wishlistQuery = useMemoFirebase(() => {
    if (!firestore || wishlistIds.length === 0) return null;
    return query(collection(firestore, 'properties'), where(documentId(), 'in', wishlistIds));
  }, [firestore, wishlistIds]);

  const { data: properties, isLoading: arePropertiesLoading, error } = useCollection<Property>(wishlistQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to view your wishlist.",
        variant: "destructive",
      });
      router.push('/login');
    }
  }, [user, isUserLoading, router, toast]);

  const renderContent = () => {
    const isLoading = isUserLoading || isProfileLoading || (wishlistIds.length > 0 && arePropertiesLoading);
    
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

    if (properties && properties.length > 0) {
      return (
        <>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Your Wishlist</h2>
            <p className="text-muted-foreground mt-2">You have {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} saved.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </>
      );
    }

    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <HeartCrack className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-2xl font-semibold">Your wishlist is empty.</h3>
            <p className="text-muted-foreground mt-2">Start by adding properties you like.</p>
            <Button asChild className="mt-6">
                <Link href="/properties">Browse Properties</Link>
            </Button>
        </div>
    );
  };

  return (
    <>
      <PageHero
        title="My Wishlist"
        subtitle="Your saved properties, all in one place."
        image={{ id: 'interiors-hero', imageHint: 'cozy bedroom' }}
      />
      <div className="container mx-auto px-4 py-16">
        {renderContent()}
      </div>
    </>
  );
}
