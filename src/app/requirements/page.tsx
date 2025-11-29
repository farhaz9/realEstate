
'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Requirement, User } from '@/types';
import { PageHero } from '@/components/shared/page-hero';
import { Loader2, User as UserIcon, Calendar, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const RequirementCard = ({ requirement, user }: { requirement: Requirement, user?: User | null }) => {
    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12 border">
                    <AvatarImage src={user?.photoURL ?? ''} alt={user?.fullName ?? 'User'} />
                    <AvatarFallback className="text-xl">
                        {user ? getInitials(user.fullName) : <UserIcon />}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{user?.fullName ?? 'Anonymous User'}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" /> 
                        Posted {formatDistanceToNow(requirement.createdAt.toDate(), { addSuffix: true })}
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">{requirement.text}</p>
            </CardContent>
            {user && (
                 <CardFooter className="flex gap-2">
                    <Button asChild className="w-full">
                        <Link href={`tel:${user.phone}`}><Phone className="mr-2"/>Call</Link>
                    </Button>
                     <Button asChild variant="secondary" className="w-full">
                        <Link href={`mailto:${user.email}`}>Email</Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}

const RequirementItem = ({ requirement }: { requirement: Requirement }) => {
    const firestore = useFirestore();
    const userRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'users', requirement.userId);
    }, [firestore, requirement.userId]);

    const { data: user, isLoading } = useDoc<User>(userRef);

    if (isLoading) {
        return (
             <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <CardTitle>Loading User...</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap text-muted-foreground">{requirement.text}</p>
                </CardContent>
            </Card>
        );
    }

    return <RequirementCard requirement={requirement} user={user} />
}


export default function RequirementsPage() {
  const firestore = useFirestore();
  const { user: currentUser, isUserLoading } = useUser();
  const requirementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'requirements'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: requirements, isLoading, error } = useCollection<Requirement>(requirementsQuery);
  
  const renderContent = () => {
    if (isLoading || isUserLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    
    if (error) {
        return <div className="text-center text-destructive py-16">Error: {error.message}</div>;
    }

    if (requirements && requirements.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requirements.map((req) => <RequirementItem key={req.id} requirement={req} />)}
        </div>
      );
    }

    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-2xl font-semibold">No requirements posted yet.</h3>
            <p className="text-muted-foreground mt-2">Check back later to see what buyers are looking for.</p>
        </div>
    );
  };

  return (
    <>
      <PageHero
        title="User Requirements"
        subtitle="Discover what potential buyers and tenants are looking for in the market."
        image={{ id: 'contact-hero', imageHint: 'people discussing' }}
      />
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">All User Postings ({requirements?.length || 0})</h2>
        {renderContent()}
      </div>
    </>
  );
}

    