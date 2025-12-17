'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Settings, ShoppingBag, Verified, Loader2, Camera, Upload, Edit, Trash2 } from 'lucide-react';
import type { User as UserType } from '@/types';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileDetailsTab } from '@/components/profile/profile-details-tab';
import { MyPropertiesTab } from '@/components/profile/my-properties-tab';
import { WishlistTab } from '@/components/profile/wishlist-tab';
import { OrdersTab } from '@/components/profile/orders-tab';
import ImageKit from 'imagekit-javascript';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from '../ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);


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

  useEffect(() => {
    if (isCameraDialogOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
          setIsCameraDialogOpen(false);
        }
      };
      getCameraPermission();
    } else {
      // Cleanup camera stream when dialog is closed
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCameraDialogOpen, toast]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const uploadImage = async (file: File | Blob) => {
    if (!user || !userDocRef || !auth?.currentUser) {
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
        fileName: `${user.uid}_${Date.now()}.png`,
        folder: "/delhi-estate-luxe/avatars",
        ...authBody,
      });

      const newPhotoURL = uploadResult.url;

      await updateProfile(auth.currentUser, { photoURL: newPhotoURL });
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
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: 'Image too large',
        description: 'Please select an image smaller than 2MB.',
        variant: 'destructive',
      });
      return;
    }
    await uploadImage(file);
  };
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (blob) {
          await uploadImage(blob);
        }
        setIsCameraDialogOpen(false);
      }, 'image/png');
    }
  };

  const handleDeletePhoto = async () => {
      if (!user || !userDocRef || !auth?.currentUser) {
        toast({
          title: 'Error',
          description: 'Could not delete photo. User not found.',
          variant: 'destructive',
        });
        return;
      }
      setIsUploading(true);
      try {
        await updateProfile(auth.currentUser, { photoURL: '' });
        await updateDoc(userDocRef, { photoURL: '' });
        toast({
          title: 'Profile picture removed',
          variant: 'success',
        });
      } catch (error: any) {
        console.error('Photo deletion failed:', error);
        toast({
          title: 'Deletion Failed',
          description: error.message || 'There was a problem removing your profile picture.',
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
      return null;
  }
  
  const isLoading = isUserLoading || isProfileLoading;
  const displayAvatar = userProfile?.photoURL ?? user?.photoURL;
  const displayName = userProfile?.fullName ?? user?.displayName;
  const isCurrentlyVerified = userProfile?.verifiedUntil && userProfile.verifiedUntil.toDate() > new Date();

  return (
    <>
      <div className="bg-muted/40 pb-12">
        <div className="container mx-auto px-4 py-6">
            <div className="relative flex justify-center items-center">
                <h1 className="text-xl font-bold">Profile</h1>
                 <Button asChild variant="ghost" size="icon" className="absolute right-0">
                    <Link href="#"><Settings /></Link>
                </Button>
            </div>
             <div className="flex flex-col items-center mt-6">
                <div className="relative group cursor-pointer">
                    <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                        {isLoading ? <Skeleton className="h-full w-full rounded-full" /> : <AvatarImage src={displayAvatar ?? ''} alt={displayName ?? ''} /> }
                        <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center">
                            {displayName ? getInitials(displayName) : <User className="h-12 w-12" />}
                        </AvatarFallback>
                    </Avatar>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button size="icon" variant="default" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-background">
                            <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          <span>Upload photo</span>
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => setIsDeleteAlertOpen(true)}
                          disabled={!displayAvatar}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete photo</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                />
                <div className="flex items-center gap-2 mt-4">
                  {isLoading ? <Skeleton className="h-8 w-40" /> : <h2 className="text-2xl font-bold">{displayName}</h2>}
                  {isCurrentlyVerified && <Verified className="h-7 w-7 text-blue-500" />}
                </div>
                {isLoading ? <Skeleton className="h-5 w-24 mt-1" /> : (userProfile && <p className="text-muted-foreground">{categoryDisplay[userProfile.category]}</p>)}
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
                <ProfileDetailsTab userProfile={userProfile} />
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

       <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take a Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCameraDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCapture} disabled={hasCameraPermission === false}>
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your profile picture. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePhoto}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPageContent />
    </Suspense>
  )
}
