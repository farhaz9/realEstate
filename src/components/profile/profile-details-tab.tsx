'use client';

import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User as UserIcon, Mail, Phone, Briefcase, LogOut, Edit, Trash2, CalendarDays, AlertTriangle } from 'lucide-react';
import type { User as UserType } from '@/types';
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
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';


interface ProfileDetailsTabProps {
    userProfile: UserType | null;
}

const categoryDisplay: Record<string, string> = {
  'user': 'Buyer / Tenant',
  'listing-property': 'Property Owner',
  'real-estate-agent': 'Real Estate Agent',
  'interior-designer': 'Interior Designer'
};

export function ProfileDetailsTab({ userProfile }: ProfileDetailsTabProps) {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
      variant: 'success'
    });
    router.push('/');
  };

  const renderDetailItem = (Icon: React.ElementType, label: string, value: string | undefined | null) => (
    <div className="flex items-start gap-4">
      <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{label}</p>
        {value === null ? <Skeleton className="h-5 w-48" /> : <p className="font-semibold">{value || 'Not provided'}</p>}
      </div>
    </div>
  );
  
  const isLoading = !userProfile;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
              {renderDetailItem(UserIcon, "Full Name", isLoading ? null : userProfile.fullName)}
              {renderDetailItem(Mail, "Email Address", isLoading ? null : userProfile.email)}
              {renderDetailItem(Phone, "Phone", isLoading ? null : userProfile.phone)}
              {renderDetailItem(Briefcase, "Role", isLoading ? null : categoryDisplay[userProfile.category])}
              {renderDetailItem(CalendarDays, "Joined On", isLoading ? null : (userProfile.dateJoined?.toDate ? format(userProfile.dateJoined.toDate(), 'PPP') : 'N/A'))}
          </CardContent>
        </Card>
        
        <div className="space-y-3">
             <Button className="w-full h-12 text-base font-bold">
                <Edit className="mr-2 h-5 w-5" /> Edit Profile
            </Button>
            
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full h-12 text-base font-bold">
                        <LogOut className="mr-2 h-5 w-5" /> Log Out
                    </Button>
                </AlertDialogTrigger>
                 <AlertDialogContent>
                    <AlertDialogHeader className="items-center">
                        <div className="rounded-full bg-primary/10 p-3 mb-4">
                            <LogOut className="h-8 w-8 text-primary" />
                        </div>
                      <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                      <AlertDialogDescription className="text-center">
                          You will be returned to the homepage. You can always log back in later.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSignOut}>Log Out</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full h-12 text-base font-bold">
                        <Trash2 className="mr-2 h-5 w-5" />
                        Delete Account
                    </Button>
                </AlertDialogTrigger>
                 <AlertDialogContent>
                    <AlertDialogHeader className="items-center">
                         <div className="rounded-full bg-destructive/10 p-3 mb-4">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-center">
                          This action cannot be undone. This will permanently delete your account
                          and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Delete Account</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    </div>
  );
}
