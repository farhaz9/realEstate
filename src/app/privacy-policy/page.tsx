'use client';

import { PageHero } from "@/components/shared/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";

export default function PrivacyPolicyPage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="bg-muted/40">
      <div className="container mx-auto px-4 py-16">
         <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Privacy Policy</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Your privacy is important to us. Here's how we collect, use, and protect your data.
            </p>
        </div>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <p className="text-sm text-muted-foreground">Last Updated: {lastUpdated}</p>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none marker:text-primary">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Falcon Estates ("we," "our," "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services, particularly in relation to property listings and user accounts.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We may collect the following types of information:
            </p>
            <ul>
                <li><strong>Personal Information:</strong> Name, email address, phone number, and professional category when you create an account.</li>
                <li><strong>User-Generated Content:</strong> Information you provide in property listings, such as property details, descriptions, images, and contact numbers.</li>
                <li><strong>Transaction Data:</strong> Details of purchases you make on our site, such as listing credits or "Pro Verified" subscriptions, including payment IDs and transaction amounts. We do not store your credit card details.</li>
                <li><strong>Usage Data:</strong> Information automatically collected, such as your IP address, browser type, and browsing behavior on our site (e.g., viewed properties, wishlisted items).</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, operate, and maintain our services, including displaying your property listings.</li>
              <li>Process your transactions for listing credits and subscriptions.</li>
              <li>Facilitate communication between property buyers and sellers/agents.</li>
              <li>Improve, personalize, and expand our services.</li>
              <li>Communicate with you for customer service, updates, and marketing purposes.</li>
              <li>Monitor usage and prevent fraudulent activities.</li>
            </ul>

            <h2>4. Sharing Your Information</h2>
            <p>
              We may share your information in the following situations:
            </p>
            <ul>
                <li><strong>With the Public:</strong> Information you provide in a property listing (e.g., property details, contact number) will be publicly visible.</li>
                <li><strong>With Service Providers:</strong> We may share data with third-party vendors that perform services for us, such as payment processing (e.g., Razorpay).</li>
                <li><strong>For Legal Reasons:</strong> We may disclose your information if required by law or to protect the rights and safety of our users and our platform.</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information. However, please be aware that no security measures are perfect or impenetrable, and we cannot guarantee complete security.
            </p>

            <h2>6. Your Rights and Choices</h2>
            <p>
              You have the right to access, correct, or delete your personal information and property listings through your account settings. You can also opt-out of marketing communications.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:contact@falconestates.com">contact@falconestates.com</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
