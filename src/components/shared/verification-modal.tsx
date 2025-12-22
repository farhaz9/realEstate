
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, arrayUnion, increment } from 'firebase/firestore';
import type { User, AppSettings } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ModalPricing, type PlanOption } from '@/components/ui/modal-pricing';
import { formatPrice } from '@/lib/utils';

declare const Razorpay: any;

interface VerificationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const verificationFeatures = [
    'Verified Badge on Profile',
    'Higher visibility in search',
    'Increased user trust',
    'Priority support',
];

export function VerificationModal({ open, onOpenChange }: VerificationModalProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [selectedPlanId, setSelectedPlanId] = useState('monthly');

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const appSettingsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'app_settings', 'config');
    }, [firestore]);

    const { data: userProfile } = useDoc<User>(userDocRef);
    const { data: appSettings } = useDoc<AppSettings>(appSettingsRef);

    const monthlyPrice = appSettings?.verifiedPriceMonthly ?? 99;
    const annualPrice = appSettings?.verifiedPriceAnnually ?? 1000;

    const plans: PlanOption[] = [
        {
            id: 'monthly',
            name: 'Monthly Plan',
            price: formatPrice(monthlyPrice),
            description: 'Billed every month',
            features: verificationFeatures,
        },
        {
            id: 'annual',
            name: 'Annual Plan',
            price: formatPrice(annualPrice),
            description: `Save ${Math.round((1 - (annualPrice / (monthlyPrice * 12))) * 100)}%`,
            features: verificationFeatures,
            isAnnual: true,
        },
    ];

    const handlePayment = async () => {
        onOpenChange(false);
        if (!user || !userDocRef) {
            toast({ title: "Authentication Error", description: "You must be logged in to make a payment.", variant: "destructive" });
            return;
        }
        if (typeof window === 'undefined' || !(window as any).Razorpay) {
            toast({ title: "Payment Gateway Error", description: "Razorpay is not available.", variant: "destructive" });
            return;
        }

        const isAnnual = selectedPlanId === 'annual';
        const amount = (isAnnual ? annualPrice : monthlyPrice) * 100;
        const displayAmount = isAnnual ? annualPrice : monthlyPrice;
        const description = `Payment for ${isAnnual ? 'Annual' : 'Monthly'} Verification`;

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: amount.toString(),
            currency: "INR",
            name: "Falcon Estates - Verification",
            description,
            image: "/logo.png",
            handler: (response: any) => {
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

                toast({ title: "Payment Successful!", description: "Congratulations! You are now a Verified Professional.", variant: "success" });
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
        <ModalPricing
            plans={plans}
            open={open}
            onOpenChange={onOpenChange}
            onConfirm={handlePayment}
            selectedPlan={selectedPlanId}
            onPlanChange={setSelectedPlanId}
        />
    );
}

