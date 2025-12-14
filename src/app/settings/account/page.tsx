
'use client';

import { Suspense } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User as UserIcon, Mail, Phone, AtSign, Edit, Save, X, Camera, ArrowLeft } from 'lucide-react';
import type { User as UserType } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner-1';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

function AccountPageContent() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isEditing, setIsEditing] = useState(false);

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
  
  const renderDetailItem = (Icon: React.ElementType, label: string, value: string | undefined) => (
    <div className="flex items-start gap-4">
      <Icon className="h-5 w-5 text-muted-foreground mt-1" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size={48} />
      </div>
    );
  }

  if (!userProfile) {
    return <p>User profile not found.</p>;
  }

  const displayAvatar = userProfile?.photoURL ?? user?.photoURL;
  const displayName = userProfile?.fullName ?? user?.displayName;

  return (
    <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center relative">
              <Button asChild variant="ghost" size="icon" className="absolute top-4 left-4">
                  <Link href="/settings"><ArrowLeft /></Link>
              </Button>
            <div className="relative w-28 h-28 mx-auto">
                <Avatar className="w-full h-full text-4xl border-4 border-background">
                    <AvatarImage src={displayAvatar ?? ''} alt={displayName ?? ''} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {displayName ? getInitials(displayName) : <UserIcon />}
                    </AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-background">
                    <Camera className="h-4 w-4" />
                </Button>
            </div>
            <CardTitle className="mt-4">{displayName}</CardTitle>
            <CardDescription>@{userProfile.username}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
              <div className="space-y-6 border-t pt-6">
                {renderDetailItem(UserIcon, "Full Name", userProfile.fullName)}
                {renderDetailItem(AtSign, "Username", userProfile.username)}
                {renderDetailItem(Mail, "Email", userProfile.email)}
                {renderDetailItem(Phone, "Phone Number", userProfile.phone)}
              </div>
          </CardContent>
        </Card>
    </div>
  );
}

export default function AccountPage() {
    return (
        <div className="bg-muted/40">
            <div className="container mx-auto px-4 py-12">
                 <Suspense fallback={
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Spinner size={48} />
                    </div>
                    }>
                    <AccountPageContent />
                </Suspense>
            </div>
        </div>
    )
}
