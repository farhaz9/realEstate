
import type { User } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';

interface ProfessionalCardProps {
  professional: User;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {

  const categoryDisplay: Record<string, string> = {
    'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer'
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
      <CardHeader className="items-center text-center">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarImage src={professional.photoURL} alt={professional.fullName} />
          <AvatarFallback className="text-3xl bg-muted">
            {professional.fullName?.charAt(0).toUpperCase() ?? 'P'}
          </AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent className="flex-grow text-center">
        <CardTitle className="text-xl">{professional.fullName}</CardTitle>
        <Badge variant="secondary" className="mt-2">{categoryDisplay[professional.category] || professional.category}</Badge>
        
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${professional.email}`} className="hover:text-primary">{professional.email}</a>
          </div>
           {professional.phone && (
            <div className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              <a href={`tel:${professional.phone}`} className="hover:text-primary">{professional.phone}</a>
            </div>
           )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" variant="outline">
            <Link href={`mailto:${professional.email}`}>Contact</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
