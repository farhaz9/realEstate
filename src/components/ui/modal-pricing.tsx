
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
            <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
                        <Verified className="h-5 w-5 text-blue-500" />
                        Become a Verified Professional
                    </DialogTitle>
                    <DialogDescription>
                        Select the perfect plan for your needs. Gain trust and visibility.
                    </DialogDescription>
                </DialogHeader>

                <RadioGroup
                    value={selectedPlan}
                    onValueChange={onPlanChange}
                    className="gap-4 py-4"
                >
                    {plans.map((plan) => (
                        <label
                            key={plan.id}
                            className={cn(`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all`,
                                selectedPlan === plan.id
                                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                                    : "border-zinc-200 dark:border-zinc-800 hover:border-primary/50 dark:hover:border-primary/50"
                            )}
                        >
                            <RadioGroupItem
                                value={plan.id}
                                className="sr-only"
                            />
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                        {plan.name}
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        {plan.description}
                                    </p>
                                </div>
                                <div className="flex items-baseline">
                                    <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                                        {plan.price}
                                    </span>
                                    <span className="ml-1 text-zinc-500 dark:text-zinc-400">
                                        /{plan.isAnnual ? 'year' : 'mo'}
                                    </span>
                                </div>
                            </div>
                            <ul className="space-y-2 mt-4">
                                {plan.features.map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center text-sm text-zinc-600 dark:text-zinc-300"
                                    >
                                        <Check className="w-4 h-4 mr-2 text-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            {selectedPlan === plan.id && (
                                <div className="absolute -top-2 -right-2">
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                    </span>
                                </div>
                            )}
                        </label>
                    ))}
                </RadioGroup>

                <DialogFooter className="flex flex-col gap-2">
                    <Button
                        onClick={onConfirm}
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                    >
                        Confirm Selection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export { ModalPricing };

