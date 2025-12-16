'use client';

import { PageHero } from "@/components/shared/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign } from "lucide-react";
import { useState, useEffect } from "react";

export default function RefundPolicyPage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div>
      <PageHero
        title="Refund Policy"
        subtitle="Our policy regarding refunds for services."
        image={{
          id: "contact-hero",
          imageHint: "money transaction",
        }}
      />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-4">
              <CircleDollarSign className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Refund & Cancellation Policy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            {lastUpdated && <p><strong>Last Updated: {lastUpdated}</strong></p>}
            
            <h2>1. General Policy</h2>
            <p>
              At Falcon Axe Homes, we strive to provide excellent service. This policy outlines the terms for refunds and cancellations for our premium services, such as featured listings.
            </p>

            <h2>2. Premium Listing Fees</h2>
            <p>
              Fees paid for premium or featured listings are non-refundable. Once a listing is upgraded to a premium tier, the service is considered rendered, and the associated fee is earned by us.
            </p>

            <h2>3. No-Refund Policy for Digital Services</h2>
            <p>
              Due to the nature of digital services, once a subscription or a one-time premium service is activated, we cannot offer a refund. The benefits of the service, such as increased visibility and placement, are immediately applied.
            </p>
            
            <h2>4. Cancellations</h2>
            <p>
              You may cancel your premium subscription at any time. However, the cancellation will take effect at the end of the current billing cycle, and you will not be entitled to a refund for any fees already paid. Your listings will retain their premium status until the end of the paid period.
            </p>

            <h2>5. Exceptional Circumstances</h2>
            <p>
              In rare cases of technical errors from our side that prevent the delivery of the paid service, we may, at our sole discretion, offer a credit or a refund. Please contact our support team with detailed information if you believe this applies to you.
            </p>

            <h2>6. Contact Us</h2>
            <p>
              If you have any questions about our Refund Policy, please contact us at contact@falconaxehomes.com.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
