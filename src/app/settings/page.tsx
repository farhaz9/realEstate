
'use client';

import { Suspense, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Settings, ArrowLeft, Camera, Edit } from 'lucide-react';
import type { User as UserType } from '@/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner-1';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileDetailsTab } from '@/components/profile/profile-details-tab';
import { MyPropertiesTab } from '@/components/profile/my-properties-tab';
import { WishlistTab } from '@/components/profile/wishlist-tab';

const categoryDisplay: Record<string, string> = {
  'user': 'Buyer / Tenant',
  'listing-property': 'Property Owner',
  'real-estate-agent': 'Real Estate Agent',
  'interior-designer': 'Interior Designer',
  'vendor': 'Vendor / Supplier'
};


function SettingsPageContent() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserType>(userDocRef);

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size={48} />
      </div>
    );
  }

  if (!user) {
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
      <div className="bg-muted/40 pb-12">
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
                 <Button asChild variant="ghost" size="icon">
                    <Link href="/"><ArrowLeft/></Link>
                 </Button>
                <h1 className="text-xl font-bold">Profile</h1>
                 <Button asChild variant="ghost" size="icon">
                    <Link href="#"><Settings /></Link>
                </Button>
            </div>
             <div className="flex flex-col items-center mt-6">
                <div className="relative">
                    <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                        <AvatarImage src={displayAvatar ?? ''} alt={displayName ?? ''} />
                        <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center">
                            {displayName ? getInitials(displayName) : <User className="h-12 w-12" />}
                        </AvatarFallback>
                    </Avatar>
                     <Button size="icon" variant="default" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-background">
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
                <h2 className="mt-4 text-2xl font-bold">{displayName}</h2>
                <p className="text-muted-foreground">{categoryDisplay[userProfile.category]}</p>
            </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 -mt-16">
         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto h-12">
                <TabsTrigger value="profile" className="h-full">Profile</TabsTrigger>
                <TabsTrigger value="listings" className="h-full">My Listings</TabsTrigger>
                <TabsTrigger value="wishlist" className="h-full">Wishlist</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
                <ProfileDetailsTab userProfile={userProfile} />
            </TabsContent>
            <TabsContent value="listings" className="mt-6">
                <MyPropertiesTab />
            </TabsContent>
            <TabsContent value="wishlist" className="mt-6">
                <WishlistTab />
            </TabsContent>
        </Tabs>
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
