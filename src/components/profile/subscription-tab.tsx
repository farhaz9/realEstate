
'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc, arrayUnion, increment } from 'firebase/firestore';
import type { User, AppSettings } from '@/types';
import { Loader2, Gem, CheckCircle2, XCircle, Verified, ShieldAlert, Bot, Zap, Star, Building, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import React, { useMemo, useState } from 'react';
import { Badge } from '../ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';
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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';

declare const Razorpay: any;

const planDetails: Record<string, { name: string; color: string; icon: React.ElementType }> = {
    free: { name: 'Free Tier', color: 'text-gray-800', icon: Bot },
    basic: { name: 'Basic Plan', color: 'text-blue-800', icon: Zap },
    pro: { name: 'Pro Plan', color: 'text-purple-800', icon: Star },
    business: { name: 'Business Plan', color: 'text-amber-800', icon: Building },
};

type PaymentAction = 'verify' | 'credit';

export function SubscriptionTab() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isPaymentAlertOpen, setIsPaymentAlertOpen] = useState(false);
  const [paymentAction, setPaymentAction] = useState<PaymentAction | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const appSettingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'app_settings', 'config');
  }, [firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);
  const { data: appSettings, isLoading: areSettingsLoading } = useDoc<AppSettings>(appSettingsRef);

  const isLoading = isUserLoading || isProfileLoading || areSettingsLoading;

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

  const handlePayment = () => {
    if (!user || !userDocRef) {
      toast({ title: 'Please log in to make a purchase.', variant: 'destructive' });
      router.push('/login');
      return;
    }

    if (typeof window === 'undefined' || !(window as any).Razorpay) {
      toast({ title: 'Payment gateway is not available.', variant: 'destructive' });
      return;
    }
    
    let amount: number;
    let description: string;

    if (paymentAction === 'verify') {
        if (isVerified) {
            toast({ title: "You are already verified.", variant: "success" });
            return;
        }
        amount = (appSettings?.verifiedPriceMonthly ?? 99) * 100;
        description = "Monthly Premium Verification";
    } else if (paymentAction === 'credit') {
        amount = (appSettings?.listingPrice ?? 99) * 100;
        description = "1 Listing Credit Purchase";
    } else {
        return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount.toString(),
      currency: "INR",
      name: "Falcon Estates",
      description,
      image: "/logo.png",
      handler: (response: any) => {
        let updateData: any;
        if (paymentAction === 'verify') {
          const newExpiryDate = new Date();
          newExpiryDate.setDate(newExpiryDate.getDate() + 30);
          updateData = { isVerified: true, verifiedUntil: newExpiryDate };
          toast({ title: "Payment Successful!", description: "Congratulations! You are now a Premium Verified member.", variant: "success" });
        } else {
          updateData = { listingCredits: increment(1) };
          toast({ title: "Payment Successful!", description: "You have received 1 listing credit.", variant: "success" });
        }

        const newTransaction = {
          paymentId: response.razorpay_payment_id,
          amount: amount / 100,
          date: new Date(),
          description,
        };

        updateDocumentNonBlocking(userDocRef, {
          ...updateData,
          transactions: arrayUnion(newTransaction),
        });
        
        setIsPaymentAlertOpen(false);
      },
      prefill: {
        name: userProfile?.fullName,
        email: userProfile?.email,
        contact: userProfile?.phone,
      },
      theme: { color: "#6D28D9" },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  };
  
  const PlanIcon = currentPlan.icon;
  const verificationPrice = appSettings?.verifiedPriceMonthly ?? 99;
  const creditPrice = appSettings?.listingPrice ?? 99;

  return (
    <>
      <div className="space-y-6">
        {/* Current Plan Card */}
        <Card className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 animate-gradient-pan bg-gradient-to-br from-primary via-purple-500 to-fuchsia-500 bg-[200%_200%]"
            />
            <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
                    <PlanIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">{currentPlan.name}</h3>
                    <p className="text-sm opacity-80">Your current plan. Level up for more benefits!</p>
                </div>
            </div>
            <Button asChild variant="secondary" className="w-full mt-6 h-12 text-base font-bold bg-white text-primary hover:bg-white/90">
                <Link href="/pricing">Change Plan</Link>
            </Button>
        </Card>

        {/* Verification Card */}
         <Card className="p-6 rounded-2xl">
           <div className="flex items-center gap-4">
              <div className="relative">
                {isVerified ? (
                    <Verified className="h-12 w-12 text-blue-500" />
                ) : (
                    <ShieldAlert className="h-12 w-12 text-destructive" />
                )}
              </div>
              <div>
                  <h3 className="text-xl font-bold">Premium Verification</h3>
                  <p className="text-sm text-muted-foreground">Unlock exclusive benefits and trust.</p>
              </div>
            </div>
             <Button className="w-full mt-6 h-12 text-base font-bold" onClick={() => { setPaymentAction('verify'); setIsPaymentAlertOpen(true); }} disabled={isVerified}>
                {isVerified ? 'You are Verified' : 'Get Verified'}
            </Button>
        </Card>
        
        {/* Listing Credits Card */}
        <Card className="p-6 rounded-2xl">
           <div className="flex items-center gap-4">
               <Coins className="h-12 w-12 text-amber-500" />
               <div>
                  <h3 className="text-xl font-bold">Boost Your Listings!</h3>
                  {isLoading ? (
                    <Skeleton className="h-4 w-40 mt-1" />
                  ) : (
                    <p className="text-sm text-muted-foreground">{userProfile?.listingCredits || 0} Credit{userProfile?.listingCredits !== 1 && 's'} remaining. Purchase more to reach buyers.</p>
                  )}
               </div>
            </div>
            <Button className="w-full mt-6 h-12 text-base font-bold" onClick={() => { setPaymentAction('credit'); setIsPaymentAlertOpen(true); }}>
                Purchase Credits
            </Button>
        </Card>
      </div>

      <AlertDialog open={isPaymentAlertOpen} onOpenChange={setIsPaymentAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              {paymentAction === 'verify' && `You are about to purchase Premium Verification for ${formatPrice(verificationPrice)}/month.`}
              {paymentAction === 'credit' && `You are about to purchase 1 Listing Credit for ${formatPrice(creditPrice)}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePayment}>
              Proceed to Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
