
import { AppPricingSection } from "@/components/shared/app-pricing-section";
import { PageHero } from "@/components/shared/page-hero";

export default function PricingPage() {
  return (
    <>
      <PageHero
        title="Our Pricing Plans"
        subtitle="Choose the perfect plan to get your properties seen by the right people."
        className="bg-muted"
      />
      <div className="py-16">
        <AppPricingSection />
      </div>
    </>
  );
}
