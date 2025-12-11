
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useMemo, useState } from 'react';
import type { Property, User } from '@/types';
import { Loader2, ShieldAlert, Users, Building, Banknote, Tag, ArrowUpDown, Pencil, Trash2, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { UserDistributionChart } from '@/components/admin/user-distribution-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [propertySort, setPropertySort] = useState({ key: 'dateListed', direction: 'desc' });
  const [userSort, setUserSort] = useState({ key: 'dateJoined', direction: 'desc' });


  const allPropertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'properties'), orderBy(propertySort.key, propertySort.direction as 'asc' | 'desc'));
  }, [firestore, propertySort]);

  const allUsersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy(userSort.key, userSort.direction as 'asc' | 'desc'));
  }, [firestore, userSort]);

  const { data: properties, isLoading: isLoadingProperties } = useCollection<Property>(allPropertiesQuery);
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(allUsersQuery);
  
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;
  
  const stats = useMemo(() => {
    if (!properties || !users) return null;
    const propertiesForSale = properties.filter(p => p.listingType === 'sale').length;
    const propertiesForRent = properties.filter(p => p.listingType === 'rent').length;
    return {
      totalProperties: properties.length,
      totalUsers: users.length,
      propertiesForSale,
      propertiesForRent,
    };
  }, [properties, users]);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to view this page.",
        variant: "destructive",
      });
      router.push('/login');
    } else if (!isAuthorizedAdmin) {
       toast({
        title: "Access Denied",
        description: "You are not authorized to view this page.",
        variant: "destructive",
      });
      router.push('/');
    }
  }, [user, isUserLoading, router, toast, isAuthorizedAdmin]);
  
  const handlePropertyDelete = (propertyId: string) => {
    if (!firestore) return;
    const propertyRef = doc(firestore, "properties", propertyId);
    deleteDocumentNonBlocking(propertyRef);
    toast({
      title: "Property Deleted",
      description: "The property listing has been successfully removed.",
      variant: "destructive",
    });
  };

  const handlePropertySort = (key: string) => {
    setPropertySort(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  }

  const handleUserSort = (key: string) => {
    setUserSort(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  }
  
  const categoryDisplay: Record<string, string> = {
    'user': 'User',
    'listing-property': 'Property Owner',
    'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer'
  };


  const renderContent = () => {
    if (isUserLoading || isLoadingProperties || isLoadingUsers) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }
    
    if (!isAuthorizedAdmin) {
      return (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Not Authorized</AlertTitle>
              <AlertDescription>You do not have permission to access this page.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return (
        <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="mt-6">
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {users ? (
                                        <UserDistributionChart users={users} />
                                    ) : (
                                        <div className="h-[300px] flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Platform Metrics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                                        <div className="flex flex-col items-center p-4 rounded-lg bg-secondary">
                                            <Building className="h-8 w-8 text-primary mb-2" />
                                            <p className="text-3xl font-bold">{stats?.totalProperties ?? <Loader2 className="h-7 w-7 animate-spin" />}</p>
                                            <p className="text-sm text-muted-foreground">Total Properties</p>
                                        </div>
                                        <div className="flex flex-col items-center p-4 rounded-lg bg-secondary">
                                            <Users className="h-8 w-8 text-blue-500 mb-2" />
                                            <p className="text-3xl font-bold">{stats?.totalUsers ?? <Loader2 className="h-7 w-7 animate-spin" />}</p>
                                            <p className="text-sm text-muted-foreground">Total Users</p>
                                        </div>
                                        <div className="flex flex-col items-center p-4 rounded-lg bg-secondary">
                                            <Banknote className="h-8 w-8 text-green-500 mb-2" />
                                            <p className="text-3xl font-bold">{stats?.propertiesForSale ?? <Loader2 className="h-7 w-7 animate-spin" />}</p>
                                            <p className="text-sm text-muted-foreground">For Sale</p>
                                        </div>
                                        <div className="flex flex-col items-center p-4 rounded-lg bg-secondary">
                                            <Tag className="h-8 w-8 text-orange-500 mb-2" />
                                            <p className="text-3xl font-bold">{stats?.propertiesForRent ?? <Loader2 className="h-7 w-7 animate-spin" />}</p>
                                            <p className="text-sm text-muted-foreground">For Rent</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="properties" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>All Properties ({properties?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Property</TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handlePropertySort('dateListed')}>
                                        <div className="flex items-center gap-2">
                                            Date Listed <ArrowUpDown className="h-4 w-4" />
                                        </div>
                                    </TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handlePropertySort('listingType')}>
                                        <div className="flex items-center gap-2">
                                            Type <ArrowUpDown className="h-4 w-4" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {properties?.map(property => {
                                    const owner = users?.find(u => u.id === property.userId);
                                    return (
                                        <TableRow key={property.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 rounded-md">
                                                        <AvatarImage src={property.imageUrls?.[0]} alt={property.title} />
                                                        <AvatarFallback className="rounded-md">{property.title.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="truncate">
                                                        <p className="font-semibold truncate">{property.title}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{property.location.address}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {property.dateListed?.toDate ? format(property.dateListed.toDate(), 'PPP') : 'N/A'}
                                            </TableCell>
                                            <TableCell>{owner?.fullName || 'Unknown'}</TableCell>
                                            <TableCell className="capitalize">{property.listingType}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/edit/${property.id}`)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete the property "{property.title}".</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handlePropertyDelete(property.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                    </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="users" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>All Users ({users?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleUserSort('dateJoined')}>
                                            <div className="flex items-center gap-2">
                                                Date Joined <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleUserSort('category')}>
                                            <div className="flex items-center gap-2">
                                                Category <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead>Contact</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users?.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={user.photoURL} alt={user.fullName} />
                                                        <AvatarFallback>{user.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{user.fullName}</p>
                                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.dateJoined?.toDate ? format(user.dateJoined.toDate(), 'PPP') : 'N/A'}
                                            </TableCell>
                                            <TableCell>{categoryDisplay[user.category] || user.category}</TableCell>
                                            <TableCell>{user.phone || 'Not provided'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
  };

  return (
    <>
      <div className="bg-gradient-to-br from-primary via-purple-600 to-accent text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4">
                <LayoutDashboard className="h-10 w-10" />
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-primary-foreground/80">Manage users and property listings.</p>
                </div>
            </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </>
  );
}
