

'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, query, orderBy, Query, where, increment, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useMemo, useState } from 'react';
import type { Property, User, Transaction, AppSettings, Lead } from '@/types';
import { Loader2, ShieldAlert, Users, Building, Receipt, Tag, ArrowUpDown, Pencil, Trash2, LayoutDashboard, Crown, Verified, Ban, UserCheck, UserX, Search, Coins, Minus, Plus, ShoppingCart, Info, FileText, Edit, Settings, BadgeDollarSign, UserRoundCheck, CheckCircle, XCircle, Megaphone, Send, Upload, MoreVertical, Filter, Mail, Clock, Menu, ChevronDown, Handshake, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { UserStatusChart } from '@/components/admin/user-status-chart';
import { UserGrowthChart } from '@/components/admin/user-growth-chart';
import { PropertyListingsChart } from '@/components/admin/property-listings-chart';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar as CalendarIcon } from '@/components/ui/calendar';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

type ConfirmationAction = {
  action: 'delete' | 'block' | 'verify';
  user: User;
  role?: 'admin' | 'editor' | 'viewer' | 'user';
} | null;

const settingsFormSchema = z.object({
  listingPrice: z.coerce.number().positive(),
  verifiedPriceMonthly: z.coerce.number().positive(),
  verifiedPriceAnnually: z.coerce.number().positive(),
  listingValidityDays: z.coerce.number().int().positive(),
});
type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const announcementFormSchema = z.object({
    text: z.string().min(1, 'Announcement text cannot be empty.'),
    url: z.string().url().optional().or(z.literal('')),
    enabled: z.boolean(),
});
type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

const notificationFormSchema = z.object({
    audience: z.enum(['all', 'verified']),
    message: z.string().min(1, 'Notification message cannot be empty.'),
});
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const userFilterOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'verified', label: 'Verified' },
    { value: 'disabled', label: 'Disabled' },
    { value: 'agent', label: 'Agents' },
    { value: 'designer', label: 'Designers' },
    { value: 'vendor', label: 'Vendors' },
];

const propertyFilterOptions = [
    { value: 'all', label: 'All Properties' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

const transactionFilterOptions = [
    { value: 'all', label: 'All Transactions' },
    { value: 'listing', label: 'Listing Credit' },
    { value: 'verification', label: 'Verification' },
];

const adminTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'properties', label: 'Properties', icon: Building },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'leads', label: 'Leads', icon: Handshake },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'notifications', label: 'Notifications', icon: Megaphone },
  { id: 'settings', label: 'Settings', icon: Settings },
];


