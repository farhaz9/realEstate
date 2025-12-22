
'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/types';
import { Loader2, Gem, CheckCircle2, XCircle, Verified, ShieldAlert, Bot, Zap, Star, Building, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import { useMemo } from 'react';
import { Badge } from '../ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';

const planDetails: Record<string, { name: string; color: string; icon: React.ElementType }> = {
    free: { name: 'Free Tier', color: 'text-gray-800', icon: Bot },
    basic: { name: 'Basic Plan', color: 'text-blue-800', icon: Zap },
    pro: { name: 'Pro Plan', color: 'text-purple-800', icon: Star },
    business: { name: 'Business Plan', color: 'text-amber-800', icon: Building },
};

export function SubscriptionTab() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  const isLoading = isUserLoading || isProfileLoading;

  const { currentPlan, isVerified, verificationExpiresAt } = useMemo(() => {
    if (!userProfile) {
        return { currentPlan: planDetails.free, isVerified: false, verificationExpiresAt: null };
    }
    
    const isCurrentlyVerified = userProfile.isVerified && userProfile.verifiedUntil && userProfile.verifiedUntil.toDate() > new Date();
    const expiryDate = isCurrentlyVerified ? userProfile.verifiedUntil.toDate() : null;

    let planLevel = 'free';
    if (userProfile.transactions && userProfile.transactions.length > 0) {
        const planKeywords = ['business', 'pro', 'basic'];
        for (const transaction of userProfile.transactions) {
            const description = transaction.description?.toLowerCase() || '';
            const foundKeyword = planKeywords.find(keyword => description.includes(keyword));
            if (foundKeyword) {
                planLevel = foundKeyword;
                break; 
            }
        }
    }
    
    return {
      currentPlan: planDetails[planLevel] || planDetails.free,
      isVerified: isCurrentlyVerified,
      verificationExpiresAt: expiryDate,
    };
  }, [userProfile]);
  
  const PlanIcon = currentPlan.icon;

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Gem className="text-primary" />
                    My Plan
                </CardTitle>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-8 w-1/2" />
                    </div>
                 ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-3 rounded-lg">
                                <PlanIcon className={cn("h-6 w-6", currentPlan.color)} />
                            </div>
                            <div>
                                <p className="font-bold text-lg">{currentPlan.name}</p>
                                <p className="text-sm text-muted-foreground">Your current subscription</p>
                            </div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/pricing">Change Plan</Link>
                        </Button>
                    </div>
                 )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Verified className="text-blue-500" />
                    Verification
                </CardTitle>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-8 w-1/2" />
                    </div>
                 ) : isVerified ? (
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                <Verified className="h-3 w-3 mr-1.5"/>
                                Verified
                            </Badge>
                             <p className="text-sm font-semibold">Your profile is verified.</p>
                        </div>
                        {verificationExpiresAt && (
                           <p className="text-sm text-muted-foreground">
                                Expires on <strong>{format(verificationExpiresAt, 'PPP')}</strong> ({formatDistanceToNow(verificationExpiresAt, { addSuffix: true })}).
                            </p>
                        )}
                    </div>
                 ) : (
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-destructive" />
                            <p className="font-semibold text-muted-foreground">Not Verified</p>
                        </div>
                        <Button asChild size="sm">
                            <Link href="/pricing">Get Verified</Link>
                        </Button>
                    </div>
                 )}
            </CardContent>
        </Card>
         <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Coins className="text-amber-500" />
                    Listing Credits
                </CardTitle>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-1/4" />
                        <Skeleton className="h-8 w-1/2" />
                    </div>
                 ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-4xl font-bold">{userProfile?.listingCredits || 0}</p>
                            <p className="text-sm text-muted-foreground">Credits remaining</p>
                        </div>
                        <Button asChild>
                            <Link href="/settings?tab=listings">Purchase Credits</Link>
                        </Button>
                    </div>
                 )}
            </CardContent>
        </Card>
    </div>
  );
}
