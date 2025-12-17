
'use client';

import type { User, Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { User as UserIcon, Mail, Verified, Phone, Star, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useMemo } from 'react';

interface ProfessionalCardProps {
  professional: User;
}

const categoryDisplay: Record<string, string> = {
    'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer',
    'vendor': 'Vendor / Supplier'
};

function ProfessionalRating({ professionalId }: { professionalId: string }) {
    const firestore = useFirestore();

    const reviewsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, `users/${professionalId}/reviews`));
    }, [firestore, professionalId]);

    const { data: reviews } = useCollection<Review>(reviewsQuery);

    const { averageRating, reviewCount } = useMemo(() => {
        if (!reviews || reviews.length === 0) {
            return { averageRating: 0, reviewCount: 0 };
        }
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        return {
            averageRating: total / reviews.length,
            reviewCount: reviews.length
        };
    }, [reviews]);
    
    if (reviewCount === 0) {
        return <div className="text-xs text-muted-foreground">No reviews yet</div>;
    }

    return (
        <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-sm">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
        </div>
    );
}


export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const cardTitle = professional.companyName || professional.fullName;
  const isCompany = !!professional.companyName;
  const isCurrentlyVerified = professional.verifiedUntil && professional.verifiedUntil.toDate() > new Date();


  return (
    <>
        {/* Mobile View: List Item Style */}
        <div className="md:hidden">
            <Link href={`/professionals/${professional.id}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition-colors">
                 <Avatar className={cn(
                    "h-14 w-14 border-2 border-primary/20",
                    isCompany ? "rounded-lg" : "rounded-full"
                )}>
                    <AvatarImage src={professional.photoURL} alt={cardTitle} className="object-cover" />
                    <AvatarFallback className={cn(
                    "text-xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary",
                    isCompany ? "rounded-md" : "rounded-full"
                    )}>
                        {cardTitle ? getInitials(cardTitle) : <UserIcon />}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-base truncate">{cardTitle}</h3>
                            {isCurrentlyVerified && <Verified className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{categoryDisplay[professional.category] || professional.category}</p>
                        <div className="mt-1">
                            <ProfessionalRating professionalId={professional.id} />
                        </div>
                    </div>
                     <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{professional.email}</span>
                        </div>
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{professional.phone}</span>
                        </div>
                    </div>
                </div>
                 <Button size="sm" className="bg-primary hover:bg-primary/90">
                    View Profile
                </Button>
            </Link>
        </div>

        {/* Desktop View: Card Style */}
        <div className="hidden md:block h-full">
            <Card className="h-full overflow-hidden transition-all duration-300 group hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardContent className="p-6 flex flex-col items-center text-center h-full">
                    <Avatar className={cn(
                        "h-24 w-24 border-2 border-primary/20",
                        isCompany ? "rounded-lg" : "rounded-full"
                    )}>
                        <AvatarImage src={professional.photoURL} alt={cardTitle} className="object-cover" />
                        <AvatarFallback className={cn(
                        "text-3xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary",
                        isCompany ? "rounded-md" : "rounded-full"
                        )}>
                            {cardTitle ? getInitials(cardTitle) : <UserIcon />}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex items-center gap-2 mt-4">
                    <h3 className="font-bold text-lg">{cardTitle}</h3>
                    {isCurrentlyVerified && <Verified className="h-5 w-5 text-blue-500" />}
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{categoryDisplay[professional.category] || professional.category}</p>
                    
                    <div className="mt-2 mb-4">
                        <ProfessionalRating professionalId={professional.id} />
                    </div>

                    <div className="flex-grow space-y-3 mt-4 text-sm text-muted-foreground text-left w-full">
                    <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 flex-shrink-0 mt-1" />
                        <a href={`mailto:${professional.email}`} className="hover:text-primary transition-colors truncate">{professional.email}</a>
                    </div>
                    {professional.phone && (
                        <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 flex-shrink-0 mt-1" />
                        <a href={`tel:${professional.phone}`} className="hover:text-primary transition-colors">{professional.phone}</a>
                        </div>
                    )}
                    </div>

                    <Button asChild variant="outline" className="w-full mt-6">
                        <Link href={`/professionals/${professional.id}`}>
                            View Profile
                        </Link>
                    </Button>
            </CardContent>
            </Card>
        </div>
    </>
  );
}
