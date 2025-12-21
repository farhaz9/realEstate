
'use client';

import type { User, Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { User as UserIcon, Mail, Verified, Phone, Star, Info, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useMemo } from 'react';
import { HighlightedText } from './highlighted-text';

interface ProfessionalCardProps {
  professional: User;
  variant?: 'default' | 'compact';
  searchTerm?: string;
}

const categoryDisplay: Record<string, string> = {
    'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer',
    'vendor': 'Vendor / Supplier'
};

function ProfessionalRating({ professional }: { professional: User }) {
    const firestore = useFirestore();

    const reviewsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, `users/${professional.id}/reviews`));
    }, [firestore, professional.id]);

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
        return null;
    }
    
    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            "h-4 w-4",
                            i < Math.round(averageRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                        )}
                    />
                ))}
            </div>
             {reviewCount > 0 && (
                <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
            )}
        </div>
    );
}


export function ProfessionalCard({ professional, variant = 'default', searchTerm = '' }: ProfessionalCardProps) {
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
  const professionalUrl = `/professionals/${professional.username}`;


  if (variant === 'compact') {
      return (
        <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors w-full">
            <Link href={professionalUrl} className="flex items-center gap-4 flex-grow min-w-0">
                <Avatar className={cn(
                    "h-12 w-12 border-2 border-primary/20",
                    isCompany ? "rounded-lg" : "rounded-full"
                )}>
                    <AvatarImage src={professional.photoURL} alt={cardTitle} className="object-cover" />
                    <AvatarFallback className={cn(
                    "text-lg bg-gradient-to-br from-primary/10 to-accent/10 text-primary",
                    isCompany ? "rounded-md" : "rounded-full"
                    )}>
                        {cardTitle ? getInitials(cardTitle) : <UserIcon />}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base truncate">
                            <HighlightedText text={cardTitle} highlight={searchTerm} />
                        </h3>
                        {isCurrentlyVerified && <Verified className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                        <HighlightedText text={categoryDisplay[professional.category] || professional.category} highlight={searchTerm} />
                    </p>
                </div>
            </Link>
            <div className="flex-shrink-0 ml-auto flex items-center gap-4">
                <ProfessionalRating professional={professional} />
                <Button asChild variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Link href={professionalUrl}>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                </Button>
            </div>
        </div>
      );
  }


  return (
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
            <h3 className="font-bold text-lg">
                <HighlightedText text={cardTitle} highlight={searchTerm} />
            </h3>
            {isCurrentlyVerified && <Verified className="h-5 w-5 text-blue-500" />}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <HighlightedText text={categoryDisplay[professional.category] || professional.category} highlight={searchTerm} />
            </p>
            
            <div className="mt-2 mb-4 h-5">
                <ProfessionalRating professional={professional} />
            </div>
            
            <div className="flex-grow" />

            <Button asChild variant="default" className="w-full mt-6">
                <Link href={professionalUrl}>
                    <Info className="mr-2 h-4 w-4" />
                    View Profile
                </Link>
            </Button>
    </CardContent>
    </Card>
  );
}
