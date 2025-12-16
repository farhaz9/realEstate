
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Property } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { MyPropertiesTab } from '@/components/profile/my-properties-tab';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const propertyRef = useMemoFirebase(() => {
    if (!firestore || !propertyId) return null;
    return doc(firestore, 'properties', propertyId);
  }, [firestore, propertyId]);

  const { data: property, isLoading, error } = useDoc<Property>(propertyRef);
  
  const handleSuccess = () => {
    setIsDialogOpen(false);
    router.push('/admin');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsDialogOpen(false);
      // Add a small delay to allow the dialog to close before navigating
      setTimeout(() => router.push('/admin'), 150);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
            <Skeleton className="h-12 w-1/4" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold">Property Not Found</h2>
        <p className="text-muted-foreground">We couldn't find the property you were looking for.</p>
        {error && <p className="text-destructive text-sm mt-2">{error.message}</p>}
        <Button asChild className="mt-4">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <MyPropertiesTab 
            propertyToEdit={property} 
            onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
