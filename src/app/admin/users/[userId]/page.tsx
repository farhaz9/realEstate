
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { User, Property, Order } from '@/types';
import { Loader2, ArrowLeft, Mail, Phone, CalendarDays, User as UserIcon, Building, ShoppingBag, Verified, Coins, Minus, Plus, Ban, UserCheck, Trash2, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PropertyCard } from '@/components/property-card';
import { format, formatDistanceToNowStrict, differenceInDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPrice } from '@/lib/utils';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditUserForm } from '@/components/admin/edit-user-form';


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
  const router = useRouter();
  const userId = params.userId as string;
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [creditAmount, setCreditAmount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  type ConfirmationAction = 'delete' | 'block' | 'verify';
  const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction | null>(null);

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

  const handleVerificationToggle = () => {
    if (!firestore || !user) return;
    const userRef = doc(firestore, "users", user.id);
    const isCurrentlyVerified = user.verifiedUntil && user.verifiedUntil.toDate() > new Date();
    let updateData = {};
    if (isCurrentlyVerified) {
        updateData = { isVerified: false, verifiedUntil: null };
        toast({ title: 'Verification Revoked', description: `Pro verification has been removed for ${user.fullName}.`, variant: 'destructive' });
    } else {
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        updateData = { isVerified: true, verifiedUntil: expiryDate };
        toast({ title: 'User Verified!', description: `${user.fullName} is now a Pro Verified member for one year.`, variant: 'success' });
    }
    updateDocumentNonBlocking(userRef, updateData);
    setIsConfirmationDialogOpen(false);
  };
  
  const handleFeaturedToggle = () => {
    if (!firestore || !user) return;
    const userRef = doc(firestore, 'users', user.id);
    const isCurrentlyFeatured = user.isFeatured === undefined ? true : user.isFeatured;
    const updateData = { isFeatured: !isCurrentlyFeatured };

    updateDocumentNonBlocking(userRef, updateData);
    toast({
      title: `Professional ${!isCurrentlyFeatured ? 'Featured' : 'Unfeatured'}`,
      description: `${user.fullName} will ${!isCurrentlyFeatured ? 'now appear' : 'no longer appear'} on public pages.`,
      variant: 'success',
    });
  };

  const handleUpdateCredits = () => {
    if (!firestore || !user) return;
    const userRef = doc(firestore, 'users', user.id);
    updateDocumentNonBlocking(userRef, { listingCredits: creditAmount });
    toast({ title: 'Credits Updated', description: `${user.fullName} now has ${creditAmount} listing credits.`, variant: 'success' });
  }

  const handleUserBlockToggle = () => {
    if (!firestore || !user) return;
    const userRef = doc(firestore, "users", user.id);
    const newBlockedState = !user.isBlocked;
    updateDocumentNonBlocking(userRef, { isBlocked: newBlockedState });
    toast({ title: `User ${newBlockedState ? 'Blocked' : 'Unblocked'}`, description: `The user has been successfully ${newBlockedState ? 'blocked' : 'unblocked'}.`, variant: 'success' });
    setIsConfirmationDialogOpen(false);
  };

  const handleUserDelete = () => {
    if (!firestore || !user) return;
    const userRef = doc(firestore, "users", user.id);
    updateDocumentNonBlocking(userRef, { isBlocked: true, fullName: "Deleted User", email: `deleted-${user.id}@deleted.com` });
    toast({ title: "User Deleted", description: "The user has been marked as deleted and blocked.", variant: "destructive" });
    setIsConfirmationDialogOpen(false);
    router.push('/admin');
  };

  const handleConfirmationAction = () => {
    if (!confirmationAction) return;

    switch (confirmationAction) {
      case 'delete':
        handleUserDelete();
        break;
      case 'block':
        handleUserBlockToggle();
        break;
      case 'verify':
        handleVerificationToggle();
        break;
    }
  };

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
  
  const isProfessional = ['real-estate-agent', 'interior-designer', 'vendor'].includes(user.category);
  const isCurrentlyVerified = user.verifiedUntil && user.verifiedUntil.toDate() > new Date();
  const verificationDaysLeft = isCurrentlyVerified ? differenceInDays(user.verifiedUntil.toDate(), new Date()) : null;


  return (
    <div className="bg-muted/40 min-h-screen">
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 lg:sticky top-24 space-y-8">
                    {isEditing ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Profile</CardTitle>
                                <CardDescription>Update the user's information below.</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <EditUserForm user={user} onSuccess={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
                            </CardContent>
                        </Card>
                    ) : (
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
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="credits" className="font-semibold">Listing Credits</Label>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => setCreditAmount(user.listingCredits || 0)}>
                                        <Coins className="mr-2 h-4 w-4" /> {user.listingCredits || 0}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader><DialogTitle>Manage Credits for {user.fullName}</DialogTitle></DialogHeader>
                                    <div className="flex items-center justify-center gap-4 py-4">
                                        <Button variant="outline" size="icon" onClick={() => setCreditAmount(c => Math.max(0, c - 1))}><Minus className="h-4 w-4" /></Button>
                                        <Input type="number" className="w-24 text-center text-xl font-bold" value={creditAmount} onChange={(e) => setCreditAmount(Number(e.target.value))} />
                                        <Button variant="outline" size="icon" onClick={() => setCreditAmount(c => c + 1)}><Plus className="h-4 w-4" /></Button>
                                    </div>
                                    <DialogFooter><Button onClick={handleUpdateCredits}>Save Credits</Button></DialogFooter>
                                  </DialogContent>
                                </Dialog>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="font-semibold">Verified Status</p>
                                    {isCurrentlyVerified ? (
                                        <p className="text-xs text-green-600">Expires in {formatDistanceToNowStrict(user.verifiedUntil.toDate())}</p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Not verified</p>
                                    )}
                                </div>
                                <Button
                                    variant={isCurrentlyVerified ? 'destructive' : 'default'}
                                    size="sm"
                                    onClick={() => { setConfirmationAction('verify'); setIsConfirmationDialogOpen(true); }}
                                >
                                    <Verified className="mr-2 h-4 w-4" />
                                    {isCurrentlyVerified ? 'Revoke' : 'Grant'}
                                </Button>
                            </div>
                            
                            {isProfessional && (
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="featured-switch" className="font-semibold">Featured Professional</Label>
                                    <Switch
                                        id="featured-switch"
                                        checked={user.isFeatured === undefined ? true : user.isFeatured}
                                        onCheckedChange={handleFeaturedToggle}
                                    />
                                </div>
                            )}

                             <Separator />

                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                                    {isEditing ? <X className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                                    {isEditing ? "Cancel" : "Edit Profile"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => { setConfirmationAction('block'); setIsConfirmationDialogOpen(true); }}
                                >
                                    {user.isBlocked ? <UserCheck className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                                    {user.isBlocked ? 'Unblock' : 'Block'}
                                </Button>
                            </div>
                             <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => { setConfirmationAction('delete'); setIsConfirmationDialogOpen(true); }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                            </Button>
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
        <AlertDialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    {confirmationAction === 'delete' && `This will permanently delete the user "${user.fullName}".`}
                    {confirmationAction === 'block' && `This will ${user.isBlocked ? 'unblock' : 'block'} the user "${user.fullName}".`}
                    {confirmationAction === 'verify' && `This will ${isCurrentlyVerified ? 'revoke verification for' : 'grant verification to'} "${user.fullName}".`}
                    This action may have consequences that cannot be undone.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmationAction(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmationAction} className={confirmationAction === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
