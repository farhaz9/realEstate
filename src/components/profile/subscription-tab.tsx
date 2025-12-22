
'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/types';
import { Loader2, Gem, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import { useMemo } from 'react';
import { Badge } from '../ui/badge';
import { format, formatDistanceToNow } from 'date-fns';

const planDetails: Record<string, { name: string; color: string }> = {
    free: { name: 'Free Tier', color: 'bg-gray-100 text-gray-800' },
    basic: { name: 'Basic Plan', color: 'bg-blue-100 text-blue-800' },
    pro: { name: 'Pro Plan', color: 'bg-purple-100 text-purple-800' },
    business: { name: 'Business Plan', color: 'bg-amber-100 text-amber-800' },
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gem className="text-primary" />
          My Subscription
        </CardTitle>
        <CardDescription>
            View your current plan details and verification status.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
          <>
            <div className="p-4 rounded-lg bg-muted flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-muted-foreground">Current Plan</p>
                    <p className={`text-xl font-bold ${currentPlan.color.split(' ')[1]}`}>{currentPlan.name}</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/pricing">Change Plan</Link>
                </Button>
            </div>
            
             <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Verification Status</p>
                        <div className="flex items-center gap-2 mt-1">
                            {isVerified ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                            ) : (
                                <XCircle className="h-6 w-6 text-destructive" />
                            )}
                            <p className="text-xl font-bold">{isVerified ? 'Verified' : 'Not Verified'}</p>
                        </div>
                    </div>
                     {!isVerified && (
                        <Button asChild>
                            <Link href="/pricing">Get Verified</Link>
                        </Button>
                    )}
                </div>
                {isVerified && verificationExpiresAt && (
                   <p className="text-sm text-muted-foreground mt-2">
                        Your verification expires on <strong>{format(verificationExpiresAt, 'PPP')}</strong> ({formatDistanceToNow(verificationExpiresAt, { addSuffix: true })}).
                    </p>
                )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
