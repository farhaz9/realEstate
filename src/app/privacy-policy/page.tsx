
import { PageHero } from "@/components/shared/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div>
      <PageHero
        title="Privacy Policy"
        subtitle="Your privacy is important to us. Here's how we protect it."
        image={{
          id: "contact-hero",
          imageHint: "secure lock",
        }}
      />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Privacy Policy for Farhaz Homes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <p><strong>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>

            <h2>1. Introduction</h2>
            <p>
              Welcome to Farhaz Homes ("we," "our," "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We may collect personal information that you provide to us directly, such as your name, email address, phone number, and user category when you create an account, list a property, or contact us. We also collect information automatically, like your IP address and browsing behavior.
            </p>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, operate, and maintain our services.</li>
              <li>Improve, personalize, and expand our services.</li>
              <li>Communicate with you, for customer service, to provide you with updates and other information relating to the website, and for marketing purposes.</li>
              <li>Process your transactions and manage your listings.</li>
              <li>Find and prevent fraud.</li>
            </ul>

            <h2>4. Sharing Your Information</h2>
            <p>
              We do not sell your personal information. We may share your information with third-party service providers to perform services on our behalf, such as payment processing and data analysis. We may also share information to comply with legal obligations or to protect our rights.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
            </p>

            <h2>6. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. You can manage your account information through your profile page or by contacting us directly.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at contact@delhiestateluxe.com.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
