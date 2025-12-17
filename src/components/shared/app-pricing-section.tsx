
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
        <section className="py-16 md:py-24 bg-background">
             <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">Flexible Plans for Everyone</h2>
                    <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                        Choose the perfect plan that fits your needs, from a single listing to unlimited exposure.
                    </p>
                </div>
                <PricingTable
                    features={features.map(feature => ({
                        ...feature,
                        name: feature.name
                    }))}
                    plans={plans.map(plan => ({
                        ...plan,
                        name: plan.name,
                        description: plan.listings,
                    }))}
                    defaultPlan="pro"
                    defaultInterval="monthly"
                    onPlanSelect={(plan) => console.log("Selected plan:", plan)}
                    buttonClassName="bg-primary hover:bg-primary/90"
                />
            </div>
        </section>
    );
}
