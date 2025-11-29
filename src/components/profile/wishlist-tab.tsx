'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, documentId, doc } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Property, User } from '@/types';
import { Loader2, HeartCrack } from 'lucide-react';
import { PropertyCard } from '@/components/property-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export function WishlistTab() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

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
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold">Your Wishlist</h3>
            <p className="text-muted-foreground mt-1">You have {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} saved.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
        <CardContent className="p-6">
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <HeartCrack className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-2xl font-semibold">Your wishlist is empty.</h3>
                <p className="text-muted-foreground mt-2">Start by adding properties you like.</p>
                <Button asChild className="mt-6">
                    <Link href="/properties">Browse Properties</Link>
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}
