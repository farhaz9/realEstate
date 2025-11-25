
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Star } from 'lucide-react';
import Link from 'next/link';

interface ProfessionalCardProps {
  professional: User;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  // Placeholder rating
  const rating = 4.5 + (professional.fullName.length % 5) / 10;
  const starCount = 5;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="flex-grow space-y-4">
        <div className="flex items-center gap-1 text-primary">
            {[...Array(starCount)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.floor(rating) ? 'fill-current text-yellow-400' : 'text-gray-300'} ${rating % 1 !== 0 && i === Math.floor(rating) && (rating % 1) > 0.2 ? 'fill-current text-yellow-400 opacity-50' : ''}`} />
            ))}
            <span className="text-muted-foreground text-sm font-semibold ml-2">({rating.toFixed(1)} rating)</span>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <a href={`mailto:${professional.email}`} className="hover:text-primary transition-colors">{professional.email}</a>
          </div>
          {professional.phone && (
              <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <a href={`tel:${professional.phone}`} className="hover:text-primary transition-colors">{professional.phone}</a>
              </div>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
          <Button asChild className="w-full sm:w-auto">
              <Link href={`mailto:${professional.email}`}>Contact</Link>
          </Button>
      </div>
    </div>
  );
}
