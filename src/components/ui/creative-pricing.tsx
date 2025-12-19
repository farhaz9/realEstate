
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

export interface PricingTier {
    name: string;
    icon: React.ReactNode;
    price: number;
    priceAnnual: number;
    description: string;
    features: string[];
    popular?: boolean;
    color: string;
    level: string;
}

function CreativePricing({
    tag = "Simple Pricing",
    title = "Make Short Videos That Pop",
    description = "Edit, enhance, and go viral in minutes",
    tiers,
    onGetStarted,
    isAnnual,
    setIsAnnual,
}: {
    tag?: string;
    title?: string;
    description?: string;
    tiers: PricingTier[];
    onGetStarted: (tier: PricingTier) => void;
    isAnnual: boolean;
    setIsAnnual: (isAnnual: boolean) => void;
}) {

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            <div className="text-center space-y-4 mb-12">
                <div className="text-sm font-bold text-primary uppercase tracking-wider">
                    {tag}
                </div>
                <div className="relative">
                    <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white">
                        {title}
                    </h2>
                </div>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                    {description}
                </p>
            </div>

            <div className="flex justify-center items-center gap-4 mb-12">
                <span className={cn("font-medium", !isAnnual && "text-primary")}>Monthly</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isAnnual} onChange={() => setIsAnnual(!isAnnual)} className="sr-only peer" />
                    <div className="w-14 h-8 bg-muted peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-zinc-600 peer-checked:bg-primary"></div>
                </label>
                <span className={cn("font-medium", isAnnual && "text-primary")}>Annually</span>
                <div className="hidden sm:inline-block ml-2 text-sm bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full">
                    Save 15%
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {tiers.map((tier) => (
                    <div
                        key={tier.name}
                        className="relative group"
                    >
                        <div
                            className={cn(
                                "absolute inset-0 bg-purple-50 dark:bg-zinc-900",
                                "border-2 border-zinc-900 dark:border-white",
                                "rounded-lg shadow-[4px_4px_0px_0px] shadow-zinc-900 dark:shadow-white",
                                "transition-all duration-300",
                                "group-hover:shadow-[8px_8px_0px_0px]",
                                "group-hover:translate-x-[-4px]",
                                "group-hover:translate-y-[-4px]"
                            )}
                        />

                        <div className="relative p-6">
                            {tier.popular && (
                                <div
                                    className="absolute -top-3 right-4 bg-primary text-primary-foreground 
                                    font-semibold px-3 py-1 rounded-full text-sm border-2 border-zinc-900"
                                >
                                    Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full mb-4",
                                        "flex items-center justify-center",
                                        "border-2 border-zinc-900 dark:border-white",
                                        `text-primary`
                                    )}
                                >
                                    {tier.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {tier.name}
                                </h3>
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    {tier.description}
                                </p>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-zinc-900 dark:text-white">
                                    {formatPrice(isAnnual ? tier.priceAnnual : tier.price)}
                                </span>
                                {tier.price > 0 && 
                                    <span className="text-zinc-600 dark:text-zinc-400">
                                        /{isAnnual ? 'year' : 'month'}
                                    </span>
                                }
                            </div>

                            <div className="space-y-3 mb-6">
                                {tier.features.map((feature) => (
                                    <div
                                        key={feature}
                                        className="flex items-center gap-3"
                                    >
                                        <div
                                            className="w-5 h-5 rounded-full border-2 border-zinc-900 
                                            dark:border-white flex items-center justify-center"
                                        >
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="text-lg text-zinc-900 dark:text-white">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => onGetStarted(tier)}
                                className={cn(
                                    "w-full h-12 text-lg relative",
                                    "border-2 border-zinc-900 dark:border-white",
                                    "transition-all duration-300",
                                    "shadow-[4px_4px_0px_0px] shadow-zinc-900 dark:shadow-white",
                                    "hover:shadow-[6px_6px_0px_0px] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                                    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
                                )}
                            >
                                {tier.price === 0 ? "Included" : "Get Started"}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


export { CreativePricing };
