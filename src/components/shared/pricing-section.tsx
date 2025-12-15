
'use client';

import { CheckCircle2, Star, Verified } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, arrayUnion, increment } from 'firebase/firestore';
import type { User } from '@/types';
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

declare const Razorpay: any;


const benefits = [
    'Verified Dealer Badge',
    'Property appears at Top of Search Results',
    'Higher visibility & more leads',
    'Dealer name shown prominently',
    'Trust badge increases buyer confidence',
    'Valid for 30 days',
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

    const { data: userProfile } = useDoc<User>(userDocRef);

    const isCurrentlyVerified = userProfile?.verifiedUntil && userProfile.verifiedUntil.toDate() > new Date();
    const verificationExpiresAt = isCurrentlyVerified ? userProfile.verifiedUntil.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

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

        const amount = isAnnual ? 100000 : 9900; // amount in paise
        const displayAmount = isAnnual ? 1000 : 99;

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: amount.toString(),
            currency: "INR",
            name: "Falcon Axe Homes - Pro Verified",
            description: `Payment for ${isAnnual ? 'Annual' : 'Monthly'} Subscription`,
            image: "/logo.png",
            handler: function (response: any) {
                toast({
                    title: "Payment Successful!",
                    description: "Congratulations! You are now a Pro Verified member.",
                    variant: "success",
                });
                
                const newExpiryDate = new Date();
                if (isAnnual) {
                    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
                } else {
                    newExpiryDate.setDate(newExpiryDate.getDate() + 30);
                }

                const newOrder = {
                    paymentId: response.razorpay_payment_id,
                    amount: displayAmount,
                    date: new Date(),
                };
                
                updateDocumentNonBlocking(userDocRef, {
                    orders: arrayUnion(newOrder),
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
              Gain trust, visibility, and more leads with our "Pro Verified" badge.
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
                <span className="font-medium text-primary">Save 16%</span> On
                Annual Billing
              </div>
            </div>
          </div>
        <div className="flex justify-center">
          <Card className="max-w-md w-full shadow-lg border-2 border-primary/50 relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold uppercase px-4 py-1 rounded-bl-lg flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3" /> PRO
            </div>
            <CardHeader className="text-center pt-12">
              <div className="flex justify-center items-center gap-2 mb-4">
                  <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
              </div>
              <CardTitle className="text-4xl font-extrabold">
                {isAnnual ? '₹1000' : '₹99'}
                <span className="text-lg font-medium text-muted-foreground">/{isAnnual ? 'year' : 'month'}</span>
              </CardTitle>
              <CardDescription>Get the visibility you deserve.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <span className="font-medium text-foreground/90">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button size="lg" className="w-full h-12 text-lg" onClick={handleGetVerified} disabled={isCurrentlyVerified}>
                            {isCurrentlyVerified ? 'You are already Verified' : 'Get Verified Now'}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <div className="flex justify-center mb-4">
                               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                 <Verified className="w-8 h-8 text-primary" />
                               </div>
                            </div>
                            <AlertDialogTitle className="text-center text-2xl">Confirm Your Subscription</AlertDialogTitle>
                            <AlertDialogDescription className="text-center">
                                You are about to purchase the <strong>Pro Verified</strong> plan
                                for <strong>{isAnnual ? '₹1000/year' : '₹99/month'}</strong>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="sm:justify-center">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handlePayment}>Proceed to Payment</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
