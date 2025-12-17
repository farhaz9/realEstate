"use client";

import { PricingTable } from "@/components/ui/pricing-table";

const features = [
    { name: "Basic Listing", included: "free" },
    { name: "Public Search", included: "free" },
    { name: "Email Support", included: "free" },
    { name: "Featured Listings", included: "starter" },
    { name: "Priority Support", included: "starter" },
    { name: "Analytics Dashboard", included: "pro" },
    { name: "Highlighted on Homepage", included: "pro" },
    { name: "Premium Support", included: "business" },
    { name: "Custom Branding", included: "business" },
];

const plans = [
    {
        name: "Free",
        level: "free",
        price: { monthly: 0, yearly: 0 },
        listings: "1 Listing",
    },
    {
        name: "Starter",
        level: "starter",
        price: { monthly: 499, yearly: 4990 },
        listings: "5 Listings",
        popular: true,
    },
    {
        name: "Pro",
        level: "pro",
        price: { monthly: 999, yearly: 9990 },
        listings: "15 Listings",
    },
    {
        name: "Business",
        level: "business",
        price: { monthly: 1999, yearly: 19990 },
        listings: "Unlimited Listings",
    },
];

export function AppPricingSection() {
    return (
        <PricingTable
            features={features.map(feature => ({
                ...feature,
                name: feature.name
            }))}
            plans={plans.map(plan => ({
                ...plan,
                name: `${plan.name} - ${plan.listings}`
            }))}
            defaultPlan="pro"
            defaultInterval="monthly"
            onPlanSelect={(plan) => console.log("Selected plan:", plan)}
            containerClassName="py-12"
            buttonClassName="bg-primary hover:bg-primary/90"
        />
    );
}
