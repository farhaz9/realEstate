
import { PageHero } from "@/components/shared/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div>
      <PageHero
        title="Terms & Conditions"
        subtitle="Please read our terms carefully before using our service."
        image={{
          id: "contact-hero",
          imageHint: "legal document",
        }}
      />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <p><strong>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>

            <h2>1. Agreement to Terms</h2>
            <p>
              By using our website and services, you agree to be bound by these Terms and Conditions. If you do not agree, you may not use our services.
            </p>

            <h2>2. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>

            <h2>3. User-Generated Content</h2>
            <p>
              You are solely responsible for the content you post, including property listings. You grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display your content in connection with our services. You warrant that you have all necessary rights to post the content and that it does not violate any third-party rights or applicable laws.
            </p>

            <h2>4. Prohibited Activities</h2>
            <p>
              You may not use our services for any illegal or unauthorized purpose. You agree not to post any content that is false, misleading, defamatory, or obscene.
            </p>

            <h2>5. Intellectual Property</h2>
            <p>
              All content on this website, including text, graphics, logos, and software, is the property of Falcon Axe Homes or its content suppliers and is protected by intellectual property laws.
            </p>
            
            <h2>6. Limitation of Liability</h2>
            <p>
              Falcon Axe Homes will not be liable for any damages of any kind arising from the use of this site, including, but not limited to direct, indirect, incidental, punitive, and consequential damages.
            </p>

            <h2>7. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>

             <h2>8. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at contact@falconaxehomes.com.
            </p>
          </CardContent>
        </Card>
      </div>
