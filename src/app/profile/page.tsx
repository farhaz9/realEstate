
'use client';

import { useEffect, Suspense, useRef } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, Phone, Briefcase, LogOut, Shield, Camera } from 'lucide-react';
import type { User as UserType } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyPropertiesTab } from '@/components/profile/my-properties-tab';
import { WishlistTab } from '@/components/profile/wishlist-tab';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

function ProfilePageContent() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  const fileInputRef = useRef<HTMLInputElement>(null);


  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserType>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to view your profile.",
        variant: "destructive",
      });
      router.push('/login');
    }
  }, [user, isUserLoading, router, toast]);

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
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // NOTE: Here you would implement the upload logic to a service like ImageKit
      // and get a URL back. For now, we'll just show a toast.
      toast({
        title: "Image Selected",
        description: `${file.name} is ready to be uploaded.`,
      });
    }
  };


  const categoryDisplay: Record<string, string> = {
    'user': 'User',
    'listing-property': 'Property Owner',
    'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer'
  };
  
  const isAuthorizedAdmin = user?.email === ADMIN_EMAIL;
  const isProfessional = userProfile?.category && ['listing-property', 'real-estate-agent', 'interior-designer'].includes(userProfile.category);
  
  if (isUserLoading || isProfileLoading) {
    return (
      <>
        <div className="bg-muted">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">Manage your account details and listings.</p>
            </div>
        </div>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  if (!user) {
    return (
       <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  const displayAvatar = userProfile?.photoURL ?? user.photoURL;
  const displayName = userProfile?.fullName ?? user.displayName;
  const tabsToShow = isProfessional ? 3 : 2;

  return (
    <>
      <div className="bg-muted/40">
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your account details and listings.</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue={defaultTab} className="w-full">
           <TabsList className={`grid w-full max-w-lg mx-auto mb-8 grid-cols-${tabsToShow}`}>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {isProfessional && (
              <TabsTrigger value="listings">My Listings</TabsTrigger>
            )}
            <TabsTrigger value="wishlist">My Wishlist</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="max-w-2xl mx-auto">
               <CardHeader className="items-center text-center p-6 bg-muted/30">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                    <AvatarImage src={displayAvatar ?? ''} alt={displayName ?? ''} />
                    <AvatarFallback className="text-5xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center">
                        {displayName ? getInitials(displayName) : <User className="h-16 w-16" />}
                    </AvatarFallback>
                  </Avatar>
                  <button onClick={handleAvatarClick} className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="h-8 w-8 text-white" />
                  </button>
                   <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                <CardTitle className="mt-4 text-3xl">{displayName ?? 'User'}</CardTitle>
                <CardDescription>Welcome back to your dashboard!</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isProfileLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : profileError || !userProfile ? (
                  <div className="text-center text-destructive-foreground bg-destructive/80 p-4 rounded-md">
                      <p className="font-semibold">Could not load user profile.</p>
                      <p className="text-sm">Please try again later or contact support.</p>
                      {profileError && <p className="text-xs mt-2">Error: {profileError.message}</p>}
                  </div>
                ) : (
                  <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 rounded-lg border bg-background">
                        <User className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                        <div className="flex-grow">
                          <p className="text-xs text-muted-foreground">Full Name</p>
                          <p className="text-sm font-medium">{userProfile.fullName}</p>
                        </div>
                      </div>
                       <div className="flex items-center gap-4 p-3 rounded-lg border bg-background">
                        <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                        <div className="flex-grow">
                          <p className="text-xs text-muted-foreground">Email Address</p>
                          <p className="text-sm font-medium">{userProfile.email}</p>
                        </div>
                      </div>
                       <div className="flex items-center gap-4 p-3 rounded-lg border bg-background">
                        <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                        <div className="flex-grow">
                          <p className="text-xs text-muted-foreground">Phone Number</p>
                          <p className="text-sm font-medium">{userProfile.phone || 'Not provided'}</p>
                        </div>
                      </div>
                       <div className="flex items-center gap-4 p-3 rounded-lg border bg-background">
                        <Briefcase className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                         <div className="flex-grow">
                          <p className="text-xs text-muted-foreground">User Category</p>
                          <p className="text-sm font-medium">{categoryDisplay[userProfile.category] || userProfile.category}</p>
                        </div>
                      </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-6 flex flex-col gap-2">
                {isAuthorizedAdmin && (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </Button>
                )}
                 <Button onClick={handleSignOut} variant="destructive" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {isProfessional && (
            <TabsContent value="listings">
              <MyPropertiesTab />
            </TabsContent>
          )}

          <TabsContent value="wishlist">
            <WishlistTab />
          </TabsContent>

        </Tabs>
      </div>
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
      <ProfilePageContent />
    </Suspense>
  )
}
