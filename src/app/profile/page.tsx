
'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, useFirebaseApp } from '@/firebase';
import { doc, collection, query, where, updateDoc } from 'firebase/firestore';
import { updateProfile, getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, User, Mail, Phone, Briefcase, Upload } from 'lucide-react';
import type { User as UserType, Property } from '@/types';
import { PropertyCard } from '@/components/property-card';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();
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
    if (!file || !user || !firebaseApp) return;

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
        const storage = getStorage(firebaseApp);
        const storageRef = ref(storage, `profile-pictures/${user.uid}`);
        
        await uploadString(storageRef, dataUrl, 'data_url');
        const photoURL = await getDownloadURL(storageRef);

        // We update both Auth and Firestore for consistency
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL });
        }
        
        // This update will trigger the useDoc hook to refetch and update the UI
        if (userDocRef) {
            await updateDoc(userDocRef, { photoURL });
        }

        toast({
          title: "Profile Picture Updated",
          description: "Your new picture has been saved.",
          variant: 'success',
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
        <div className="bg-muted">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">Manage your account details and listings.</p>
            </div>
        </div>
        <div className="container mx-auto px-4 py-16">
            {renderLoading()}
        </div>
      </>
    );
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const categoryDisplay: Record<string, string> = {
    'listing-property': 'Property Owner',
    'real-estate-agent': 'Real Estate Agent',
    'interior-designer': 'Interior Designer'
  };

  return (
    <>
      <div className="bg-muted/40">
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your account details and listings.</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto mb-8">
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="properties">My Properties</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="max-w-2xl mx-auto">
               <CardHeader className="items-center text-center p-6 bg-muted/30">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                    <AvatarImage src={userProfile.photoURL ?? ''} alt={userProfile.fullName ?? ''} />
                    <AvatarFallback className="text-5xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center">
                        {userProfile.fullName ? getInitials(userProfile.fullName) : <User className="h-16 w-16" />}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-1 right-1 h-9 w-9 rounded-full"
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    aria-label="Upload new picture"
                  >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  </Button>
                  <Input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    className="hidden" 
                    accept="image/png, image/jpeg" 
                  />
                </div>
                <CardTitle className="mt-4 text-3xl">{userProfile.fullName}</CardTitle>
                <CardDescription>Welcome back to your dashboard!</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
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
                          <p className="text-sm font-medium">{userProfile.phone}</p>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties">
             {arePropertiesLoading ? renderLoading() : (
              properties && properties.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map(property => (
                    <PropertyCard key={property.id} property={property}/>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">You haven't listed any properties yet.</h3>
                    <p className="text-muted-foreground mt-2">Your first listing is on us!</p>
                    <Button asChild className="mt-6">
                        <a href="/add-property">List a Property</a>
                    </Button>
                </div>
              )
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
