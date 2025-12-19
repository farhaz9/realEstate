
'use client';

import { useState } from 'react';
import { CreativePricing, type PricingTier } from "@/components/ui/creative-pricing";
import { Zap, Bot, Star, Building, Verified } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

declare const Razorpay: any;

const plans: PricingTier[] = [
    {
        name: "Free",
        level: "free",
        price: 0,
        priceAnnual: 0,
        description: "For individuals starting out.",
        features: ["1 Property Listing", "Basic Support", "Public Search"],
        icon: <Bot className="w-6 h-6" />,
        color: "text-zinc-500",
    },
    {
        name: "Basic",
        level: "basic",
        price: 499,
        priceAnnual: 4990,
        description: "For those with a few properties.",
        features: ["5 Listings", "Basic Support", "Public Search"],
        icon: <Zap className="w-6 h-6" />,
        color: "text-blue-500",
    },
    {
        name: "Pro",
        level: "pro",
        price: 999,
        priceAnnual: 9990,
        description: "For professionals and serious sellers.",
        features: ["15 Listings", "Priority Support", "Featured Listings"],
        icon: <Star className="w-6 h-6" />,
        popular: true,
        color: "text-primary",
    },
    {
        name: "Business",
        level: "business",
        price: 5500,
        priceAnnual: 19990,
        description: "For agencies and power users.",
        features: ["Unlimited Listings", "Premium Support", "Analytics Dashboard", "Custom Branding", "Website", "Verified Badge"],
        icon: <Building className="w-6 h-6" />,
        color: "text-amber-500",
    },
];


export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PricingTier | null>(null);
    const [isPaymentAlertOpen, setIsPaymentAlertOpen] = useState(false);

    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile } = useDoc<User>(userDocRef);
    
    const handlePlanSelection = (plan: PricingTier) => {
        if (plan.price === 0) {
            toast({ title: "You are on the Free plan." });
            return;
        }

        if (!user) {
            router.push('/login');
            return;
        }

        setSelectedPlan(plan);
        setIsPaymentAlertOpen(true);
    };

    const handlePayment = async () => {
        if (!selectedPlan || !user || !userDocRef) {
            toast({ title: "Error", description: "Could not initiate payment. Plan or user not found.", variant: "destructive" });
            return;
        }

        if (typeof window === 'undefined' || !(window as any).Razorpay) {
            toast({ title: "Payment Gateway Error", description: "Razorpay is not available.", variant: "destructive"});
            return;
        }

        const amount = isAnnual ? selectedPlan.priceAnnual * 100 : selectedPlan.price * 100;
        const displayAmount = isAnnual ? selectedPlan.priceAnnual : selectedPlan.price;
        const description = `Payment for ${selectedPlan.name} - ${isAnnual ? 'Annual' : 'Monthly'} Subscription`;

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: amount.toString(),
            currency: "INR",
            name: `Falcon Estates - ${selectedPlan.name}`,
            description,
            image: "/logo.png",
            handler: (response: any) => {
                const newTransaction = {
                    paymentId: response.razorpay_payment_id,
                    amount: displayAmount,
                    date: new Date(),
                    description,
                };

                let updateData: any = {
                    transactions: arrayUnion(newTransaction),
                };

                const credits = {
                    'basic': 5,
                    'pro': 15,
                    'business': 999, // Essentially unlimited
                }[selectedPlan.level] || 0;
                
                if (credits > 0) {
                    updateData.listingCredits = increment(credits);
                }

                // If the business plan is purchased, grant verification status
                if (selectedPlan.level === 'business') {
                    const newExpiryDate = new Date();
                    if (isAnnual) {
                        newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
                    } else {
                        newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
                    }
                    updateData.isVerified = true;
                    updateData.verifiedUntil = newExpiryDate;
                     toast({ title: "Payment Successful!", description: `Congratulations! You are now a Business member.`, variant: "success"});
                } else {
                    toast({ title: "Payment Successful!", description: `Thank you for your purchase. You've received ${credits} listing credits.`, variant: "success"});
                }
                
                updateDocumentNonBlocking(userDocRef, updateData);

                setIsPaymentAlertOpen(false);
            },
            prefill: {
                name: userProfile?.fullName,
                email: userProfile?.email,
                contact: userProfile?.phone,
            },
            theme: { color: "#6D28D9" }
        };
        const rzp = new Razorpay(options);
        rzp.open();
    };

    return (
        <div className="py-16 md:py-24 bg-background">
            <CreativePricing 
                tag="Pricing"
                title="Find the Perfect Plan"
                description="Choose the plan that's right for you and unlock powerful features to sell or rent your properties faster."
                tiers={plans}
                onGetStarted={handlePlanSelection}
                isAnnual={isAnnual}
                setIsAnnual={setIsAnnual}
            />
            {selectedPlan && (
                <AlertDialog open={isPaymentAlertOpen} onOpenChange={setIsPaymentAlertOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Verified className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                            <AlertDialogTitle className="text-center text-2xl">Confirm Your Purchase</AlertDialogTitle>
                            <AlertDialogDescription className="text-center">
                                You are about to purchase the <strong>{selectedPlan?.name}</strong> plan
                                for <strong>{isAnnual ? formatPrice(selectedPlan.priceAnnual) + '/year' : formatPrice(selectedPlan.price) + '/month'}</strong>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="sm:justify-center">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handlePayment}>Proceed to Payment</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
