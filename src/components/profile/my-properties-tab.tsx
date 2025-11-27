
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { Property } from '@/types';
import { PropertyCard } from '@/components/property-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function MyPropertiesTab() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userPropertiesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'properties'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: properties, isLoading: arePropertiesLoading } = useCollection<Property>(userPropertiesQuery);

  if (arePropertiesLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (properties && properties.length > 0) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <PropertyCard key={property.id} property={property}/>
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-24 border-2 border-dashed rounded-lg">
        <h3 className="text-xl font-semibold">You haven't listed any properties yet.</h3>
        <p className="text-muted-foreground mt-2">Your first listing is on us!</p>
        <Button asChild className="mt-6">
            <Link href="/add-property">List a Property</Link>
        </Button>
    </div>
  );
}
