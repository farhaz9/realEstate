
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Query } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import type { Property } from '@/types';
import { PageHero } from '@/components/shared/page-hero';
import { Loader2 } from 'lucide-react';
import { PropertyCard } from '@/components/property-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

const ADMIN_EMAIL = 'thegreatfarhaz07@gmail.com';

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const allPropertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q: Query = collection(firestore, 'properties');
    q = query(q, orderBy('dateListed', 'desc'));
    return q;
  }, [firestore]);

  const { data: properties, isLoading, error } = useCollection<Property>(allPropertiesQuery);
  
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to view this page.",
        variant: "destructive",
      });
      router.push('/login');
    } else if (!isUserLoading && user && !isAuthorizedAdmin) {
       toast({
        title: "Access Denied",
        description: "You are not authorized to view this page.",
        variant: "destructive",
      });
      router.push('/');
    }
  }, [user, isUserLoading, router, toast, isAuthorizedAdmin]);


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
    
    if (!isAuthorizedAdmin) {
        return (
            <div className="container mx-auto px-4 py-16">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Not Authorized</AlertTitle>
                            <AlertDescription>
                                You do not have permission to access this page. You will be redirected shortly.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (properties && properties.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      );
    }

    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-2xl font-semibold">No properties have been listed yet.</h3>
        </div>
    );
  };

  return (
    <>
      <PageHero
        title="Admin Dashboard"
        subtitle="Manage all property listings on the platform."
        image={{ id: 'contact-hero', imageHint: 'office desk' }}
      />
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">All Properties ({properties?.length || 0})</h2>
        {renderContent()}
      </div>
    </>
  );
}
