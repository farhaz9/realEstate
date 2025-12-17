
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckIcon, ArrowRightIcon, Cross1Icon } from "@radix-ui/react-icons"
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
import { Verified } from "lucide-react";

declare const Razorpay: any;

export type PlanLevel = "starter" | "pro" | "all" | string

export interface PricingFeature {
  name: string
  included: PlanLevel | null
}

export interface PricingPlan {
  name: string
  description?: string;
  level: PlanLevel
  price: {
    monthly: number
    yearly: number
  }
  popular?: boolean
}

export interface PricingTableProps
  extends React.HTMLAttributes<HTMLDivElement> {
  features: PricingFeature[]
  plans: PricingPlan[]
  onPlanSelect?: (plan: PlanLevel) => void
  defaultPlan?: PlanLevel
  defaultInterval?: "monthly" | "yearly"
  containerClassName?: string
  buttonClassName?: string
}

export function PricingTable({
  features,
  plans,
  onPlanSelect,
  defaultPlan = "pro",
  defaultInterval = "monthly",
  className,
  containerClassName,
  buttonClassName,
  ...props
}: PricingTableProps) {
  const [isYearly, setIsYearly] = React.useState(defaultInterval === "yearly")
  const [selectedPlan, setSelectedPlan] = React.useState<PlanLevel>(defaultPlan)
  const [isPaymentAlertOpen, setIsPaymentAlertOpen] = React.useState(false);

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

  const handlePlanSelect = (planLevel: PlanLevel) => {
    const plan = plans.find(p => p.level === planLevel);
    if (!plan) return;

    setSelectedPlan(planLevel);
    onPlanSelect?.(planLevel);
    
    if (plan.level === 'free') {
        // Handle free plan selection, e.g. navigate to a signup page or show a confirmation.
        // For now, we just call the callback and don't open the payment dialog.
        return;
    }

    if (user) {
        if(isCurrentlyVerified) {
             toast({
                title: "Already Verified",
                description: `Your verification is active until ${verificationExpiresAt}.`,
                variant: 'success'
            });
        } else {
             setIsPaymentAlertOpen(true);
        }
    } else {
      router.push('/login');
    }
  }

  const handlePayment = async () => {
    const plan = plans.find(p => p.level === selectedPlan);
    if (!plan || !user || !userDocRef) {
        toast({ title: "Error", description: "Could not initiate payment. Plan or user not found.", variant: "destructive" });
        return;
    }

    if (typeof window === 'undefined' || !(window as any).Razorpay) {
        toast({ title: "Payment Gateway Error", description: "Razorpay is not available.", variant: "destructive"});
        return;
    }

    const amount = isYearly ? plan.price.yearly * 100 : plan.price.monthly * 100;
    const description = `Payment for ${plan.name} - ${isYearly ? 'Annual' : 'Monthly'} Subscription`;
    const displayAmount = isYearly ? plan.price.yearly : plan.price.monthly;

    const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount.toString(),
        currency: "INR",
        name: `Falcon Axe Homes - ${plan.name}`,
        description,
        image: "/logo.png",
        handler: (response: any) => {
            toast({ title: "Payment Successful!", description: `Welcome to the ${plan.name} plan!`, variant: "success"});
            
            const newExpiryDate = new Date();
            if (isYearly) {
                newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
            } else {
                newExpiryDate.setDate(newExpiryDate.getDate() + 30);
            }

            const newOrder = {
                paymentId: response.razorpay_payment_id,
                amount: displayAmount,
                date: new Date(),
                description,
            };
            
            updateDocumentNonBlocking(userDocRef, {
                orders: arrayUnion(newOrder),
                isVerified: true,
                verifiedUntil: newExpiryDate
            });

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

  const formatPriceLocal = (price: number) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const selectedPlanData = plans.find((p) => p.level === selectedPlan);

  return (
    <div
        className={cn("w-full max-w-5xl mx-auto", containerClassName)}
        {...props}
    >
         <div
            className="relative mx-auto grid w-fit grid-cols-2 rounded-full border bg-muted p-1 mb-8"
        >
            <div
                aria-hidden="true"
                className={cn(
                    'pointer-events-none absolute inset-1 w-[calc(50%-4px)] rounded-full bg-primary shadow ring-1 ring-black/5 transition-transform duration-500 ease-in-out',
                    isYearly ? "translate-x-full" : "translate-x-0"
                )}
            />
            <button
                className="relative duration-500 rounded-full h-8 w-24 text-sm hover:opacity-75"
                onClick={() => setIsYearly(false)}
                type="button"
            >
                <span className={cn(!isYearly ? 'text-primary-foreground' : 'text-foreground')}>Monthly</span>
            </button>
            <button
                className="relative duration-500 rounded-full h-8 w-24 text-sm hover:opacity-75"
                onClick={() => setIsYearly(true)}
                type="button"
            >
                <span className={cn(isYearly ? 'text-primary-foreground' : 'text-foreground')}>Annually</span>
            </button>
        </div>

        {/* Mobile View - Cards */}
        <div className="sm:hidden space-y-8">
            {plans.map((plan) => (
                <div 
                    key={plan.level} 
                    className={cn(
                        "rounded-2xl p-6 relative border transition-all",
                        selectedPlan === plan.level ? "ring-2 ring-primary border-primary" : "bg-card",
                        plan.popular ? "bg-gradient-to-br from-primary/[.05] to-purple-500/[.05]" : ""
                    )}
                >
                    {plan.popular && (
                        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                            <div className="bg-primary text-primary-foreground text-xs font-bold uppercase px-4 py-1 rounded-full shadow-lg">
                                Popular
                            </div>
                        </div>
                    )}
                    <div className="text-center">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        {plan.description && (
                            <p className="text-muted-foreground mt-1">{plan.description}</p>
                        )}
                        <div className="mt-4">
                            <span className="text-4xl font-extrabold tracking-tight">
                            {formatPriceLocal(isYearly ? plan.price.yearly : plan.price.monthly)}
                            </span>
                             {plan.price.monthly > 0 && <span className="text-muted-foreground">/{isYearly ? "year" : "month"}</span>}
                        </div>
                    </div>

                    <ul className="mt-8 space-y-4">
                        {features.map((feature) => (
                            <li key={feature.name} className="flex items-center gap-3">
                                {shouldShowCheck(feature.included, plan.level) ? (
                                <CheckIcon className="w-5 h-5 text-primary flex-shrink-0" />
                                ) : (
                                <Cross1Icon className="w-4 h-4 text-destructive/50 flex-shrink-0" />
                                )}
                                <span className="text-sm">{feature.name}</span>
                            </li>
                        ))}
                    </ul>
                    <Button
                        onClick={() => handlePlanSelect(plan.level)}
                        className={cn(
                            "w-full mt-8 h-12 text-base font-bold",
                            plan.popular ? "bg-primary hover:bg-primary/90" : "bg-primary/80 hover:bg-primary/90 text-primary-foreground",
                            buttonClassName,
                        )}
                    >
                        {plan.level === 'free' ? 'Get Started' : `Choose ${plan.name}`}
                        {plan.level !== 'free' && <ArrowRightIcon className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden sm:block">
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {plans.map((plan) => (
                <button
                  key={plan.name}
                  type="button"
                  onClick={() => setSelectedPlan(plan.level)}
                  className={cn(
                    "flex-1 p-4 rounded-xl text-left transition-all",
                    "border",
                    selectedPlan === plan.level &&
                      "ring-2 ring-primary border-primary bg-primary/5",
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{plan.name}</span>
                    {plan.popular && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-xs text-muted-foreground mb-2">{plan.description}</p>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      {formatPriceLocal(
                        isYearly ? plan.price.yearly : plan.price.monthly,
                      )}
                    </span>
                     {plan.price.monthly > 0 && <span className="text-sm font-normal text-muted-foreground">
                      /{isYearly ? "year" : "month"}
                    </span>}
                  </div>
                </button>
              ))}
            </div>

            <div className="border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[640px] divide-y">
                  <div className="flex items-center p-4 bg-muted">
                    <div className="flex-1 text-sm font-medium">Features</div>
                    <div className="flex items-center gap-8 text-sm">
                      {plans.map((plan) => (
                        <div
                          key={plan.level}
                          className="w-16 text-center font-medium"
                        >
                          {plan.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  {features.map((feature) => (
                    <div
                      key={feature.name}
                      className={cn(
                        "flex items-center p-4 transition-colors",
                        feature.included === selectedPlan &&
                          "bg-primary/10",
                      )}
                    >
                      <div className="flex-1 text-sm">{feature.name}</div>
                      <div className="flex items-center gap-8 text-sm">
                        {plans.map((plan) => (
                          <div
                            key={plan.level}
                            className={cn(
                              "w-16 flex justify-center",
                              plan.level === selectedPlan && "font-medium",
                            )}
                          >
                            {shouldShowCheck(feature.included, plan.level) ? (
                              <CheckIcon className="w-5 h-5 text-primary" />
                            ) : (
                                <Cross1Icon className="w-4 h-4 text-destructive/50" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={() => handlePlanSelect(selectedPlan)}
                className={cn(
                  "w-full sm:w-auto px-8 py-2 rounded-xl h-12 text-base font-bold",
                  buttonClassName,
                )}
              >
                {selectedPlan === 'free' ? 'Get Started' : `Get started with ${plans.find((p) => p.level === selectedPlan)?.name}`}
                {selectedPlan !== 'free' && <ArrowRightIcon className="w-4 h-4 ml-2" />}
              </Button>
            </div>
        </div>

        <AlertDialog open={isPaymentAlertOpen} onOpenChange={setIsPaymentAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Verified className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <AlertDialogTitle className="text-center text-2xl">Confirm Your Subscription</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        You are about to purchase the <strong>{selectedPlanData?.name}</strong> plan
                        for <strong>{isYearly ? formatPrice(selectedPlanData?.price.yearly ?? 0) + '/year' : formatPrice(selectedPlanData?.price.monthly ?? 0) + '/month'}</strong>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePayment}>Proceed to Payment</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  )
}

function shouldShowCheck(
  included: PricingFeature["included"],
  level: string,
): boolean {
    if (level === 'business') return true;
    if (level === 'pro' && (included === 'pro' || included === 'starter' || included === 'free')) return true;
    if (level === 'starter' && (included === 'starter' || included === 'free')) return true;
    if (level === 'free' && included === 'free') return true;
    if (level === 'pro' && (included === 'business')) return false;
    if (level === 'starter' && (included === 'pro' || included === 'business')) return false;
    if (level === 'free' && (included !== 'free')) return false;
    return false;
}
