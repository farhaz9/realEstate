
'use client';

import { CheckCircle2, Star, Verified } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, arrayUnion, increment } from 'firebase/firestore';
import type { User, AppSettings } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
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
import { formatPrice } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

declare const Razorpay: any;

const benefits = [
    'Verified Badge',
    'Property appears at Top of Search Results',
    'Higher visibility & more leads',
    'Dealer name shown prominently',
    'Trust badge increases buyer confidence',
];

export function PricingSection() {
    const [isAnnual, setIsAnnual] = useState(false);
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    
    const appSettingsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'app_settings', 'config');
    }, [firestore]);

    const { data: userProfile } = useDoc<User>(userDocRef);
    const { data: appSettings, isLoading: isLoadingSettings } = useDoc<AppSettings>(appSettingsRef);

    const isCurrentlyVerified = userProfile?.verifiedUntil && userProfile.verifiedUntil.toDate() > new Date();
    const verificationExpiresAt = isCurrentlyVerified ? userProfile.verifiedUntil.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

    const monthlyPrice = appSettings?.verifiedPriceMonthly ?? 99;
    const annualPrice = appSettings?.verifiedPriceAnnually ?? 1000;
    const annualSavings = Math.round((1 - (annualPrice / (monthlyPrice * 12))) * 100);

    const handleGetVerified = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (isCurrentlyVerified) {
            toast({
                title: "Already Verified",
                description: `Your verification is active until ${verificationExpiresAt}.`,
                variant: 'success'
            });
            return;
        }
    };

    const handlePayment = async () => {
        if (!user || !userDocRef) {
            toast({ title: "Authentication Error", description: "You must be logged in to make a payment.", variant: "destructive" });
            return;
        }
        if (isCurrentlyVerified) {
            handleGetVerified();
            return;
        }
        if (typeof window === 'undefined' || !(window as any).Razorpay) {
            toast({
                title: "Payment Gateway Error",
                description: "Razorpay is not available. Please check your connection and try again.",
                variant: "destructive",
            });
            return;
        }

        const amount = isAnnual ? annualPrice * 100 : monthlyPrice * 100; // amount in paise
        const displayAmount = isAnnual ? annualPrice : monthlyPrice;
        const description = isAnnual ? "Annual Premium Verification" : "Monthly Premium Verification";

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: amount.toString(),
            currency: "INR",
            name: "Falcon Estates - Premium Verified",
            description: `Payment for ${isAnnual ? 'Annual' : 'Monthly'} Subscription`,
            image: "/logo.png",
            config: {
              display: {
                blocks: {
                  upi: {
                    name: 'Pay with UPI',
                    instruments: [
                      { method: 'upi' },
                    ],
                  },
                },
                sequence: ['block.upi'],
                preferences: {
                  show_default_blocks: true,
                },
              },
            },
            handler: function (response: any) {
                toast({
                    title: "Payment Successful!",
                    description: "Congratulations! You are now a Premium Verified member.",
                    variant: "success",
                });
                
                const newExpiryDate = new Date();
                if (isAnnual) {
                    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
                } else {
                    newExpiryDate.setDate(newExpiryDate.getDate() + 30);
                }

                const newTransaction = {
                    paymentId: response.razorpay_payment_id,
                    amount: displayAmount,
                    date: new Date(),
                    description,
                };
                
                updateDocumentNonBlocking(userDocRef, {
                    transactions: arrayUnion(newTransaction),
                    isVerified: true,
                    verifiedUntil: newExpiryDate
                });
            },
            prefill: {
                name: userProfile?.fullName,
                email: userProfile?.email,
                contact: userProfile?.phone,
            },
            theme: {
                color: "#6D28D9",
            },
        };
        const rzp = new Razorpay(options);
        rzp.open();
    };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance font-bold text-3xl md:text-4xl lg:text-5xl lg:tracking-tight">
              Become a Verified Professional
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground text-lg">
              Gain trust, visibility, and more leads with our "Premium Verified" badge.
            </p>
            <div className="my-12">
              <div
                className="relative mx-auto grid w-fit grid-cols-2 rounded-full border bg-muted p-1"
              >
                <div
                  aria-hidden="true"
                  className={cn(
                      'pointer-events-none absolute inset-1 w-[calc(50%-4px)] rounded-full bg-primary shadow ring-1 ring-black/5 transition-transform duration-500 ease-in-out',
                      isAnnual ? "translate-x-full" : "translate-x-0"
                  )}
                />
                <button
                  className="relative duration-500 rounded-full h-8 w-24 text-sm hover:opacity-75"
                  onClick={() => setIsAnnual(false)}
                  type="button"
                >
                  <span className={cn(!isAnnual ? 'text-primary-foreground' : 'text-foreground')}>Monthly</span>
                </button>
                <button
                  className="relative duration-500 rounded-full h-8 w-24 text-sm hover:opacity-75"
                  onClick={() => setIsAnnual(true)}
                  type="button"
                >
                  <span className={cn(isAnnual ? 'text-primary-foreground' : 'text-foreground')}>Annually</span>
                </button>
              </div>
              <div className="mt-3 text-center text-xs">
                <span className="font-medium text-primary">Save {annualSavings}%</span> On
                Annual Billing
              </div>
            </div>
          </div>
        <div className="flex justify-center">
         {isLoadingSettings ? (
            <Card className="max-w-md w-full shadow-lg border-2 border-primary/50 relative overflow-hidden flex items-center justify-center h-96">
                <Loader2 className="h-10 w-10 animate-spin" />
            </Card>
         ) : (
          <Card className="max-w-md w-full shadow-2xl shadow-primary/20 overflow-hidden rounded-3xl border-0 bg-primary/5">
            <div className="p-8 text-center text-primary-foreground">
              <div className="flex justify-center items-center gap-2 mb-4">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-inner">
                      <Verified className="w-8 h-8 text-blue-500" />
                  </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground">
                Premium Verified
              </h3>
              <p className="text-muted-foreground">Get the visibility you deserve.</p>
           
                <CardTitle className="text-4xl font-extrabold text-foreground mt-8">
                    {isAnnual ? formatPrice(annualPrice) : formatPrice(monthlyPrice)}
                    <span className="text-lg font-medium text-muted-foreground">/{isAnnual ? 'year' : 'month'}</span>
                </CardTitle>

                <ul className="space-y-4 text-left mt-8 text-foreground">
                    {[...benefits, `Valid for ${isAnnual ? '365' : '30'} days`].map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <span className="font-medium">{benefit}</span>
                    </li>
                    ))}
                </ul>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button size="lg" className="w-full h-12 text-lg mt-8 shadow-lg" onClick={handleGetVerified} disabled={isCurrentlyVerified}>
                            <Verified className="mr-2 h-5 w-5" />
                            {isCurrentlyVerified ? 'You are already Verified' : 'Get Verified Now'}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <div className="flex justify-center mb-4">
                               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                 <Verified className="w-8 h-8 text-blue-500" />
                               </div>
                            </div>
                            <AlertDialogTitle className="text-center text-2xl">Confirm Your Subscription</AlertDialogTitle>
                            <AlertDialogDescription className="text-center">
                                You are about to purchase the <strong>Premium Verified</strong> plan
                                for <strong>{isAnnual ? formatPrice(annualPrice) + '/year' : formatPrice(monthlyPrice) + '/month'}</strong>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="sm:justify-center">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handlePayment}>Proceed to Payment</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </Card>
         )}
        </div>
      </div>
    </section>
  );
}
