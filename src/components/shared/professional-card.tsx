
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon } from 'lucide-react';

interface ProfessionalCardProps {
  professional: User;
}

const categoryDisplay: Record<string, string> = {
    'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer'
};

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <Card className="h-full overflow-hidden transition-all duration-300 group hover:shadow-lg hover:border-primary">
       <CardContent className="p-6 text-center">
            <Avatar className="h-24 w-24 mx-auto border-4 border-background shadow-md">
                <AvatarImage src={professional.photoURL} alt={professional.fullName} />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {professional.fullName ? getInitials(professional.fullName) : <UserIcon />}
                </AvatarFallback>
            </Avatar>
            <h3 className="mt-4 font-bold text-lg truncate">{professional.fullName}</h3>
            <Badge variant="secondary" className="mt-1">{categoryDisplay[professional.category] || professional.category}</Badge>
            <Button asChild className="mt-4 w-full" size="sm">
                <Link href={`/professionals`}>View Details</Link>
            </Button>
       </CardContent>
    </Card>
  );
}
