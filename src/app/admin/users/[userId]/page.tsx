
'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { User, Property, Order } from '@/types';
import { Loader2, ArrowLeft, Mail, Phone, CalendarDays, User as UserIcon, Building, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PropertyCard } from '@/components/property-card';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPrice } from '@/lib/utils';

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const categoryDisplay: Record<string, string> = {
    'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer',
    'listing-property': 'Property Owner',
    'vendor': 'Vendor / Supplier',
    'user': 'Buyer / Tenant'
};

function UserDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 lg:sticky top-24">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <Skeleton className="h-28 w-28 rounded-full" />
                            <div className="pt-4 space-y-2">
                                <Skeleton className="h-7 w-40" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                             <Separator className="my-4"/>
                             <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                             </div>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/2" />
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="flex flex-col h-full overflow-hidden border rounded-lg">
                                        <Skeleton className="h-56 w-full" />
                                        <div className="p-6 flex-grow flex flex-col space-y-3">
                                            <Skeleton className="h-6 w-1/3" />
                                            <Skeleton className="h-5 w-2/3" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                        <CardContent><Skeleton className="h-32 w-full" /></CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.userId as string;
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const { data: user, isLoading: isLoadingUser, error } = useDoc<User>(userRef);
  
  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'properties'), where('userId', '==', userId));
  }, [firestore, userId]);

  const { data: properties, isLoading: isLoadingProperties } = useCollection<Property>(propertiesQuery);
  
  const isLoading = isLoadingUser || isLoadingProperties;

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold">User Not Found</h2>
        <p className="text-muted-foreground">We couldn't find the user you were looking for.</p>
        {error && <p className="text-destructive text-sm mt-2">{error.message}</p>}
        <Button asChild className="mt-4">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-muted/40 min-h-screen">
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin</Link>
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 lg:sticky top-24">
                    <Card>
                        <CardHeader className="items-center text-center">
                           <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                                <AvatarImage src={user.photoURL} alt={user.fullName} className="object-cover" />
                                <AvatarFallback className="text-4xl">
                                    {getInitials(user.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="pt-4">
                                <div className="flex items-center justify-center gap-2">
                                    <h1 className="text-2xl font-bold">{user.fullName}</h1>
                                </div>
                                <p className="text-muted-foreground">{categoryDisplay[user.category] || user.category}</p>
                                {user.isBlocked ? <Badge variant="destructive" className="mt-2">Blocked</Badge> : <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">Active</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm">
                             {user.bio && (
                                <>
                                 <p className="text-center text-muted-foreground mb-4">{user.bio}</p>
                                 <Separator className="my-4"/>
                                </>
                            )}
                             <div className="space-y-4">
                               <div className="flex items-start gap-4">
                                 <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                                 <div>
                                   <p className="font-semibold">Date Joined</p>
                                   <p className="text-muted-foreground">{user.dateJoined?.toDate ? format(user.dateJoined.toDate(), 'PPP') : 'N/A'}</p>
                                 </div>
                               </div>
                               <div className="flex items-start gap-4">
                                 <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                 <div>
                                   <p className="font-semibold">Email</p>
                                   <a href={`mailto:${user.email}`} className="text-primary hover:underline">{user.email}</a>
                                 </div>
                               </div>
                               <div className="flex items-start gap-4">
                                 <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                 <div>
                                   <p className="font-semibold">Phone</p>
                                   <a href={`tel:${user.phone}`} className="text-primary hover:underline">{user.phone}</a>
                                 </div>
                               </div>
                             </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-6 w-6 text-primary" />
                                User Listings ({properties?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {properties && properties.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {properties.map(property => (
                                        <PropertyCard key={property.id} property={property} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                    <h3 className="text-xl font-semibold">No Listings Found</h3>
                                    <p className="text-muted-foreground mt-2">{user.fullName} hasn't listed any properties yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="h-6 w-6 text-primary" />
                                Order History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             {user.orders && user.orders.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                        <TableHead>Payment ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {user.orders.sort((a: Order, b: Order) => b.date.toMillis() - a.date.toMillis()).map((order: Order) => (
                                        <TableRow key={order.paymentId}>
                                            <TableCell className="font-mono text-xs">{order.paymentId}</TableCell>
                                            <TableCell>{order.date?.toDate ? format(order.date.toDate(), 'PPP p') : 'N/A'}</TableCell>
                                            <TableCell>{order.description || 'N/A'}</TableCell>
                                            <TableCell className="text-right font-semibold">{formatPrice(order.amount)}</TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             ) : (
                                 <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                    <h3 className="text-xl font-semibold">No Orders Found</h3>
                                    <p className="text-muted-foreground mt-2">{user.fullName} has not made any purchases yet.</p>
                                </div>
                             )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
}

    