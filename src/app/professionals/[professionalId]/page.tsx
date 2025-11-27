'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/types';
import { Loader2, ArrowLeft, Building, KeyRound, Handshake, Info, Globe, Phone, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const categoryDisplay: Record<string, string> = {
    'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer'
};

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}


export default function ProfessionalDetailPage() {
  const params = useParams();
  const professionalId = params.professionalId as string;
  const firestore = useFirestore();

  const professionalRef = useMemoFirebase(() => {
    if (!firestore || !professionalId) return null;
    return doc(firestore, 'users', professionalId);
  }, [firestore, professionalId]);

  const { data: professional, isLoading, error } = useDoc<User>(professionalRef);
  
  // Placeholder data
  const companyName = "B S Associates";
  const reraId = "PRM/KA/RERA/121/309/AG/210107/0021";
  const operatingSince = 2010;
  const propertiesForSale = 24;
  const propertiesForRent = 27;
  const teamMembers = 8;
  const dealsClosed = 2500;
  const dealsIn = ["Rent/Lease", "Pre-launch", "Original Booking"];
  const operatesIn = ["Malleshwaram", "Rajajinagar", "Yeswanthpur", "Binnipete", "1st Block Rajajinagar", "Basaveshwar Nagar", "Goragun More"];
  const website = "www.bsassociates.info";
  const aboutText = "B S Associates is a leading real estate consultancy in Bangalore, known for its transparent dealings and customer-centric approach. With over a decade of experience, we specialize in residential and commercial properties across prime locations.";

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
  
  return (
    <div className="bg-muted/40">
        <div className="container mx-auto p-4 md:py-8">
            <Button asChild variant="ghost" size="sm" className="mb-4">
                <Link href="/professionals"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Professionals</Link>
            </Button>
            <Card className="overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
                <div className="bg-primary h-2" />
                <CardContent className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="relative border-4 border-white rounded-lg shadow-lg -mt-16 bg-background w-40 h-40">
                                <Avatar className="w-full h-full rounded-md">
                                    <AvatarImage src={professional.photoURL} alt={professional.fullName} className="object-cover" />
                                    <AvatarFallback className="text-5xl rounded-md">
                                        {getInitials(professional.fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white p-1 rounded-md shadow-md">
                                    <Image src="https://placehold.co/80x30/png?text=BSA" alt={`${companyName} Logo`} width={60} height={22} />
                                </div>
                            </div>
                            <div className="mt-6 w-full">
                                <h1 className="text-2xl font-bold">{professional.fullName}</h1>
                                <p className="text-muted-foreground">{companyName}</p>
                                <p className="text-xs text-muted-foreground mt-2 truncate">RERA ID: {reraId}</p>
                                <p className="text-sm text-muted-foreground">Operating since: {operatingSince}</p>
                            </div>
                             <div className="mt-4">
                                <Image src="https://placehold.co/120x60/png?text=Trusted" alt="Trusted Badge" width={100} height={50} />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="p-3 rounded-lg bg-background/50">
                                    <p className="text-2xl font-bold text-primary">{propertiesForSale}</p>
                                    <p className="text-sm text-muted-foreground">Properties For Sale</p>
                                </div>
                                 <div className="p-3 rounded-lg bg-background/50">
                                    <p className="text-2xl font-bold text-primary">{propertiesForRent}</p>
                                    <p className="text-sm text-muted-foreground">Properties For Rent</p>
                                </div>
                                <div className="p-3 rounded-lg bg-background/50">
                                    <p className="text-2xl font-bold text-primary">{teamMembers}</p>
                                    <p className="text-sm text-muted-foreground">Team Members</p>
                                </div>
                                <div className="p-3 rounded-lg bg-background/50">
                                    <p className="text-2xl font-bold text-primary">{dealsClosed}</p>
                                    <p className="text-sm text-muted-foreground">Deals Closed</p>
                                </div>
                            </div>
                             <Separator className="my-6"/>
                             <div className="space-y-4 text-sm">
                                <div className="flex gap-4">
                                    <h3 className="font-semibold w-24 flex-shrink-0">Deals in</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {dealsIn.map(deal => <Badge key={deal} variant="secondary">{deal}</Badge>)}
                                    </div>
                                </div>
                                 <div className="flex gap-4">
                                    <h3 className="font-semibold w-24 flex-shrink-0">Operates in</h3>
                                    <p className="text-muted-foreground">{operatesIn.join(', ')}</p>
                                </div>
                                 <div className="flex gap-4 items-center">
                                    <h3 className="font-semibold w-24 flex-shrink-0">Website</h3>
                                    <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                        <Globe className="h-4 w-4" /> {website}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                     <Separator className="my-6"/>
                     <div className="flex flex-col sm:flex-row gap-4">
                        <Button variant="outline" className="w-full"><Building className="mr-2" /> View Properties</Button>
                        <Button className="w-full bg-red-600 hover:bg-red-700"><Phone className="mr-2" /> Contact Agent</Button>
                     </div>
                </CardContent>
            </Card>

            <Card className="mt-8">
                <CardContent className="p-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Info className="h-6 w-6 text-primary" /> About {companyName}</h2>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                       <p className="text-muted-foreground whitespace-pre-wrap">{aboutText}</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                           <div>
                                <h4 className="font-semibold">Team Size</h4>
                                <p className="text-muted-foreground">{teamMembers} people</p>
                           </div>
                           <div>
                                <h4 className="font-semibold">Address</h4>
                                <p className="text-muted-foreground">Rajajinagar Bangalore 560010</p>
                           </div>
                       </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
