
'use client';

import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { User as UserIcon, Star, Briefcase, MapPin, BadgeCheck, PencilRuler } from 'lucide-react';
import { cn } from '@/lib/utils';


interface ProfessionalCardProps {
  professional: User;
}

const categoryDisplay: Record<string, string> = {
    'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer'
};

const categoryIcon: Record<string, React.ElementType> = {
    'real-estate-agent': Briefcase,
    'interior-designer': PencilRuler
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

  // Placeholder data for rating, since it's not in the User model
  const rating = 4.5 + (professional.fullName.length % 5) / 10;
  
  const CategoryIcon = categoryIcon[professional.category] || Briefcase;

  return (
    <Card className="h-full overflow-hidden transition-all duration-300 group hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
        <div className="relative aspect-square">
            <Avatar className="h-full w-full rounded-none">
                <AvatarImage src={professional.photoURL} alt={professional.fullName} className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <AvatarFallback className="text-5xl rounded-none bg-gradient-to-br from-primary/20 to-accent/20 text-primary flex items-center justify-center">
                    {professional.fullName ? getInitials(professional.fullName) : <UserIcon />}
                </AvatarFallback>
            </Avatar>
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1.5 text-xs font-bold shadow-md">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{rating.toFixed(1)}</span>
            </div>
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent"></div>
        </div>
       <CardContent className="p-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {professional.fullName}
                      <BadgeCheck className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{categoryDisplay[professional.category] || professional.category}</p>
                </div>
            </div>

             <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                Expert in luxury residential properties with over 10 years of experience.
             </p>
             
             <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Delhi, IN</span>
                </div>
                 <div className="flex items-center gap-1.5">
                    <CategoryIcon className="h-3.5 w-3.5" />
                    <span>{10 + professional.fullName.length % 15} Projects</span>
                </div>
             </div>

            <Button asChild className="w-full mt-4">
                <Link href={`/professionals/${professional.id}`}>View Portfolio</Link>
            </Button>
       </CardContent>
    </Card>
  );
}
