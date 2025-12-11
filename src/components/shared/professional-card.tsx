
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon } from 'lucide-react';
import Image from 'next/image';

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

  // Placeholder data as it's not in the User model
  const companyName = "B S Associates";
  const reraId = "PRM/KA/RERA/121/309/AG/210107/0021";
  const operatingSince = 2010 + (professional.fullName.length % 10);
  const propertiesForSale = 10 + (professional.fullName.length % 15);
  const propertiesForRent = 5 + (professional.fullName.length % 20);

  return (
    <Card className="h-full overflow-hidden transition-all duration-300 group hover:shadow-lg hover:shadow-primary/20">
       <CardContent className="p-4">
            <div className="flex gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary">
                    <AvatarImage src={professional.photoURL} alt={professional.fullName} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {professional.fullName ? getInitials(professional.fullName) : <UserIcon />}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant="secondary">{categoryDisplay[professional.category] || professional.category}</Badge>
                            <h3 className="font-bold text-xl mt-1">{professional.fullName}</h3>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{companyName}</p>
                    <p className="text-xs text-muted-foreground truncate">RERA ID: {reraId}</p>
                </div>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
                <span>Operating Since {operatingSince}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-lg font-bold">{propertiesForSale}</p>
                    <p className="text-xs text-muted-foreground">Properties for Sale</p>
                </div>
                <div>
                    <p className="text-lg font-bold">{propertiesForRent}</p>
                    <p className="text-xs text-muted-foreground">Properties for Rent</p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
                <Button variant="link" size="sm" asChild>
                    <Link href={`/professionals/${professional.id}`}>View Details</Link>
                </Button>
                <Button size="sm" asChild className="flex-grow">
                    <Link href={`/properties?agent=${professional.id}`}>View Properties</Link>
                </Button>
            </div>
       </CardContent>
    </Card>
  );
}
