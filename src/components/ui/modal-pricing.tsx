
"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Sparkles, Zap, Verified } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlanOption {
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
    isAnnual?: boolean;
}

function ModalPricing({
    plans,
    open,
    onOpenChange,
    onConfirm,
    selectedPlan,
    onPlanChange,
}: {
    plans: PlanOption[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    selectedPlan: string;
    onPlanChange: (planId: string) => void;
}) {

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <Verified className="h-8 w-8 text-blue-500" />
                    </div>
                    <DialogTitle className="text-2xl font-bold">
                        Become a Verified Professional
                    </DialogTitle>
                    <DialogDescription>
                        Select a plan to gain trust and visibility with a verified badge.
                    </DialogDescription>
                </DialogHeader>

                <RadioGroup
                    value={selectedPlan}
                    onValueChange={onPlanChange}
                    className="grid grid-cols-2 gap-4 py-4"
                >
                    {plans.map((plan) => (
                        <label
                            key={plan.id}
                            className={cn(`relative flex flex-col items-center justify-center cursor-pointer rounded-xl border-2 p-4 transition-all`,
                                selectedPlan === plan.id
                                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                                    : "border-zinc-200 dark:border-zinc-800 hover:border-primary/50 dark:hover:border-primary/50"
                            )}
                        >
                            <RadioGroupItem
                                value={plan.id}
                                className="sr-only"
                            />
                            <div className="text-center">
                                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                                    {plan.name}
                                </h3>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                    {plan.description}
                                </p>
                                <div className="mt-2 flex items-baseline justify-center">
                                    <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                        {plan.price}
                                    </span>
                                    <span className="ml-1 text-sm text-zinc-500 dark:text-zinc-400">
                                        /{plan.isAnnual ? 'year' : 'mo'}
                                    </span>
                                </div>
                            </div>
                           
                            {selectedPlan === plan.id && (
                                <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary">
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                </div>
                            )}
                        </label>
                    ))}
                </RadioGroup>
                
                <ul className="space-y-3 py-2 text-sm text-muted-foreground">
                    {plans[0].features.map((feature, index) => (
                         <li key={index} className="flex items-center gap-3">
                             <Check className="h-4 w-4 text-green-500" />
                             <span>{feature}</span>
                         </li>
                    ))}
                </ul>

                <DialogFooter>
                    <Button
                        onClick={onConfirm}
                        className="w-full h-12 text-base font-bold"
                    >
                        Confirm and Pay
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export { ModalPricing };
