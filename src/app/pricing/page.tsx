
'use client';

import { CreativePricing } from "@/components/ui/creative-pricing";
import type { PricingTier } from "@/components/ui/creative-pricing";
import { Pencil, Star, Sparkles } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, arrayUnion } from 'firebase/firestore';
import type { User, AppSettings } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
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
import { useState } from "react";
import { Briefcase } from "lucide-react";

declare const Razorpay: any;

export default function PricingPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

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


    const tiers: PricingTier[] = [
        {
            name: "Basic",
            level: "free",
            icon: <Pencil className="w-6 h-6" />,
            price: 0,
            description: "For individuals just starting out.",
            color: "amber",
            features: [
                "1 Property Listing",
                "Basic Support",
                "Visible for 30 days",
            ],
        },
        {
            name: "Pro",
            level: "pro",
            icon: <Star className="w-6 h-6" />,
            price: 1000,
            description: "For professionals and agents.",
            color: "blue",
            features: [
                "15 Property Listings",
                "Featured on Homepage",
                "Priority Support",
                "Verified Badge",
            ],
            popular: true,
        },
        {
            name: "Business",
            level: "business",
            icon: <Briefcase className="w-6 h-6" />,
            price: 2500,
            description: "For agencies and large teams.",
            color: "purple",
            features: [
                "Unlimited Listings",
                "Dedicated Account Manager",
                "Advanced Analytics",
                "Agent Profiles",
            ],
        },
    ];

    const handleGetStarted = (tier: PricingTier) => {
        if (tier.price === 0) return;

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
        
        setSelectedTier(tier);
    };

    const handlePayment = async () => {
        if (!user || !userDocRef || !selectedTier) {
            toast({ title: "Error", description: "Could not initiate payment.", variant: "destructive" });
            return;
        }
        if (typeof window === 'undefined' || !(window as any).Razorpay) {
            toast({ title: "Payment Gateway Error", description: "Razorpay is not available.", variant: "destructive"});
            return;
        }

        const amount = selectedTier.price * 100;
        const description = `Payment for ${selectedTier.name} Plan`;

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: amount.toString(),
            currency: "INR",
            name: `Falcon Axe Homes - ${selectedTier.name}`,
            description,
            image: "/logo.png",
            handler: (response: any) => {
                toast({ title: "Payment Successful!", description: `Welcome to the ${selectedTier.name} plan!`, variant: "success"});
                
                const newExpiryDate = new Date();
                if (selectedTier.level === 'business') { // Assuming business is annual
                    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
                } else {
                    newExpiryDate.setDate(newExpiryDate.getDate() + 30);
                }

                const newOrder = {
                    paymentId: response.razorpay_payment_id,
                    amount: selectedTier.price,
                    date: new Date(),
                    description,
                };
                
                updateDocumentNonBlocking(userDocRef, {
                    orders: arrayUnion(newOrder),
                    isVerified: true,
                    verifiedUntil: newExpiryDate
                });

                setSelectedTier(null);
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
    <>
      <div className="py-16 bg-muted/20">
        <CreativePricing 
            tag="Our Pricing"
            title="Flexible Plans for Everyone"
            description="Choose the perfect plan to get your properties seen by the right people."
            tiers={tiers}
            onGetStarted={handleGetStarted}
        />
      </div>

       <AlertDialog open={!!selectedTier} onOpenChange={(open) => !open && setSelectedTier(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to purchase the <strong>{selectedTier?.name}</strong> plan for <strong>{formatPrice(selectedTier?.price || 0)}/month</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePayment}>Proceed to Payment</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
