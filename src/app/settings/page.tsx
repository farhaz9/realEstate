'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Settings, ArrowLeft, Camera, Edit, ShoppingBag, Verified, Loader2 } from 'lucide-react';
import type { User as UserType } from '@/types';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner-1';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileDetailsTab } from '@/components/profile/profile-details-tab';
import { MyPropertiesTab } from '@/components/profile/my-properties-tab';
import { WishlistTab } from '@/components/profile/wishlist-tab';
import { OrdersTab } from '@/components/profile/orders-tab';
import ImageKit from 'imagekit-javascript';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';

const categoryDisplay: Record<string, string> = {
  'user': 'Buyer / Tenant',
  'listing-property': 'Property Owner',
  'real-estate-agent': 'Real Estate Agent',
  'interior-designer': 'Interior Designer',
  'vendor': 'Vendor / Supplier'
};


function SettingsPageContent() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserType>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !userDocRef || !auth?.currentUser) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: 'Image too large',
        description: 'Please select an image smaller than 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const authRes = await fetch('/api/imagekit/auth');
      const authBody = await authRes.json();
      if (!authRes.ok) {
        throw new Error(authBody.message || 'ImageKit authentication failed.');
      }

      const imagekit = new ImageKit({
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
        authenticationEndpoint: `${process.env.NEXT_PUBLIC_APP_URL}/api/imagekit/auth`
      });

      const uploadResult = await imagekit.upload({
        file,
        fileName: `${user.uid}_${Date.now()}`,
        folder: "/delhi-estate-luxe/avatars",
        ...authBody,
      });

      const newPhotoURL = uploadResult.url;

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { photoURL: newPhotoURL });

      // Update Firestore document
      await updateDoc(userDocRef, { photoURL: newPhotoURL });

      toast({
        title: 'Profile picture updated!',
        variant: 'success',
      });

    } catch (error: any) {
      console.error('Profile picture upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'There was a problem uploading your new profile picture.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  if (!user && !isUserLoading) {
      router.push('/login');
      return (
        <div className="flex items-center justify-center min-h-[80vh]">
          <Spinner size={48} />
        </div>
      );
  }
  
  const displayAvatar = userProfile?.photoURL ?? user?.photoURL;
  const displayName = userProfile?.fullName ?? user?.displayName;
  const isCurrentlyVerified = userProfile?.verifiedUntil && userProfile.verifiedUntil.toDate() > new Date();

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
                <div className="relative group">
                    <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                        <AvatarImage src={displayAvatar ?? ''} alt={displayName ?? ''} />
                        <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center">
                            {displayName ? getInitials(displayName) : <User className="h-12 w-12" />}
                        </AvatarFallback>
                    </Avatar>
                     <button 
                        onClick={handleAvatarClick}
                        disabled={isUploading}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {isUploading ? (
                          <Loader2 className="h-8 w-8 text-white animate-spin" />
                        ) : (
                          <Camera className="h-8 w-8 text-white" />
                        )}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/png, image/jpeg, image/gif"
                    />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <h2 className="text-2xl font-bold">{displayName}</h2>
                  {isCurrentlyVerified && <Verified className="h-7 w-7 text-blue-500" />}
                </div>
                {userProfile && <p className="text-muted-foreground">{categoryDisplay[userProfile.category]}</p>}
                {isCurrentlyVerified && userProfile?.verifiedUntil && (
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    Pro Verified until {userProfile.verifiedUntil.toDate().toLocaleDateString()}
                  </p>
                )}
            </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 -mt-16">
         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-lg mx-auto h-12">
                <TabsTrigger value="profile" className="h-full">Profile</TabsTrigger>
                <TabsTrigger value="listings" className="h-full">My Listings</TabsTrigger>
                <TabsTrigger value="wishlist" className="h-full">Wishlist</TabsTrigger>
                <TabsTrigger value="orders" className="h-full">Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
                {userProfile ? <ProfileDetailsTab userProfile={userProfile} /> : <div className="flex items-center justify-center min-h-[20vh]"><Spinner size={32} /></div>}
            </TabsContent>
            <TabsContent value="listings" className="mt-6">
                <MyPropertiesTab />
            </TabsContent>
            <TabsContent value="wishlist" className="mt-6">
                <WishlistTab />
            </TabsContent>
            <TabsContent value="orders" className="mt-6">
              <OrdersTab />
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
