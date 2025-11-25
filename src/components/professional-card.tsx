
import type { User } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Star, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

interface ProfessionalCardProps {
  professional: User;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {

  const categoryDisplay: Record<string, string> = {
    'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer'
  };

  // Placeholder rating
  const rating = 4.5 + (professional.fullName.length % 5) / 10;
  const starCount = 5;

  return (
    <Card className="transition-all duration-300 hover:shadow-md hover:border-primary/30">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage src={professional.photoURL} alt={professional.fullName} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <UserIcon className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-grow text-center sm:text-left">
                <h3 className="text-lg font-bold">{professional.fullName}</h3>
                <Badge variant="secondary" className="mt-1">{categoryDisplay[professional.category] || professional.category}</Badge>
                
                <div className="flex items-center justify-center sm:justify-start gap-1 text-primary mt-2">
                    {[...Array(starCount)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-current text-yellow-400' : 'text-gray-300'} ${rating % 1 !== 0 && i === Math.floor(rating) && (rating % 1) > 0.2 ? 'fill-current text-yellow-400 opacity-50' : ''}`} />
                    ))}
                    <span className="text-muted-foreground text-xs ml-1">({rating.toFixed(1)})</span>
                </div>
            </div>

            <div className="flex-shrink-0 flex flex-col gap-2 items-center sm:items-end w-full sm:w-auto">
                 <div className="space-y-1 text-xs text-muted-foreground flex flex-col items-center sm:items-end">
                    <div className="flex items-center justify-center gap-2">
                        <Mail className="h-3 w-3" />
                        <a href={`mailto:${professional.email}`} className="hover:text-primary">{professional.email}</a>
                    </div>
                    {professional.phone && (
                        <div className="flex items-center justify-center gap-2">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${professional.phone}`} className="hover:text-primary">{professional.phone}</a>
                        </div>
                    )}
                </div>
                <Button asChild size="sm" className="w-full sm:w-auto mt-2">
                    <Link href={`mailto:${professional.email}`}>Contact</Link>
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}
