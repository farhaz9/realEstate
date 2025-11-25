
'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, updateDoc } from 'firebase/firestore';
import { updateProfile, getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Mail, Phone, Briefcase, Upload } from 'lucide-react';
import { PageHero } from '@/components/shared/page-hero';
import type { User as UserType, Property } from '@/types';
import { PropertyCard } from '@/components/property-card';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = getAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserType>(userDocRef);

  const userPropertiesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'properties'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: properties, isLoading: arePropertiesLoading } = useCollection<Property>(userPropertiesQuery);

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const storage = getStorage();
        const storageRef = ref(storage, `profile-pictures/${user.uid}`);
        
        await uploadString(storageRef, dataUrl, 'data_url');
        const photoURL = await getDownloadURL(storageRef);

        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL });
        }
        
        if (userDocRef) {
            await updateDoc(userDocRef, { photoURL });
        }

        toast({
          title: "Profile Picture Updated",
          description: "Your new picture has been saved.",
        });
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: "Could not update your profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  if (isUserLoading || isProfileLoading || !user || !userProfile) {
    return (
      <>
        <PageHero title="My Profile" subtitle="Manage your account details and listings." image={{ id: 'contact-hero', imageHint: 'desk with personal items' }}/>
        {renderLoading()}
      </>
    );
  }

  const categoryDisplay: Record<string, string> = {
    'listing-property': 'Property Owner',
    'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer'
  };

  return (
    <>
      <PageHero title="My Profile" subtitle="Manage your account details and listings." image={{ id: 'contact-hero', imageHint: 'desk with personal items' }}/>
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="items-center text-center">
                <div className="relative">
                  <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                    <AvatarFallback className="text-4xl">
                        {user.displayName?.charAt(0).toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-1 right-1 h-8 w-8 rounded-full"
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span className="sr-only">Upload new picture</span>
                  </Button>
                  <Input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    className="hidden" 
                    accept="image/png, image/jpeg" 
                  />
                </div>
                <CardTitle className="mt-4">{user.displayName}</CardTitle>
                <CardDescription>Welcome back!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                    <User className="h-5 w-5 text-muted-foreground"/>
                    <p className="text-sm">{userProfile.fullName}</p>
                  </div>
                   <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                    <Mail className="h-5 w-5 text-muted-foreground"/>
                    <p className="text-sm">{user.email}</p>
                  </div>
                   <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                    <Phone className="h-5 w-5 text-muted-foreground"/>
                    <p className="text-sm">{userProfile.phone}</p>
                  </div>
                   <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                    <Briefcase className="h-5 w-5 text-muted-foreground"/>
                    <p className="text-sm">{categoryDisplay[userProfile.category] || userProfile.category}</p>
                  </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">My Listed Properties</h2>
            {arePropertiesLoading ? renderLoading() : (
              properties && properties.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {properties.map(property => (
                    <PropertyCard key={property.id} property={property}/>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">You haven't listed any properties yet.</h3>
                    <p className="text-muted-foreground mt-2">Your first listing is on us!</p>
                    <Button asChild className="mt-6">
                        <a href="/add-property">List a Property</a>
                    </Button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
