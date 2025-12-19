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
    <div className="bg-muted/40">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Refund & Cancellation Policy</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Our policy on refunds for digital services like listing credits and subscriptions.
            </p>
        </div>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
             <p className="text-sm text-muted-foreground">Last Updated: {lastUpdated}</p>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none marker:text-primary">
            
            <h2>1. General Policy</h2>
            <p>
              At Falcon Estates, we offer digital services including, but not limited to, individual property listing credits and "Pro Verified" subscriptions. This policy outlines the terms for refunds and cancellations related to these services.
            </p>

            <h2>2. Non-Refundable Services</h2>
            <p>
              All fees paid for our digital services are <strong>non-refundable</strong>. This includes:
            </p>
            <ul>
              <li><strong>Property Listing Credits:</strong> Once a listing credit is purchased, the sale is final. The service is considered rendered at the point of purchase as the credit is immediately available in your account.</li>
              <li><strong>"Pro Verified" Subscriptions (Monthly & Annually):</strong> Fees for subscriptions are non-refundable. Once a subscription is activated, you gain immediate access to its benefits (e.g., verified badge, higher visibility).</li>
            </ul>

            <h2>3. Why We Have This Policy</h2>
            <p>
              Our services are digital in nature and provide immediate value upon purchase. The benefits, such as enhanced visibility for a listing or a professional badge for a profile, are instantly applied and cannot be returned. This policy allows us to maintain fair pricing for all users.
            </p>
            
            <h2>4. Subscription Cancellations</h2>
            <p>
              You may cancel your "Pro Verified" subscription at any time through your account settings. The cancellation will take effect at the end of your current billing cycle (monthly or annually). You will not be charged for the next cycle, but you will not receive a refund for any portion of the current paid period. Your subscription benefits will remain active until the end of the paid period.
            </p>

            <h2>5. Exceptional Circumstances</h2>
            <p>
              In the rare event of a billing error or a technical failure on our platform that prevents you from using the purchased service, we may, at our sole discretion, offer a credit or a refund. Please contact our support team with detailed evidence of the issue if you believe this applies to you.
            </p>

            <h2>6. Contact Us</h2>
            <p>
              If you have any questions about our Refund Policy, please contact us at <a href="mailto:contact@falconestates.com">contact@falconestates.com</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
