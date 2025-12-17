
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Property, User } from '@/types';
import { ArrowLeft, User as UserIcon, CalendarDays, Edit, X } from 'lucide-react';
import { PropertyForm } from '@/components/profile/my-properties-tab';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

export default function AdminPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;
  const firestore = useFirestore();
  const [isEditing, setIsEditing] = useState(false);

  const propertyRef = useMemoFirebase(() => {
    if (!firestore || !propertyId) return null;
    return doc(firestore, 'properties', propertyId);
  }, [firestore, propertyId]);

  const { data: property, isLoading, error } = useDoc<Property>(propertyRef);
  
  const ownerRef = useMemoFirebase(() => {
      if (!firestore || !property) return null;
      return doc(firestore, 'users', property.userId);
  }, [firestore, property]);

  const { data: owner } = useDoc<User>(ownerRef);

  const handleClose = () => {
    setIsEditing(false);
  };
  
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
    <div className="bg-muted/40 min-h-screen">
       <Button variant="ghost" size="icon" onClick={() => router.back()} className="fixed top-4 left-4 z-50 h-10 w-10 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="container mx-auto px-4 py-8 pt-20">
        {isEditing ? (
             <PropertyForm 
              propertyToEdit={property} 
              onSuccess={handleClose}
              onCancel={handleClose}
              isOpen={true}
            />
        ) : (
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{property.title}</CardTitle>
                    <CardDescription>{property.location.address}</CardDescription>
                    <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                        {owner && (
                            <div className="flex items-center gap-2">
                               <Avatar className="h-6 w-6">
                                    <AvatarImage src={owner.photoURL} alt={owner.fullName} />
                                    <AvatarFallback className="text-xs">
                                        {owner.fullName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <span>Listed by {owner.fullName}</span>
                            </div>
                        )}
                         <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span>Listed on {property.dateListed?.toDate ? format(property.dateListed.toDate(), 'PPP') : 'N/A'}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="prose max-w-none text-muted-foreground">
                        <p>{property.description}</p>
                    </div>
                     <Button onClick={() => setIsEditing(true)} className="mt-6">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Property
                     </Button>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
