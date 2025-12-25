
'use client';

import { PageHero } from "@/components/shared/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useState, useEffect } from "react";

export default function TermsAndConditionsPage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    // This code now runs only on the client, after the initial render.
    setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="bg-muted/40">
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-primary">Terms & Conditions</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Please read our terms carefully before using our services for listing properties and purchasing plans.
                </p>
            </div>
            <Card className="max-w-4xl mx-auto">
                 <CardHeader>
                    {lastUpdated ? (
                        <p className="text-sm text-muted-foreground">Last Updated: {lastUpdated}</p>
                    ) : (
                        <div className="h-5 w-48 bg-muted rounded-md animate-pulse" />
                    )}
                </CardHeader>
                <CardContent className="prose prose-lg max-w-none marker:text-primary">
                    <h2>1. Agreement to Terms</h2>
                    <p>
                    By using our website and services, including purchasing listing credits or subscriptions, you agree to be bound by these Terms and Conditions. If you do not agree, you may not use our services.
                    </p>

                    <h2>2. User Accounts & Subscriptions</h2>
                    <p>
                    You are responsible for maintaining the confidentiality of your account. You agree to be responsible for all activities under your account, including the purchase and use of listing credits and "Pro Verified" subscriptions.
                    </p>

                    <h2>3. Property Listings</h2>
                    <p>
                    You are solely responsible for the content you post, including property listings. You warrant that all information provided is accurate, current, and does not violate any laws or third-party rights. By posting, you grant Falcon Estates a license to display, format, and distribute your content on our platform. We reserve the right to approve, reject, or remove any listing that violates our policies.
                    </p>

                    <h2>4. Prohibited Activities</h2>
                    <p>You agree not to:</p>
                    <ul>
                        <li>Post false, misleading, or fraudulent information.</li>
                        <li>Infringe on any third-party's copyright, patent, or trademark.</li>
                        <li>Use the service for any illegal purpose.</li>
                        <li>Post obscene or defamatory content.</li>
                    </ul>

                    <h2>5. Fees and Payments</h2>
                    <p>
                    All fees for services, such as listing credits and "Pro Verified" subscriptions, are due at the time of purchase. All payments are processed through our third-party payment gateway. Please review our <strong>Refund Policy</strong> for information on the non-refundable nature of these purchases.
                    </p>
                    
                    <h2>6. Limitation of Liability</h2>
                    <p>
                    Falcon Estates is a platform for connecting users. We are not a party to any transaction between buyers and sellers. We do not guarantee the accuracy of listings or the quality of properties. Our liability is limited to the maximum extent permitted by law.
                    </p>

                    <h2>7. Governing Law</h2>
                    <p>
                    These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                    </p>

                    <h2>8. Contact Us</h2>
                    <p>
                    If you have any questions about these Terms, please contact us at <a href="mailto:contact@falconestates.com">contact@falconestates.com</a>.
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
