
'use client';

import { Suspense } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { signOut, deleteUser } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Briefcase, LogOut, Shield, Camera, AtSign, Trash2, Wrench, ChevronRight, Heart, Bell, Lock, FileText, Building } from 'lucide-react';
import type { User as UserType } from '@/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Spinner } from '@/components/ui/spinner-1';


const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

function SettingsPageContent() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserType>(userDocRef);

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/');
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;

  const settingItems = [
    { icon: Heart, title: 'Wishlist Preferences', description: 'Manage your saved properties', href: '/profile?tab=wishlist' },
    { icon: Building, title: 'Listing Preferences', description: 'Manage your property listings', href: '/profile?tab=listings' },
    { icon: Bell, title: 'Notifications', description: 'Choose how you receive updates', href: '#' },
    { icon: Lock, title: 'Privacy & Security', description: 'Control your personal data and security', href: '#' },
    { icon: FileText, title: 'Legal & About', description: 'Terms, privacy policy, and about us', href: '/terms-and-conditions' },
  ];

  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size={48} />
      </div>
    );
  }

  if (!user) {
    // This check now runs only after isUserLoading is false.
    // If there's still no user, then they are not logged in.
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return (
       <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size={48} />
        </div>
    );
  }
  
  if (!userProfile) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Spinner size={48} />
            <p className="text-muted-foreground mt-4">Loading your profile...</p>
        </div>
    );
  }

  const displayAvatar = userProfile?.photoURL ?? user.photoURL;
  const displayName = userProfile?.fullName ?? user.displayName;

  return (
    <>
      <div className="bg-muted/40">
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences.</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
            <Card>
                <CardContent className="p-0">
                    <Link href="/settings/account" className="flex items-center gap-4 p-6 hover:bg-muted/50 transition-colors rounded-lg">
                        <Avatar className="h-16 w-16 border">
                            <AvatarImage src={displayAvatar ?? ''} alt={displayName ?? ''} />
                            <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center">
                                {displayName ? getInitials(displayName) : <User className="h-8 w-8" />}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold">{displayName}</h2>
                            <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                        </div>
                         <Button variant="outline" size="icon" className="ml-auto flex-shrink-0">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {settingItems.map((item) => (
                            <li key={item.title}>
                                <Link href={item.href} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                                    <item.icon className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="font-semibold">{item.title}</p>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            
            <Card>
                <CardContent className="p-4">
                     <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start text-base font-semibold h-auto p-2">
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </Button>
                </CardContent>
            </Card>

            {isAuthorizedAdmin && (
              <Card>
                <CardContent className="p-4">
                  <Button asChild variant="ghost" className="w-full justify-start text-base font-semibold h-auto p-2">
                    <Link href="/admin">
                      <Shield className="mr-3 h-5 w-5" />
                      Admin Panel
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

        </div>
      </div>
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[80vh]">
        <Spinner size={48} />
      </div>
    }>
      <SettingsPageContent />
    </Suspense>
  )
}
