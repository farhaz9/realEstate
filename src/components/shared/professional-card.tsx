
'use client';

import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { User as UserIcon, Star, Mail, Verified, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfessionalCardProps {
  professional: User;
}

const categoryDisplay: Record<string, string> = {
    'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer',
    'vendor': 'Vendor / Supplier'
};

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
  );
}