function AnnouncementForm({ settings }: { settings: AppSettings | null }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(announcementFormSchema),
        defaultValues: {
            text: settings?.announcement?.text || '',
            url: settings?.announcement?.url || '',
            enabled: settings?.announcement?.enabled || false,
        },
    });

     useEffect(() => {
        if (settings?.announcement) {
            form.reset(settings.announcement);
        }
    }, [settings, form]);

    const onSubmit = async (data: AnnouncementFormValues) => {
        if (!firestore) return;
        setIsSubmitting(true);
        const settingsRef = doc(firestore, "app_settings", "config");
        
        try {
            await setDoc(settingsRef, { announcement: data }, { merge: true });
            toast({
                title: "Announcement Updated",
                description: "The site-wide announcement banner has been updated.",
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
                <CardTitle>Announcement Banner</CardTitle>
                <CardDescription>Control the announcement banner displayed at the top of the site.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="text"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Banner Text</FormLabel>
                                    <FormControl>
                                        <Input placeholder="E.g., Special offer: 50% off on all premium listings!" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Banner URL (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com/special-offer" {...field} />
                                    </FormControl>
                                    <FormDescription>Make the banner clickable by adding a full URL.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="enabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Banner</FormLabel>
                                        <FormDescription>Show this announcement banner to all visitors.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Announcement
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

function AppSettingsForm({ settings }: { settings: AppSettings | null }) {
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
  
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
        audience: 'all',
        message: '',
    },
  });

  const [isSendingNotification, setIsSendingNotification] = useState(false);
  
  const [propertySort, setPropertySort] = useState({ key: 'dateListed', direction: 'desc' });
  const [userSort, setUserSort] = useState({ key: 'dateJoined', direction: 'desc' });
  const [transactionSort, setTransactionSort] = useState({ key: 'date', direction: 'desc' });
  const [leadSort, setLeadSort] = useState({ key: 'leadDate', direction: 'desc' });
  
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [propertySearchTerm, setPropertySearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const [leadSearchTerm, setLeadSearchTerm] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [rank, setRank] = useState(0);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [propertyToReject, setPropertyToReject] = useState<Property | null>(null);
  const [propertyToEditExpiry, setPropertyToEditExpiry] = useState<Property | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState<Date | undefined>(undefined);

  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction>(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [userFilter, setUserFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [transactionFilter, setTransactionFilter] = useState('all');


  const allPropertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'properties'), orderBy('dateListed', 'desc'));
  }, [firestore]);

  const allUsersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('dateJoined', 'desc'));
  }, [firestore]);
  
  const allLeadsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'leads'), orderBy('leadDate', 'desc'));
  }, [firestore]);
  
  const appSettingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'app_settings', 'config');
  }, [firestore]);

  const { data: properties, isLoading: isLoadingProperties } = useCollection<Property>(allPropertiesQuery);
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(allUsersQuery);
  const { data: leads, isLoading: isLoadingLeads } = useCollection<Lead>(allLeadsQuery);
  const { data: appSettings, isLoading: isLoadingSettings } = useDoc<AppSettings>(appSettingsRef);

  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;
  
  const allTransactions = useMemo(() => {
    if (!users) return [];
    return users.flatMap(u => {
        const userTransactions = (u.transactions || []).map(transaction => ({
            ...transaction,
            userId: u.id,
            userName: u.fullName,
            userEmail: u.email,
            description: transaction.description || 'N/A',
        }));
        // @ts-ignore - Handle legacy 'orders' field
        const legacyOrders = (u.orders || []).map(order => ({
             ...order,
            userId: u.id,
            userName: u.fullName,
            userEmail: u.email,
            description: order.description || 'N/A',
        }));
        return [...userTransactions, ...legacyOrders];
    });
  }, [users]);
  
  const stats = useMemo(() => {
    if (!properties || !users || !leads) return null;
    const verifiedUsersCount = users.filter(u => u.isVerified && u.verifiedUntil && u.verifiedUntil.toDate() > new Date()).length;
    const totalRevenue = allTransactions.reduce((acc, transaction) => acc + transaction.amount, 0);

    return {
      totalUsers: users.length,
      totalProperties: properties.length,
      totalLeads: leads.length,
      verifiedUsers: verifiedUsersCount,
      totalRevenue,
    };
  }, [properties, users, allTransactions, leads]);
  
  const userFuse = useMemo(() => {
    if (!users) return null;
    return new Fuse(users, {
      keys: ['fullName', 'email', 'phone'],
      threshold: 0.3,
    });
  }, [users]);

  const propertyFuse = useMemo(() => {
    if (!properties) return null;
    return new Fuse(properties, {
        keys: ['title', 'location.address', 'id'],
        threshold: 0.3
    });
  }, [properties]);

  const leadFuse = useMemo(() => {
    if (!leads) return null;
    return new Fuse(leads, {
      keys: ['propertyTitle', 'agentName', 'inquiringUserName', 'inquiringUserEmail'],
      threshold: 0.3,
    });
  }, [leads]);
  
  const transactionFuse = useMemo(() => {
    if (allTransactions.length === 0) return null;
    return new Fuse(allTransactions, {
        keys: ['userName', 'userEmail', 'paymentId', 'description'],
        threshold: 0.3
    });
  }, [allTransactions]);

  const sortedAndFilteredUsers = useMemo(() => {
    if (!users) return [];
    
    let baseUsers = users;

    if (userFilter !== 'all') {
        if (userFilter === 'verified') {
            baseUsers = baseUsers.filter(u => u.isVerified && u.verifiedUntil && u.verifiedUntil.toDate() > new Date());
        } else if (userFilter === 'disabled') {
            baseUsers = baseUsers.filter(u => u.isBlocked);
        } else if (userFilter === 'agent') {
            baseUsers = baseUsers.filter(u => u.category === 'real-estate-agent');
        } else if (userFilter === 'designer') {
            baseUsers = baseUsers.filter(u => u.category === 'interior-designer');
        } else if (userFilter === 'vendor') {
            baseUsers = baseUsers.filter(u => u.category === 'vendor');
        }
    }

    let filtered = userSearchTerm && userFuse
      ? userFuse.search(userSearchTerm, { store: baseUsers }).map(result => result.item)
      : baseUsers;

    return [...filtered].sort((a, b) => {
        const { key, direction } = userSort;
        let valA: any, valB: any;

        if (key === 'isVerified') {
            valA = a.verifiedUntil && a.verifiedUntil.toDate() > new Date() ? 1 : 0;
            valB = b.verifiedUntil && b.verifiedUntil.toDate() > new Date() ? 1 : 0;
        } else if (key === 'dateJoined' && a.dateJoined && b.dateJoined) {
            valA = a.dateJoined?.toDate ? a.dateJoined.toDate().getTime() : 0;
            valB = b.dateJoined?.toDate ? b.dateJoined.toDate().getTime() : 0;
        } else if (key === 'rank') {
            valA = a.rank ?? Infinity;
            valB = b.rank ?? Infinity;
        } else {
            valA = a[key as keyof User];
            valB = b[key as keyof User];
        }

        const order = direction === 'asc' ? 1 : -1;
        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
    });
  }, [users, userSearchTerm, userFuse, userSort, userFilter]);

  const sortedAndFilteredProperties = useMemo(() => {
    if (!properties) return [];

    let baseProperties = properties;
    if (propertyFilter !== 'all') {
        baseProperties = baseProperties.filter(p => p.status === propertyFilter);
    }
    
    let filtered = propertySearchTerm && propertyFuse
        ? propertyFuse.search(propertySearchTerm, { store: baseProperties }).map(result => result.item)
        : baseProperties;
    
    return [...filtered].sort((a, b) => {
        const { key, direction } = propertySort;
        let valA: any = a[key as keyof Property];
        let valB: any = b[key as keyof Property];

        if (key === 'dateListed' && a.dateListed && b.dateListed) {
            valA = a.dateListed?.toDate ? a.dateListed.toDate().getTime() : 0;
            valB = b.dateListed?.toDate ? b.dateListed.toDate().getTime() : 0;
        }

        const order = direction === 'asc' ? 1 : -1;
        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
    });
  }, [properties, propertySearchTerm, propertyFuse, propertySort, propertyFilter]);


  const sortedAndFilteredLeads = useMemo(() => {
    if (!leads) return [];
    
    let filtered = leadSearchTerm && leadFuse
      ? leadFuse.search(leadSearchTerm).map(result => result.item)
      : leads;

    return [...filtered].sort((a, b) => {
        const { key, direction } = leadSort;
        let valA: any = a[key as keyof Lead];
        let valB: any = b[key as keyof Lead];
        
        if (key === 'leadDate') {
            valA = a.leadDate?.toDate ? a.leadDate.toDate().getTime() : 0;
            valB = b.leadDate?.toDate ? b.leadDate.toDate().getTime() : 0;
        }

        const order = direction === 'asc' ? 1 : -1;
        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
    });
  }, [leads, leadSearchTerm, leadFuse, leadSort]);

  const sortedAndFilteredTransactions = useMemo(() => {
    let baseTransactions = allTransactions;

    if (transactionFilter !== 'all') {
        if (transactionFilter === 'listing') {
            baseTransactions = baseTransactions.filter(o => o.description?.toLowerCase().includes('listing'));
        } else if (transactionFilter === 'verification') {
            baseTransactions = baseTransactions.filter(o => o.description?.toLowerCase().includes('verification'));
        }
    }

    let filtered = transactionSearchTerm && transactionFuse
      ? transactionFuse.search(transactionSearchTerm, { store: baseTransactions }).map(result => result.item)
      : baseTransactions;

    return [...filtered].sort((a, b) => {
        const { key, direction } = transactionSort;
        let valA: any = a[key as keyof typeof a];
        let valB: any = b[key as keyof typeof b];

        if (key === 'date') {
            valA = a.date?.toDate ? a.date.toDate().getTime() : 0;
            valB = b.date?.toDate ? b.date.toDate().getTime() : 0;
        }
        
        const order = direction === 'asc' ? 1 : -1;

        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
    });
  }, [allTransactions, transactionSearchTerm, transactionFuse, transactionSort, transactionFilter]);

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
  
  const handlePropertyStatusChange = (propertyId: string, status: 'approved' | 'rejected', reason?: string) => {
    if (!firestore) return;
    const propertyRef = doc(firestore, 'properties', propertyId);
    const updateData: { status: string; rejectionReason?: string } = { status };
    if (status === 'rejected') {
        updateData.rejectionReason = reason || 'No reason provided.';
    } else {
        updateData.rejectionReason = ''; // Clear reason on approval
    }
    updateDocumentNonBlocking(propertyRef, updateData);
    toast({
      title: `Property ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      description: `The property has been successfully ${status}.`,
      variant: 'success',
    });
    if (propertyToReject) {
        setPropertyToReject(null);
        setRejectionReason('');
    }
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
    toast({ title: `User ${!isBlocked ? 'Disabled' : 'Enabled'}`, description: `The user has been successfully ${!isBlocked ? 'disabled' : 'enabled'}.`, variant: 'success' });
  };

  const handleVerificationToggle = (user: User) => {
    if (!firestore) return;
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
  };
  
  const handleFeaturedToggle = (user: User) => {
    if (!firestore) return;
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
    if (!firestore || !selectedUser) return;
    const userRef = doc(firestore, 'users', selectedUser.id);
    updateDocumentNonBlocking(userRef, { listingCredits: creditAmount });
    toast({ title: 'Credits Updated', description: `${selectedUser.fullName} now has ${creditAmount} listing credits.`, variant: 'success' });
    setSelectedUser(null);
  }

  const handleUpdateRank = () => {
    if (!firestore || !selectedUser) return;
    const userRef = doc(firestore, 'users', selectedUser.id);
    updateDocumentNonBlocking(userRef, { rank: rank });
    toast({ title: 'Rank Updated', description: `${selectedUser.fullName}'s rank is now ${rank}.`, variant: 'success' });
    setSelectedUser(null);
  }
  
  const handleExpiryDateChange = () => {
    if (!firestore || !propertyToEditExpiry || !newExpiryDate) return;
    const propertyRef = doc(firestore, 'properties', propertyToEditExpiry.id);
    updateDocumentNonBlocking(propertyRef, { expiresAt: newExpiryDate });
    toast({ title: 'Expiration Updated', description: `The expiration date for "${propertyToEditExpiry.title}" has been updated.`, variant: 'success' });
    setPropertyToEditExpiry(null);
    setNewExpiryDate(undefined);
  };

  const handleSort = (setter: React.Dispatch<React.SetStateAction<{ key: string; direction: string; }>>, key: string) => {
    setter(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }));
  };


  const onNotificationSubmit = async (data: NotificationFormValues) => {
    if (!firestore || !appSettingsRef) return;
    setIsSendingNotification(true);
    
    const notificationData = {
        text: data.message,
        audience: data.audience,
        timestamp: new Date().toISOString(),
    };
    
    try {
        await setDoc(appSettingsRef, { notification: notificationData }, { merge: true });
        toast({
            title: "Notification Sent!",
            description: "Your notification has been sent to the targeted users.",
            variant: "success",
        });
        notificationForm.reset();
    } catch (error: any) {
        toast({
            title: "Failed to Send Notification",
            description: error.message,
            variant: "destructive",
        });
    } finally {
        setIsSendingNotification(false);
    }
  };

  const handleConfirmationAction = () => {
    if (!confirmationAction) return;

    switch (confirmationAction.action) {
      case 'delete':
        handleUserDelete(confirmationAction.user.id);
        break;
      case 'block':
        handleUserBlockToggle(confirmationAction.user.id, !!confirmationAction.user.isBlocked);
        break;
      case 'verify':
        handleVerificationToggle(confirmationAction.user);
        break;
    }
    setConfirmationAction(null);
  };

  const categoryDisplay: Record<string, string> = {
    'user': 'Buyer / Tenant', 'listing-property': 'Property Owner', 'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer', 'vendor': 'Vendor'
  };
  
  const currentTabLabel = adminTabs.find(tab => tab.id === activeTab)?.label || 'Dashboard';
  const CurrentTabIcon = adminTabs.find(tab => tab.id === activeTab)?.icon || LayoutDashboard;

  const renderContent = () => {
    if (isUserLoading) {
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          
          {/* Desktop Tabs */}
          <div className="hidden sm:block w-full sm:w-auto bg-muted p-1.5 rounded-xl">
             <div className="flex items-center gap-1">
                {adminTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all text-center flex items-center gap-2",
                            activeTab === tab.id
                                ? "shadow-sm bg-white dark:bg-gray-700 text-primary dark:text-white ring-1 ring-black/5 dark:ring-white/10"
                                : "bg-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
             </div>
          </div>

          {/* Mobile Dropdown */}
          <div className="sm:hidden w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <CurrentTabIcon className="h-4 w-4" />
                    {currentTabLabel}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {adminTabs.map(tab => (
                   <DropdownMenuItem key={tab.id} onSelect={() => setActiveTab(tab.id)}>
                      <tab.icon className="mr-2 h-4 w-4" />
                      <span>{tab.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Export Data</Button>
        </div>
          <TabsContent value="dashboard" className="mt-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card
                      className="relative overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => { setUserFilter('all'); setActiveTab('users'); }}
                    >
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">TOTAL USERS</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingUsers ? <Skeleton className="h-8 w-24" /> : <p className="text-3xl font-bold">{stats?.totalUsers}</p>}
                            <p className="text-xs text-muted-foreground">Click to view all users</p>
                            <Users className="absolute -right-4 -bottom-4 h-24 w-24 text-muted" />
                        </CardContent>
                    </Card>
                    <Card
                      className="relative overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setActiveTab('properties')}
                    >
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">TOTAL PROPERTIES</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingProperties ? <Skeleton className="h-8 w-24" /> : <p className="text-3xl font-bold">{stats?.totalProperties}</p>}
                            <p className="text-xs text-muted-foreground">Click to view all properties</p>
                             <Building className="absolute -right-4 -bottom-4 h-24 w-24 text-muted" />
                        </CardContent>
                    </Card>
                     <Card
                      className="relative overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setActiveTab('leads')}
                    >
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">TOTAL LEADS</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingLeads ? <Skeleton className="h-8 w-24" /> : <p className="text-3xl font-bold">{stats?.totalLeads}</p>}
                            <p className="text-xs text-muted-foreground">Click to view all leads</p>
                             <Handshake className="absolute -right-4 -bottom-4 h-24 w-24 text-muted" />
                        </CardContent>
                    </Card>
                    <Card
                      className="relative overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => { setUserFilter('verified'); setActiveTab('users'); }}
                    >
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">ACTIVE SUBSCRIPTIONS</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingUsers ? <Skeleton className="h-8 w-24" /> : <p className="text-3xl font-bold">{stats?.verifiedUsers}</p>}
                            <p className="text-xs text-muted-foreground">Click to view verified users</p>
                             <Verified className="absolute -right-4 -bottom-4 h-24 w-24 text-muted" />
                        </CardContent>
                    </Card>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                     <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>User Growth</CardTitle>
                            <CardDescription>Monthly user registrations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {users ? <UserGrowthChart users={users} /> : <div className="h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>User Demographics</CardTitle>
                            <CardDescription>Distribution by user category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {users ? <UserDistributionChart users={users} /> : <div className="h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>User Status</CardTitle>
                            <CardDescription>Verified, Active, and Blocked users</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {users ? <UserStatusChart users={users} /> : <div className="h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Property Listings</CardTitle>
                            <CardDescription>Monthly property submissions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {properties ? <PropertyListingsChart properties={properties} /> : <div className="h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                        </CardContent>
                    </Card>
                </div>
          </TabsContent>
          <TabsContent value="properties" className="mt-6">
              <Card><CardHeader>
                  <CardTitle>All Properties ({properties?.length || 0})</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                      <div className="relative flex-grow">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input placeholder="Search by title, address, or ID..." className="pl-10" value={propertySearchTerm} onChange={(e) => setPropertySearchTerm(e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                           <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          {propertyFilterOptions.map(option => (
                               <Button key={option.value} variant={propertyFilter === option.value ? 'default' : 'outline'} size="sm" onClick={() => setPropertyFilter(option.value)} className="flex-shrink-0">{option.label}</Button>
                          ))}
                      </div>
                    </div>
              </CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => handleSort(setPropertySort, 'dateListed')}><div className="flex items-center gap-2">Date Listed <ArrowUpDown className="h-4 w-4" /></div></TableHead>
                  <TableHead className="hidden lg:table-cell">Expires At</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort(setPropertySort, 'status')}><div className="flex items-center gap-2">Status <ArrowUpDown className="h-4 w-4" /></div></TableHead>
                  <TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader><TableBody>{sortedAndFilteredProperties?.map(property => (
                  <TableRow key={property.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/properties/${property.id}`} className="flex items-center gap-3 group">
                            <Avatar className="h-10 w-10 rounded-md"><AvatarImage src={property.imageUrls?.[0]} alt={property.title} /><AvatarFallback className="rounded-md">{property.title.charAt(0)}</AvatarFallback></Avatar>
                            <div className="truncate">
                                <p className="font-semibold truncate group-hover:underline">{property.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{property.location.address}</p>
                            </div>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{property.dateListed?.toDate ? format(property.dateListed.toDate(), 'PPP') : 'N/A'}</TableCell>
                       <TableCell className="hidden lg:table-cell">
                        {property.expiresAt?.toDate ? (
                          <div className="flex items-center gap-2">
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 cursor-pointer">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>{formatDistanceToNow(property.expiresAt.toDate(), { addSuffix: true })}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{format(property.expiresAt.toDate(), 'PPP p')}</p>
                                    </TooltipContent>
                                </Tooltip>
                             </TooltipProvider>
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setPropertyToEditExpiry(property); setNewExpiryDate(property.expiresAt.toDate()); }}>
                                <Pencil className="h-3 w-3" />
                             </Button>
                          </div>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell><Badge variant={property.status === 'approved' ? 'success' : property.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize">{property.status}</Badge></TableCell>
                      <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                              {property.status === 'pending' && (
                                  <>
                                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handlePropertyStatusChange(property.id, 'approved')}>Approve</Button>
                                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setPropertyToReject(property)}>Reject</Button>
                                  </>
                              )}
                              {property.status === 'approved' && (
                                  <>
                                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setPropertyToReject(property)}>Reject</Button>
                                  </>
                              )}
                              {property.status === 'rejected' && (
                                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handlePropertyStatusChange(property.id, 'approved')}>Approve</Button>
                              )}
                              <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the property "{property.title}".</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handlePropertyDelete(property.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                          </div>
                      </TableCell>
                  </TableRow>
              ))}</TableBody></Table></div></CardContent></Card>
          </TabsContent>
          <TabsContent value="users" className="mt-6">
              <Card><CardHeader><CardTitle>All Users ({users?.length || 0})</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input placeholder="Search by name, email, or phone..." className="pl-10" value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                      <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      {userFilterOptions.map(option => (
                           <Button key={option.value} variant={userFilter === option.value ? 'default' : 'outline'} size="sm" onClick={() => setUserFilter(option.value)} className="flex-shrink-0">{option.label}</Button>
                      ))}
                  </div>
                </div>
              </CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort(setUserSort, 'fullName')}><div className="flex items-center gap-2">User <ArrowUpDown className="h-4 w-4" /></div></TableHead>
                  <TableHead className="cursor-pointer hidden sm:table-cell" onClick={() => handleSort(setUserSort, 'category')}><div className="flex items-center gap-2">Role <ArrowUpDown className="h-4 w-4" /></div></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort(setUserSort, 'rank')}><div className="flex items-center gap-2">Rank <ArrowUpDown className="h-4 w-4" /></div></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort(setUserSort, 'listingCredits')}><div className="flex items-center gap-2">Credits <ArrowUpDown className="h-4 w-4" /></div></TableHead>
                  <TableHead>Feature</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort(setUserSort, 'isBlocked')}><div className="flex items-center gap-2">Status <ArrowUpDown className="h-4 w-4" /></div></TableHead>
                  <TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader><TableBody>{sortedAndFilteredUsers?.map(u => { const isAdminUser = u.email === ADMIN_EMAIL; const isCurrentlyVerified = (u.verifiedUntil && u.verifiedUntil.toDate() > new Date()); const verificationDaysLeft = isCurrentlyVerified ? differenceInDays(u.verifiedUntil.toDate(), new Date()) : null; const isProfessional = ['real-estate-agent', 'interior-designer', 'vendor'].includes(u.category); return (
                  <TableRow key={u.id} className={cn(u.isBlocked ? "bg-destructive/10" : "", isAdminUser && "bg-primary/10")}>
                    <TableCell>
                      <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 group">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={u.photoURL} alt={u.fullName} />
                          <AvatarFallback>{u.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold group-hover:underline">{u.fullName}</p>
                            {isAdminUser && <Badge variant="destructive">Admin</Badge>}
                             {isCurrentlyVerified && !isAdminUser && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Verified className="h-4 w-4 text-blue-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{verificationDaysLeft} days left</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{categoryDisplay[u.category] || u.category}</p>
                        </div>
                      </Link>
                    </TableCell>
                  <TableCell className="hidden sm:table-cell">{categoryDisplay[u.category] || u.category}</TableCell>
                  <TableCell>
                      <Dialog>
                          <DialogTrigger asChild>
                              <Button variant="ghost" onClick={() => { setSelectedUser(u); setRank(u.rank ?? 0); }} disabled={isAdminUser}>{isAdminUser ? 'N/A' : u.rank ?? 'N/A'}</Button>
                          </DialogTrigger>
                          {selectedUser?.id === u.id && (
                              <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Set Rank for {selectedUser.fullName}</DialogTitle>
                                  </DialogHeader>
                                  <div className="flex items-center justify-center gap-4 py-4">
                                      <Button variant="outline" size="icon" className="rounded-full" onClick={() => setRank(c => Math.max(0, c - 1))}><Minus className="h-4 w-4" /></Button>
                                      <Input type="number" className="w-24 text-center text-xl font-bold" value={rank} onChange={(e) => setRank(Number(e.target.value))} />
                                      <Button variant="outline" size="icon" className="rounded-full" onClick={() => setRank(c => c + 1)}><Plus className="h-4 w-4" /></Button>
                                  </div>
                                  <DialogFooter><Button onClick={handleUpdateRank}>Set Rank</Button></DialogFooter>
                              </DialogContent>
                          )}
                      </Dialog>
                  </TableCell>
                  <TableCell>
                      <Dialog>
                          <DialogTrigger asChild>
                              <Button variant="ghost" onClick={() => { setSelectedUser(u); setCreditAmount(u.listingCredits ?? 0); }} disabled={isAdminUser}><Coins className="mr-2 h-4 w-4 text-amber-500" />{isAdminUser ? 1000 : (u.listingCredits ?? 0)}</Button>
                          </DialogTrigger>
                          {selectedUser?.id === u.id && (
                              <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Manage Credits for {selectedUser.fullName}</DialogTitle>
                                  </DialogHeader>
                                  <div className="flex items-center justify-center gap-4 py-4">
                                      <Button variant="outline" size="icon" className="rounded-full" onClick={() => setCreditAmount(c => Math.max(0, c - 1))}><Minus className="h-4 w-4" /></Button>
                                      <Input type="number" className="w-24 text-center text-xl font-bold" value={creditAmount} onChange={(e) => setCreditAmount(Number(e.target.value))} />
                                      <Button variant="outline" size="icon" className="rounded-full" onClick={() => setCreditAmount(c => c + 1)}><Plus className="h-4 w-4" /></Button>
                                  </div>
                                  <DialogFooter><Button onClick={handleUpdateCredits}>Save Credits</Button></DialogFooter>
                              </DialogContent>
                          )}
                      </Dialog>
                  </TableCell>
                  <TableCell>
                      {isProfessional && !isAdminUser && (
                        <Switch
                          checked={u.isFeatured === undefined ? true : u.isFeatured}
                          onCheckedChange={() => handleFeaturedToggle(u)}
                        />
                      )}
                  </TableCell>
                  <TableCell>
                      {u.isBlocked ? (
                        <Badge variant="destructive" className="flex items-center gap-1.5 w-fit">
                            <div className="h-2 w-2 rounded-full bg-red-400" />
                            Disabled
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1.5 w-fit bg-green-100 text-green-800">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Enabled
                        </Badge>
                      )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!isAdminUser && (
                        <Dialog open={isEditUserDialogOpen && selectedUser?.id === u.id} onOpenChange={(open) => { if (!open) setSelectedUser(null); setIsEditUserDialogOpen(open); }}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Manage {u.fullName.split(' ')[0]}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                     <DropdownMenuItem onSelect={() => router.push(`/admin/users/${u.id}`)}>
                                        <Info className="mr-2 h-4 w-4" />
                                        <span>View Details</span>
                                    </DropdownMenuItem>
                                    <DialogTrigger asChild>
                                      <DropdownMenuItem onSelect={() => setSelectedUser(u)}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          <span>Edit Profile</span>
                                      </DropdownMenuItem>
                                    </DialogTrigger>
                                    <DropdownMenuItem onSelect={() => { setConfirmationAction({ action: 'verify', user: u }); setIsConfirmationDialogOpen(true); }}>
                                        <Verified className="mr-2 h-4 w-4" />
                                        <span>{isCurrentlyVerified ? 'Revoke' : 'Grant'} Verification</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => { setConfirmationAction({ action: 'block', user: u }); setIsConfirmationDialogOpen(true); }}>
                                      {u.isBlocked ? <UserCheck className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                                        <span>{u.isBlocked ? 'Enable' : 'Disable'} User</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={() => { setConfirmationAction({ action: 'delete', user: u }); setIsConfirmationDialogOpen(true); }}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete User</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Edit User: {selectedUser?.fullName}</DialogTitle>
                                </DialogHeader>
                                {selectedUser && <EditUserForm user={selectedUser} onSuccess={() => setIsEditUserDialogOpen(false)} />}
                            </DialogContent>
                        </Dialog>
                    )}
                  </TableCell>
                  </TableRow>
              );})}</TableBody></Table></div></CardContent></Card>
          </TabsContent>
          <TabsContent value="leads" className="mt-6">
              <Card>
                  <CardHeader>
                      <CardTitle>All Leads ({leads?.length || 0})</CardTitle>
                      <div className="relative flex-grow mt-4">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                              placeholder="Search by property, agent, or user..."
                              className="pl-10"
                              value={leadSearchTerm}
                              onChange={(e) => setLeadSearchTerm(e.target.value)}
                          />
                      </div>
                  </CardHeader>
                  <CardContent className="p-0">
                      <div className="overflow-x-auto">
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead className="cursor-pointer" onClick={() => handleSort(setLeadSort, 'leadDate')}>
                                          <div className="flex items-center gap-2">Date <ArrowUpDown className="h-4 w-4" /></div>
                                      </TableHead>
                                      <TableHead>Property</TableHead>
                                      <TableHead>Agent</TableHead>
                                      <TableHead>Inquiring User</TableHead>
                                      <TableHead>Contact Method</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {sortedAndFilteredLeads?.map((lead) => (
                                      <TableRow key={lead.id}>
                                          <TableCell>{lead.leadDate?.toDate ? format(lead.leadDate.toDate(), 'PPP p') : 'N/A'}</TableCell>
                                          <TableCell>
                                              <Link href={`/properties/${lead.propertyId}`} className="font-medium hover:underline text-primary">
                                                  {lead.propertyTitle}
                                              </Link>
                                          </TableCell>
                                          <TableCell>
                                               <Link href={`/admin/users/${lead.agentId}`} className="hover:underline">
                                                  {lead.agentName}
                                              </Link>
                                          </TableCell>
                                          <TableCell>
                                              <Link href={`/admin/users/${lead.inquiringUserId}`} className="hover:underline">
                                                  {lead.inquiringUserName}
                                              </Link>
                                              <p className="text-xs text-muted-foreground">{lead.inquiringUserEmail}</p>
                                          </TableCell>
                                           <TableCell className="capitalize">
                                                <Badge variant="secondary">{lead.contactMethod}</Badge>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                          {sortedAndFilteredLeads.length === 0 && (
                            <div className="text-center py-16 text-muted-foreground">
                                <Handshake className="mx-auto h-12 w-12" />
                                <h3 className="mt-4 text-xl font-semibold">No leads found</h3>
                                <p>Leads will appear here when users contact agents.</p>
                            </div>
                          )}
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
          <TabsContent value="transactions" className="mt-6">
              <Card>
                  <CardHeader>
                      <CardTitle>All Transactions ({allTransactions.length})</CardTitle>
                       <div className="flex flex-col sm:flex-row gap-4 mt-4">
                          <div className="relative flex-grow">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input 
                                  placeholder="Search by user, email, payment ID, or description..."
                                  className="pl-10"
                                  value={transactionSearchTerm}
                                  onChange={(e) => setTransactionSearchTerm(e.target.value)}
                              />
                          </div>
                           <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                                <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                {transactionFilterOptions.map(option => (
                                    <Button key={option.value} variant={transactionFilter === option.value ? 'default' : 'outline'} size="sm" onClick={() => setTransactionFilter(option.value)} className="flex-shrink-0">{option.label}</Button>
                                ))}
                            </div>
                      </div>
                  </CardHeader>
                  <CardContent className="p-0">
                      <div className="overflow-x-auto">
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => handleSort(setTransactionSort, 'paymentId')}>
                                          <div className="flex items-center gap-2">Payment ID <ArrowUpDown className="h-4 w-4" /></div>
                                      </TableHead>
                                      <TableHead className="cursor-pointer" onClick={() => handleSort(setTransactionSort, 'userName')}>
                                          <div className="flex items-center gap-2">User <ArrowUpDown className="h-4 w-4" /></div>
                                      </TableHead>
                                      <TableHead className="cursor-pointer hidden sm:table-cell" onClick={() => handleSort(setTransactionSort, 'date')}>
                                          <div className="flex items-center gap-2">Date <ArrowUpDown className="h-4 w-4" /></div>
                                      </TableHead>
                                      <TableHead className="hidden lg:table-cell">Description</TableHead>
                                      <TableHead className="text-right cursor-pointer" onClick={() => handleSort(setTransactionSort, 'amount')}>
                                          <div className="flex items-center justify-end gap-2">Amount <ArrowUpDown className="h-4 w-4" /></div>
                                      </TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {sortedAndFilteredTransactions.map((transaction, index) => (
                                      <TableRow key={`${transaction.paymentId}-${index}`}>
                                          <TableCell className="font-mono text-xs hidden md:table-cell">{transaction.paymentId}</TableCell>
                                          <TableCell>
                                              <div className="font-medium">{transaction.userName}</div>
                                              <div className="text-sm text-muted-foreground">{transaction.userEmail}</div>
                                          </TableCell>
                                          <TableCell className="hidden sm:table-cell">
                                              {transaction.date?.toDate ? format(transaction.date.toDate(), 'PPP p') : 'N/A'}
                                          </TableCell>
                                          <TableCell className="hidden lg:table-cell">{transaction.description}</TableCell>
                                          <TableCell className="text-right font-semibold">{formatPrice(transaction.amount)}</TableCell>
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
                                                          <DialogDescription>Add a note for payment ID: {transaction.paymentId}</DialogDescription>
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
                           {sortedAndFilteredTransactions.length === 0 && (
                              <div className="text-center py-16 text-muted-foreground">
                                  <ShoppingCart className="mx-auto h-12 w-12" />
                                  <h3 className="mt-4 text-xl font-semibold">No transactions found</h3>
                                  <p>Try adjusting your search filters.</p>
                              </div>
                          )}
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
          <TabsContent value="notifications" className="mt-6">
                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send Notification</CardTitle>
                            <CardDescription>Send a global message to your users.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Form {...notificationForm}>
                              <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                                <FormField
                                    control={notificationForm.control}
                                    name="audience"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Send to:</FormLabel>
                                             <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex items-center space-x-4 pt-2"
                                                >
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl>
                                                          <RadioGroupItem value="all" id="all-users" />
                                                        </FormControl>
                                                        <Label htmlFor="all-users">All Users</Label>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2">
                                                         <FormControl>
                                                            <RadioGroupItem value="verified" id="verified-users" />
                                                         </FormControl>
                                                        <Label htmlFor="verified-users">Verified Dealers</Label>
                                                    </FormItem>
                                                </RadioGroup>
                                             </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={notificationForm.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Message</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Type your notification message here..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                 />
                                 <Button type="submit" disabled={isSendingNotification}>
                                    {isSendingNotification && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Notification
                                 </Button>
                              </form>
                           </Form>
                        </CardContent>
                    </Card>
                    <AnnouncementForm settings={appSettings} />
                </div>
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
              {isLoadingSettings ? (
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
              ) : (
                  <AppSettingsForm settings={appSettings} />
              )}
          </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage platform metrics, properties, and user subscriptions securely.</p>
        </div>
        {renderContent()}
      </div>
      <Dialog open={!!propertyToReject} onOpenChange={(isOpen) => !isOpen && setPropertyToReject(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Reject Property</DialogTitle>
                <DialogDescription>Please provide a reason for rejecting "{propertyToReject?.title}". This will be visible to the property owner.</DialogDescription>
            </DialogHeader>
            <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Images are blurry, description is incomplete..."
            />
            <DialogFooter>
                <Button variant="outline" onClick={() => setPropertyToReject(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => handlePropertyStatusChange(propertyToReject!.id, 'rejected', rejectionReason)}>Confirm Rejection</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!propertyToEditExpiry} onOpenChange={(isOpen) => !isOpen && setPropertyToEditExpiry(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Update Expiration Date</DialogTitle>
                <DialogDescription>Select a new expiration date for "{propertyToEditExpiry?.title}".</DialogDescription>
            </DialogHeader>
             <div className="flex justify-center">
                <CalendarIcon
                    mode="single"
                    selected={newExpiryDate}
                    onSelect={setNewExpiryDate}
                    className="rounded-md border"
                    disabled={(date) => date < new Date()}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setPropertyToEditExpiry(null)}>Cancel</Button>
                <Button onClick={handleExpiryDateChange} disabled={!newExpiryDate}>Update Date</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationAction?.action === 'delete' && `This will permanently delete the user "${confirmationAction.user.fullName}".`}
              {confirmationAction?.action === 'block' && `This will ${confirmationAction.user.isBlocked ? 'enable' : 'disable'} the user "${confirmationAction.user.fullName}".`}
              {confirmationAction?.action === 'verify' && `This will ${confirmationAction.user.isVerified ? 'revoke verification for' : 'grant verification to'} "${confirmationAction.user.fullName}".`}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmationAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmationAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
