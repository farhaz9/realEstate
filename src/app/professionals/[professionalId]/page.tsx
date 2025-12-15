
'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { User, Property } from '@/types';
import { Loader2, ArrowLeft, Mail, MessageSquare, Verified, Building, Phone, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PropertyCard } from '@/components/property-card';
import { format } from 'date-fns';

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const categoryDisplay: Record<string, string> = {
    'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer',
    'listing-property': 'Property Owner',
    'vendor': 'Vendor / Supplier',
};

export default function ProfessionalDetailPage() {
  const params = useParams();
  const professionalId = params.professionalId as string;
  const firestore = useFirestore();

  const professionalRef = useMemoFirebase(() => {
    if (!firestore || !professionalId) return null;
    return doc(firestore, 'users', professionalId);
  }, [firestore, professionalId]);

  const { data: professional, isLoading: isLoadingProfessional, error } = useDoc<User>(professionalRef);
  
  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore || !professionalId) return null;
    return query(collection(firestore, 'properties'), where('userId', '==', professionalId));
  }, [firestore, professionalId]);

  const { data: properties, isLoading: isLoadingProperties } = useCollection<Property>(propertiesQuery);
  
  const isLoading = isLoadingProfessional || isLoadingProperties;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold">Professional Not Found</h2>
        <p className="text-muted-foreground">We couldn't find the professional you were looking for.</p>
        {error && <p className="text-destructive text-sm mt-2">{error.message}</p>}
        <Button asChild className="mt-4">
          <Link href="/professionals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Professionals
          </Link>
        </Button>
      </div>
    );
  }
  
  const isCurrentlyVerified = professional.verifiedUntil && professional.verifiedUntil.toDate() > new Date();

  return (
    <div className="bg-muted/40 min-h-screen">
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/professionals"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Professionals</Link>
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 lg:sticky top-24">
                    <Card>
                        <CardHeader className="items-center text-center">
                           <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                                <AvatarImage src={professional.photoURL} alt={professional.fullName} className="object-cover" />
                                <AvatarFallback className="text-4xl">
                                    {getInitials(professional.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="pt-4">
                                <div className="flex items-center justify-center gap-2">
                                    <h1 className="text-2xl font-bold">{professional.fullName}</h1>
                                    {isCurrentlyVerified && <Verified className="h-6 w-6 text-blue-500" />}
                                </div>
                                <p className="text-muted-foreground">{categoryDisplay[professional.category] || professional.category}</p>
                                {professional.companyName && <p className="text-sm text-muted-foreground">{professional.companyName}</p>}
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm">
                             {professional.bio && (
                                <>
                                 <p className="text-center text-muted-foreground mb-4">{professional.bio}</p>
                                 <Separator className="my-4"/>
                                </>
                            )}
                             <div className="space-y-4">
                               <div className="flex items-start gap-4">
                                 <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                                 <div>
                                   <p className="font-semibold">Date Joined</p>
                                   <p className="text-muted-foreground">{professional.dateJoined?.toDate ? format(professional.dateJoined.toDate(), 'PPP') : 'N/A'}</p>
                                 </div>
                               </div>
                               <div className="flex items-start gap-4">
                                 <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                 <div>
                                   <p className="font-semibold">Email</p>
                                   <a href={`mailto:${professional.email}`} className="text-primary hover:underline">{professional.email}</a>
                                 </div>
                               </div>
                               <div className="flex items-start gap-4">
                                 <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                 <div>
                                   <p className="font-semibold">Phone</p>
                                   <a href={`tel:${professional.phone}`} className="text-primary hover:underline">{professional.phone}</a>
                                 </div>
                               </div>
                             </div>
                             <Separator className="my-6"/>
                             <div className="space-y-3">
                                <Button asChild size="lg" className="w-full">
                                    <a href={`mailto:${professional.email}`}>
                                        <Mail className="mr-2 h-5 w-5" /> Contact Agent
                                    </a>
                                </Button>
                                 <Button asChild size="lg" variant="outline" className="w-full">
                                    <a href={`https://wa.me/${professional.phone}`} target="_blank" rel="noopener noreferrer">
                                        <MessageSquare className="mr-2 h-5 w-5" /> WhatsApp
                                    </a>
                                </Button>
                             </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-6 w-6 text-primary" />
                                Listings by {professional.fullName.split(' ')[0]} ({properties?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {properties && properties.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {properties.map(property => (
                                        <PropertyCard key={property.id} property={property} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                    <h3 className="text-xl font-semibold">No Listings Found</h3>
                                    <p className="text-muted-foreground mt-2">{professional.fullName} hasn't listed any properties yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
}
