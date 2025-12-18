
import { PageHero } from "@/components/shared/page-hero";
import { CreativePricing } from "@/components/ui/creative-pricing";
import type { PricingTier } from "@/components/ui/creative-pricing";
import { Pencil, Star, Sparkles } from "lucide-react";

const tiers: PricingTier[] = [
    {
        name: "Basic",
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
        icon: <Star className="w-6 h-6" />,
        price: 999,
        description: "For professionals and agents.",
        color: "blue",
        features: [
            "5 Property Listings",
            "Featured on Homepage",
            "Priority Support",
            "Verified Badge",
        ],
        popular: true,
    },
    {
        name: "Business",
        icon: <Sparkles className="w-6 h-6" />,
        price: 2499,
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

export default function PricingPage() {
  return (
    <>
      <div className="py-16 bg-muted/20">
        <CreativePricing 
            tag="Our Pricing"
            title="Flexible Plans for Everyone"
            description="Choose the perfect plan to get your properties seen by the right people."
            tiers={tiers}
        />
      </div>
    </>
  );
}
