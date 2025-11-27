
'use client';

import { useEffect, useState, useRef, forwardRef } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile, getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, Phone, Briefcase, Upload, Save } from 'lucide-react';
import type { User as UserType, Property } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useImageKit } from '@/imagekit/provider';
import { IKUpload, IKUploadProps } from 'imagekitio-react';
import { MyPropertiesTab } from '@/components/profile/my-properties-tab';

const CleanIKUpload = forwardRef<HTMLInputElement, IKUploadProps>((props, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { publicKey, urlEndpoint, authenticationEndpoint, inputRef, ...rest } = props;
  // This component will be called by IKUpload internally. We intercept and remove
  // props that should not be passed to the underlying DOM element.
  // @ts-ignore
  return <IKUpload {...rest} ref={ref} />;
});
CleanIKUpload.displayName = 'CleanIKUpload';


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = getAuth();
  const router = useRouter();
  const { toast } = useToast();
  const imageKitContext = useImageKit();

  const [isSaving, setIsSaving] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null);
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadSuccess = (res: any) => {
    const photoURL = res.url;
    setNewAvatarUrl(photoURL);
    // Don't save immediately, wait for the save button
  };
  
  const handleSaveChanges = async () => {
     if (!newAvatarUrl || !auth.currentUser || !userDocRef) {
      toast({ title: "Nothing to save", description: "Select a new profile picture first.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    try {
        await updateProfile(auth.currentUser, { photoURL: newAvatarUrl });
        await updateDoc(userDocRef, { photoURL: newAvatarUrl });
        toast({
          title: "Profile Saved!",
          description: "Your new profile picture has been saved.",
          variant: 'success',
        });
        setNewAvatarUrl(null); // Reset after saving
    } catch (error) {
      console.error("Error saving profile picture:", error);
      toast({ title: "Save Failed", description: "Could not save your new profile picture.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadError = (err: any) => {
    console.error("Upload Error:", err);
    toast({
      title: "Upload Failed",
      description: "Could not upload your image. Please try again.",
      variant: "destructive",
    });
    setIsSaving(false);
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  if (isUserLoading || isProfileLoading) {
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

  if (!user || !userProfile) {
     return (
      <>
        <div className="bg-muted">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">Manage your account details and listings.</p>
            </div>
        </div>
        <div className="container mx-auto px-4 py-16 text-center">
            <p>Could not load user profile. Please try again.</p>
             {profileError && <p className="text-sm text-destructive">{profileError.message}</p>}
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

  const displayAvatar = newAvatarUrl || userProfile.photoURL;

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
                    <AvatarImage src={displayAvatar ?? ''} alt={userProfile.fullName ?? ''} />
                    <AvatarFallback className="text-5xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center">
                        {userProfile.fullName ? getInitials(userProfile.fullName) : <User className="h-16 w-16" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  {imageKitContext?.urlEndpoint && imageKitContext.publicKey && (
                     <div style={{ display: 'none' }}>
                      <CleanIKUpload
                        publicKey={imageKitContext.publicKey}
                        urlEndpoint={imageKitContext.urlEndpoint}
                        authenticationEndpoint={`${process.env.NEXT_PUBLIC_APP_URL}/api/imagekit-auth`}
                        fileName={`profile_${user.uid}.jpg`}
                        folder="/profiles"
                        useUniqueFileName={false}
                        isPrivateFile={false}
                        onSuccess={handleUploadSuccess}
                        onError={handleUploadError}
                        inputRef={fileInputRef}
                      />
                    </div>
                  )}
                  <Button
                    size="icon"
                    className="absolute bottom-1 right-1 h-9 w-9 rounded-full"
                    onClick={handleAvatarClick}
                    disabled={isSaving}
                    aria-label="Upload new picture"
                  >
                    <Upload className="h-5 w-5" />
                  </Button>
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
              </CardContent>
              <CardFooter className="p-6">
                 <Button
                  onClick={handleSaveChanges}
                  disabled={!newAvatarUrl || isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

         <TabsContent value="properties">
            <MyPropertiesTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
