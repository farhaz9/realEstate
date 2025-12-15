
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, query, orderBy, Query, where, increment } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useMemo, useState } from 'react';
import type { Property, User, Order, AppSettings } from '@/types';
import { Loader2, ShieldAlert, Users, Building, Banknote, Tag, ArrowUpDown, Pencil, Trash2, LayoutDashboard, Crown, Verified, Ban, UserCheck, UserX, Search, Coins, Minus, Plus, ShoppingCart, Info, FileText, Edit, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc, setDoc } from 'firebase/firestore';
import { UserDistributionChart } from '@/components/admin/user-distribution-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Fuse from 'fuse.js';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { EditUserForm } from '@/components/admin/edit-user-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

const settingsFormSchema = z.object({
  listingPrice: z.coerce.number().positive(),
  verifiedPriceMonthly: z.coerce.number().positive(),
  verifiedPriceAnnually: z.coerce.number().positive(),
  listingValidityDays: z.coerce.number().int().positive(),
});
type SettingsFormValues = z.infer<typeof settingsFormSchema>;


function AppSettingsForm({ settings }: { settings: AppSettings }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            listingPrice: settings?.listingPrice || 99,
            verifiedPriceMonthly: settings?.verifiedPriceMonthly || 99,
            verifiedPriceAnnually: settings?.verifiedPriceAnnually || 1000,
            listingValidityDays: settings?.listingValidityDays || 90,
        }
    });

    useEffect(() => {
        if (settings) {
            form.reset(settings);
        }
    }, [settings, form]);

    const onSubmit = async (data: SettingsFormValues) => {
        if (!firestore) return;
        setIsSubmitting(true);
        const settingsRef = doc(firestore, "app_settings", "config");
        
        try {
            await setDoc(settingsRef, data, { merge: true });
            toast({
                title: "Settings Updated",
                description: "Application settings have been successfully saved.",
                variant: 'success'
            });
        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Manage pricing and listing configurations for the entire platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-8">
                             <FormField
                                control={form.control}
                                name="listingPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Listing Purchase Price (INR)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="listingValidityDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Listing Validity (Days)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="verifiedPriceMonthly"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monthly Verification Price (INR)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="verifiedPriceAnnually"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Annual Verification Price (INR)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Settings
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [propertySort, setPropertySort] = useState({ key: 'dateListed', direction: 'desc' });
  const [userSort, setUserSort] = useState({ key: 'dateJoined', direction: 'desc' });
  const [orderSort, setOrderSort] = useState({ key: 'date', direction: 'desc' });
  
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);

  const allPropertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'properties'), orderBy(propertySort.key, propertySort.direction as 'asc' | 'desc'));
  }, [firestore, propertySort]);

  const allUsersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('dateJoined', 'desc'));
  }, [firestore]);
  
  const appSettingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'app_settings', 'config');
  }, [firestore]);

  const { data: properties, isLoading: isLoadingProperties } = useCollection<Property>(allPropertiesQuery);
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(allUsersQuery);
  const { data: appSettings, isLoading: isLoadingSettings } = useDoc<AppSettings>(appSettingsRef);

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
  
  const userFuse = useMemo(() => {
    if (!users) return null;
    return new Fuse(users, {
      keys: ['fullName', 'email', 'phone'],
      threshold: 0.3,
    });
  }, [users]);
  
  const allOrders = useMemo(() => {
    if (!users) return [];
    return users.flatMap(u => 
        (u.orders || []).map(order => ({
            ...order,
            userId: u.id,
            userName: u.fullName,
            userEmail: u.email
        }))
    );
  }, [users]);
  
  const orderFuse = useMemo(() => {
    if (allOrders.length === 0) return null;
    return new Fuse(allOrders, {
        keys: ['userName', 'userEmail', 'paymentId'],
        threshold: 0.3
    });
  }, [allOrders]);

  const sortedAndFilteredUsers = useMemo(() => {
    if (!users) return [];
    let filtered = userSearchTerm && userFuse 
      ? userFuse.search(userSearchTerm).map(result => result.item) 
      : users;

    return [...filtered].sort((a, b) => {
        const { key, direction } = userSort;
        let valA, valB;

        if (key === 'isVerified') {
            valA = a.verifiedUntil && a.verifiedUntil.toDate() > new Date() ? 1 : 0;
            valB = b.verifiedUntil && b.verifiedUntil.toDate() > new Date() ? 1 : 0;
        } else if (key === 'dateJoined' && a.dateJoined && b.dateJoined) {
            valA = a.dateJoined?.toDate ? a.dateJoined.toDate() : new Date(0);
            valB = b.dateJoined?.toDate ? b.dateJoined.toDate() : new Date(0);
        } else {
            valA = a[key as keyof User];
            valB = b[key as keyof User];
        }

        const order = direction === 'asc' ? 1 : -1;
        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
    });
  }, [users, userSearchTerm, userFuse, userSort]);

  const sortedAndFilteredOrders = useMemo(() => {
    let filtered = orderSearchTerm && orderFuse
      ? orderFuse.search(orderSearchTerm).map(result => result.item)
      : allOrders;

    return [...filtered].sort((a, b) => {
        const { key, direction } = orderSort;
        let valA = a[key as keyof typeof a];
        let valB = b[key as keyof typeof b];

        if (key === 'date') {
            valA = a.date?.toDate ? a.date.toDate() : new Date(0);
            valB = b.date?.toDate ? b.date.toDate() : new Date(0);
        }
        
        const order = direction === 'asc' ? 1 : -1;

        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
    });
  }, [allOrders, orderSearchTerm, orderFuse, orderSort]);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      toast({ title: "Authentication Required", description: "You must be logged in to view this page.", variant: "destructive" });
      router.push('/login');
    } else if (!isAuthorizedAdmin) {
       toast({ title: "Access Denied", description: "You are not authorized to view this page.", variant: "destructive" });
      router.push('/');
    }
  }, [user, isUserLoading, router, toast, isAuthorizedAdmin]);
  
  const handlePropertyDelete = (propertyId: string) => {
    if (!firestore) return;
    const propertyRef = doc(firestore, "properties", propertyId);
    deleteDocumentNonBlocking(propertyRef);
    toast({ title: "Property Deleted", description: "The property listing has been successfully removed.", variant: "destructive" });
  };

  const handleUserDelete = (userId: string) => {
    if (!firestore) return;
    const userRef = doc(firestore, "users", userId);
    deleteDocumentNonBlocking(userRef);
    toast({ title: "User Deleted", description: "The user has been successfully removed from the database.", variant: "destructive" });
  };
  
  const handleUserBlockToggle = (userId: string, isBlocked: boolean) => {
    if (!firestore) return;
    const userRef = doc(firestore, "users", userId);
    updateDocumentNonBlocking(userRef, { isBlocked: !isBlocked });
    toast({ title: `User ${!isBlocked ? 'Blocked' : 'Unblocked'}`, description: `The user has been successfully ${!isBlocked ? 'blocked' : 'unblocked'}.`, variant: 'success' });
  };

  const handleVerificationToggle = (userId: string, user: User) => {
    if (!firestore) return;
    const userRef = doc(firestore, "users", userId);
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
  };
  
  const handleUpdateCredits = () => {
    if (!firestore || !selectedUser) return;
    const userRef = doc(firestore, 'users', selectedUser.id);
    updateDocumentNonBlocking(userRef, { listingCredits: creditAmount });
    toast({ title: 'Credits Updated', description: `${selectedUser.fullName} now has ${creditAmount} listing credits.`, variant: 'success' });
    setSelectedUser(null);
  }

  const handleSort = (setter: React.Dispatch<React.SetStateAction<{key: string, direction: string}>>, key: string) => {
    setter(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }));
  }

  const categoryDisplay: Record<string, string> = {
    'user': 'Buyer / Tenant', 'listing-property': 'Property Owner', 'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer', 'vendor': 'Vendor'
  };

  const renderContent = () => {
    if (isUserLoading || isLoadingProperties || isLoadingUsers || isLoadingSettings) {
      return <div className="flex items-center justify-center py-16"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }
    if (!isAuthorizedAdmin) {
      return (
        <Card className="max-w-md mx-auto">
          <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
          <CardContent>
            <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertTitle>Not Authorized</AlertTitle><AlertDescription>You do not have permission to access this page.</AlertDescription></Alert>
          </CardContent>
        </Card>
      );
    }
    return (
        <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="mt-6">
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <Card><CardHeader><CardTitle>User Distribution</CardTitle></CardHeader><CardContent>{users ? <UserDistributionChart users={users} /> : <div className="h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}</CardContent></Card>
                        </div>
                        <div className="lg:col-span-2">
                            <Card><CardHeader><CardTitle>Platform Metrics</CardTitle></CardHeader><CardContent><div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                                <div className="flex flex-col items-center p-4 rounded-lg bg-secondary"><Building className="h-8 w-8 text-primary mb-2" /><p className="text-3xl font-bold">{stats?.totalProperties ?? <Loader2 className="h-7 w-7 animate-spin" />}</p><p className="text-sm text-muted-foreground">Total Properties</p></div>
                                <div className="flex flex-col items-center p-4 rounded-lg bg-secondary"><Users className="h-8 w-8 text-blue-500 mb-2" /><p className="text-3xl font-bold">{stats?.totalUsers ?? <Loader2 className="h-7 w-7 animate-spin" />}</p><p className="text-sm text-muted-foreground">Total Users</p></div>
                                <div className="flex flex-col items-center p-4 rounded-lg bg-secondary"><Banknote className="h-8 w-8 text-green-500 mb-2" /><p className="text-3xl font-bold">{stats?.propertiesForSale ?? <Loader2 className="h-7 w-7 animate-spin" />}</p><p className="text-sm text-muted-foreground">For Sale</p></div>
                                <div className="flex flex-col items-center p-4 rounded-lg bg-secondary"><Tag className="h-8 w-8 text-orange-500 mb-2" /><p className="text-3xl font-bold">{stats?.propertiesForRent ?? <Loader2 className="h-7 w-7 animate-spin" />}</p><p className="text-sm text-muted-foreground">For Rent</p></div>
                            </div></CardContent></Card>
                        </div>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="properties" className="mt-6">
                <Card><CardHeader><CardTitle>All Properties ({properties?.length || 0})</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort(setPropertySort, 'dateListed')}><div className="flex items-center gap-2">Date Listed <ArrowUpDown className="h-4 w-4" /></div></TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort(setPropertySort, 'listingType')}><div className="flex items-center gap-2">Type <ArrowUpDown className="h-4 w-4" /></div></TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader><TableBody>{properties?.map(property => { const owner = users?.find(u => u.id === property.userId); return (
                    <TableRow key={property.id}><TableCell className="font-medium"><div className="flex items-center gap-3"><Avatar className="h-10 w-10 rounded-md"><AvatarImage src={property.imageUrls?.[0]} alt={property.title} /><AvatarFallback className="rounded-md">{property.title.charAt(0)}</AvatarFallback></Avatar><div className="truncate"><p className="font-semibold truncate">{property.title}</p><p className="text-xs text-muted-foreground truncate">{property.location.address}</p></div></div></TableCell>
                    <TableCell>{property.dateListed?.toDate ? format(property.dateListed.toDate(), 'PPP') : 'N/A'}</TableCell><TableCell>{owner?.fullName || 'Unknown'}</TableCell><TableCell className="capitalize">{property.listingType}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => router.push(`/admin/edit/${property.id}`)}><Pencil className="h-4 w-4" /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the property "{property.title}".</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handlePropertyDelete(property.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell>
                    </TableRow>
                )})}</TableBody></Table></div></CardContent></Card>
            </TabsContent>
            <TabsContent value="users" className="mt-6">
                <Card><CardHeader><CardTitle>All Users ({users?.length || 0})</CardTitle><div className="relative mt-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="Search by name, email, or phone..." className="pl-10" value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} /></div></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort(setUserSort, 'isVerified')}><div className="flex items-center gap-2">User <ArrowUpDown className="h-4 w-4" /></div></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort(setUserSort, 'category')}><div className="flex items-center gap-2">Role <ArrowUpDown className="h-4 w-4" /></div></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort(setUserSort, 'dateJoined')}><div className="flex items-center gap-2">Date Joined <ArrowUpDown className="h-4 w-4" /></div></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort(setUserSort, 'listingCredits')}><div className="flex items-center gap-2">Credits <ArrowUpDown className="h-4 w-4" /></div></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort(setUserSort, 'isBlocked')}><div className="flex items-center gap-2">Status <ArrowUpDown className="h-4 w-4" /></div></TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader><TableBody>{sortedAndFilteredUsers?.map(u => { const isCurrentlyVerified = u.verifiedUntil && u.verifiedUntil.toDate() > new Date(); return (
                    <TableRow key={u.id} className={u.isBlocked ? "bg-destructive/10" : ""}><TableCell><div className="flex items-center gap-3"><Avatar className="h-10 w-10"><AvatarImage src={u.photoURL} alt={u.fullName} /><AvatarFallback>{u.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar><div><div className="flex items-center gap-2"><p className="font-semibold">{u.fullName}</p>{isCurrentlyVerified && <Verified className="h-4 w-4 text-blue-500" />}</div><p className="text-xs text-muted-foreground">{u.email}</p><p className="text-xs text-muted-foreground">{u.phone}</p></div></div></TableCell>
                    <TableCell>{categoryDisplay[u.category] || u.category}</TableCell>
                    <TableCell>{u.dateJoined?.toDate ? format(u.dateJoined.toDate(), 'PPP') : 'N/A'}</TableCell>
                    <TableCell><Dialog><DialogTrigger asChild><Button variant="ghost" className="flex items-center gap-2" onClick={() => {setSelectedUser(u); setCreditAmount(u.listingCredits || 0);}}><Coins className="h-4 w-4 text-amber-500" /><span className="font-semibold">{u.listingCredits ?? 0}</span></Button></DialogTrigger>{selectedUser?.id === u.id && (<DialogContent><DialogHeader><DialogTitle>Manage Credits for {selectedUser.fullName}</DialogTitle><DialogDescription>Adjust the number of listing credits for this user.</DialogDescription></DialogHeader><div className="flex items-center justify-center gap-4 py-4"><Button variant="outline" size="icon" onClick={() => setCreditAmount(c => Math.max(0, c - 1))}><Minus className="h-4 w-4" /></Button><Input type="number" className="w-24 text-center text-xl font-bold" value={creditAmount} onChange={(e) => setCreditAmount(Number(e.target.value))} /><Button variant="outline" size="icon" onClick={() => setCreditAmount(c => c + 1)}><Plus className="h-4 w-4" /></Button></div><DialogFooter><Button onClick={handleUpdateCredits}>Save Changes</Button></DialogFooter></DialogContent>)}</Dialog></TableCell>
                    <TableCell>{u.isBlocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>}</TableCell>
                    <TableCell className="text-right">{u.email !== ADMIN_EMAIL && (<div className="flex items-center justify-end gap-1">
                        <Dialog open={isEditUserDialogOpen && selectedUser?.id === u.id} onOpenChange={(open) => { if (!open) setSelectedUser(null); setIsEditUserDialogOpen(open); }}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => { setSelectedUser(u); setIsEditUserDialogOpen(true); }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Edit User: {selectedUser?.fullName}</DialogTitle>
                                </DialogHeader>
                                {selectedUser && <EditUserForm user={selectedUser} onSuccess={() => setIsEditUserDialogOpen(false)} />}
                            </DialogContent>
                        </Dialog>
                        <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className={isCurrentlyVerified ? "text-blue-500 hover:text-blue-600" : "text-gray-400 hover:text-gray-600"}><Verified className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirm Verification</AlertDialogTitle><AlertDialogDescription>Do you want to {isCurrentlyVerified ? 'revoke' : 'grant'} Pro Verified status for {u.fullName}? {isCurrentlyVerified ? ' This will remove their badge immediately.' : ' This will grant them a badge for one year.'}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleVerificationToggle(u.id, u)}>{isCurrentlyVerified ? 'Revoke Verification' : 'Grant Verification'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                        <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className={u.isBlocked ? "text-green-600 hover:text-green-700" : "text-orange-600 hover:text-orange-700"}>{u.isBlocked ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action will {u.isBlocked ? 'unblock' : 'block'} the user "{u.fullName}". Blocked users cannot log in.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleUserBlockToggle(u.id, !!u.isBlocked)}>{u.isBlocked ? 'Unblock User' : 'Block User'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                        <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action will permanently delete the user "{u.fullName}" and all associated data. This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleUserDelete(u.id)} className="bg-destructive hover:bg-destructive/90">Delete User</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                    </div>)}</TableCell></TableRow>
                )})}</TableBody></Table></div></CardContent></Card>
            </TabsContent>
            <TabsContent value="orders" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>All Orders ({allOrders.length})</CardTitle>
                         <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Search by user, email, or payment ID..."
                                className="pl-10"
                                value={orderSearchTerm}
                                onChange={(e) => setOrderSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort(setOrderSort, 'paymentId')}>
                                            <div className="flex items-center gap-2">Payment ID <ArrowUpDown className="h-4 w-4" /></div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort(setOrderSort, 'userName')}>
                                            <div className="flex items-center gap-2">User <ArrowUpDown className="h-4 w-4" /></div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort(setOrderSort, 'date')}>
                                            <div className="flex items-center gap-2">Date <ArrowUpDown className="h-4 w-4" /></div>
                                        </TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort(setOrderSort, 'amount')}>
                                            <div className="flex items-center justify-end gap-2">Amount <ArrowUpDown className="h-4 w-4" /></div>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedAndFilteredOrders.map((order, index) => (
                                        <TableRow key={`${order.paymentId}-${index}`}>
                                            <TableCell className="font-mono text-xs">{order.paymentId}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{order.userName}</div>
                                                <div className="text-sm text-muted-foreground">{order.userEmail}</div>
                                            </TableCell>
                                            <TableCell>
                                                {order.date?.toDate ? format(order.date.toDate(), 'PPP p') : 'N/A'}
                                            </TableCell>
                                            <TableCell>{order.description}</TableCell>
                                            <TableCell className="text-right font-semibold">{formatPrice(order.amount)}</TableCell>
                                            <TableCell className="text-right">
                                                 <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Add Refund Note</DialogTitle>
                                                            <DialogDescription>Add a note for payment ID: {order.paymentId}</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="py-4">
                                                            <Textarea placeholder="Enter refund details or notes here..." />
                                                        </div>
                                                        <DialogFooter>
                                                            <Button type="submit">Save Note</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                             {sortedAndFilteredOrders.length === 0 && (
                                <div className="text-center py-16 text-muted-foreground">
                                    <ShoppingCart className="mx-auto h-12 w-12" />
                                    <h3 className="mt-4 text-xl font-semibold">No orders found</h3>
                                    <p>Try adjusting your search filters.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="settings" className="mt-6">
                {appSettings ? (
                    <AppSettingsForm settings={appSettings} />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        </CardContent>
                    </Card>
                )}
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
                    <p className="text-primary-foreground/80">Manage users, properties, and orders.</p>
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
