
'use client';

import { useState } from 'react';
import { CreativePricing, type PricingTier } from "@/components/ui/creative-pricing";
import { Zap, Bot, Star, Building } from "lucide-react";

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
        features: ["Unlimited Listings", "Premium Support", "Analytics Dashboard", "Custom Branding", "Website"],
        icon: <Building className="w-6 h-6" />,
        color: "text-amber-500",
    },
];


export default function PricingPage() {
    const handlePlanSelection = (plan: PricingTier) => {
        console.log("Selected plan:", plan.name);
    };

    return (
        <div className="py-16 md:py-24 bg-background">
            <CreativePricing 
                tag="Pricing"
                title="Find the Perfect Plan"
                description="Choose the plan that's right for you and unlock powerful features to sell or rent your properties faster."
                tiers={plans}
                onGetStarted={handlePlanSelection}
            />
        </div>
    );
}
