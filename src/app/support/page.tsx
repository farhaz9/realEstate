
import { PageHero } from "@/components/shared/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, MessageSquare, Mail, Clock } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "How do I schedule a viewing?",
    answer: "You can schedule a viewing directly through the property page by clicking 'Request a Tour' or by contacting the listed agent directly."
  },
  {
    question: "Are your interior designers certified?",
    answer: "Yes, all of our interior designers are certified professionals with extensive experience in creating beautiful and functional spaces. We ensure they are equipped with the latest industry knowledge."
  },
  {
    question: "What fees does Estately charge?",
    answer: "Our fees vary depending on the service. For property sales, we charge a standard commission. For interior design, we offer project-based pricing. Please contact us for a detailed quote."
  },
  {
    question: "Can I list my property myself?",
    answer: "Absolutely! We provide a user-friendly platform for property owners to list their properties. We offer both free and premium listing options for enhanced visibility."
  }
];

export default function SupportPage() {
  return (
    <div>
      <PageHero
        title="Support Center"
        subtitle="We're here to help. Find answers to your questions or get in touch with our team."
        image={{
          id: "contact-hero",
          imageHint: "customer service agent",
        }}
      />
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="bg-background rounded-lg shadow-sm border">
                  <AccordionTrigger className="text-base font-semibold text-left px-6 py-4 hover:no-underline data-[state=open]:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Still need help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Call Us</h3>
                    <p className="text-muted-foreground text-sm">+91 9953414336</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">WhatsApp</h3>
                     <Link href="https://wa.me/919953414336" target="_blank" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                      +91 9953414336
                    </Link>
                  </div>
                </div>
                 <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Us</h3>
                    <p className="text-muted-foreground text-sm break-all">support@falconaxehomes.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Sunday & Holidays</span>
                  <span className="font-medium text-destructive">Closed</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
