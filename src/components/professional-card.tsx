
import type { User } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Star } from 'lucide-react';
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
  const rating = 4.5;
  const starCount = 5;

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/30">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-primary/20 flex-shrink-0">
              <AvatarImage src={professional.photoURL} alt={professional.fullName} />
              <AvatarFallback className="text-3xl bg-muted">
                {professional.fullName?.charAt(0).toUpperCase() ?? 'P'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-grow text-center sm:text-left">
                <div className='sm:flex items-center gap-4'>
                    <h3 className="text-xl font-bold">{professional.fullName}</h3>
                    <Badge variant="secondary" className="mt-1 sm:mt-0">{categoryDisplay[professional.category] || professional.category}</Badge>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-primary mt-1">
                    {[...Array(starCount)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-current' : ''} ${rating % 1 !== 0 && i === Math.floor(rating) ? 'text-yellow-400' : ''}`} />
                    ))}
                    <span className="text-muted-foreground text-sm ml-1">({rating})</span>
                </div>
                
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${professional.email}`} className="hover:text-primary">{professional.email}</a>
                    </div>
                    {professional.phone && (
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${professional.phone}`} className="hover:text-primary">{professional.phone}</a>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex-shrink-0 mt-4 sm:mt-0">
                 <Button asChild className="w-full sm:w-auto">
                    <Link href={`mailto:${professional.email}`}>Contact Now</Link>
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}
