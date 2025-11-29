

import Link from "next/link";
import { ArrowRight, Building, Palette, Sparkles, Handshake, Construction, DraftingCompass, Briefcase, KeyRound, Building2, ConciergeBell } from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FeaturedProperties } from "@/components/shared/nearby-properties";
import { PopularProperties } from "@/components/shared/popular-properties";
import { HomeSearch } from "@/components/shared/home-search";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { FeaturedProfessionals } from "@/components/shared/featured-professionals";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";

const faqs = [
  {
    question: "What makes you the best real estate company in Delhi?",
    answer: "As the best real_estate company in Delhi, we provide unparalleled access to exclusive luxury properties, expert market insights, and a seamless client experience from start to finish."
  },
  {
    question: "Do you offer interior design services in Delhi?",
    answer: "Yes, we are a leading interior design company in Delhi, offering bespoke design solutions that transform spaces into personalized, luxurious homes."
  },
  {
    question: "What services do you offer besides property sales and interior design?",
    answer: "We provide comprehensive solutions, including end-to-end construction management, architectural design, property consultancy, and custom furniture to ensure a complete luxury experience."
  },
  {
    question: "Which areas in Delhi do you specialize in?",
    answer: "We specialize in high-end properties across Delhi's most prestigious neighborhoods, including South Delhi, Central Delhi, Lutyens' Delhi, and other prime locations."
  }
];

const homeServices = [
  {
    icon: Building,
    title: "Properties",
    description: "Delhi's finest luxury properties.",
    imageId: "service-properties",
    href: "/properties"
  },
  {
    icon: Construction,
    title: "Construction",
    description: "End-to-end construction services.",
    imageId: "service-construction",
    href: "/services"
  },
  {
    icon: DraftingCompass,
    title: "Interiors",
    description: "Bespoke interior design solutions.",
    imageId: "service-interiors",
    href: "/interiors"
  },
    {
    icon: Sparkles,
    title: "Miscellaneous",
    description: "Custom furniture and lighting.",
    imageId: "service-miscellaneous",
    href: "/services"
  },
];

const quickServices = [
    { href: "/properties", label: "Properties", icon: Building2 },
    { href: "/properties?type=rent", label: "Rent", icon: KeyRound },
    { href: "/interiors", label: "Interiors", icon: Palette },
    { href: "/professionals", label: "Agents", icon: Briefcase },
    { href: "/services", label: "Construction", icon: Construction },
    { href: "/contact", label: "Consultancy", icon: ConciergeBell },
  ];

const whyChooseUsPoints = [
  {
    icon: Building,
    title: "Curated Properties",
    description: "Access to Delhi’s most sought-after luxury homes, vetted for quality and value.",
  },
  {
    icon: Sparkles,
    title: "Expert Guidance",
    description: "Personalized consultancy and end-to-end support from our experienced team.",
  },
  {
    icon: Handshake,
    title: "Trusted Partnerships",
    description: "Strong collaborations with top builders, ensuring premium quality and craftsmanship.",
  },
];


export default function HomePage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'home-hero');
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full h-[60vh] text-white overflow-hidden">
        {heroImage && (
           <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-primary/30 to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-end h-full pb-16 md:pb-24 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Find Your Dream Home
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-neutral-200">
            Your trusted partner in luxury properties, bespoke interiors, and end-to-end real estate solutions in Delhi.
          </p>
        </div>
      </section>

      <section className="-mt-16 relative z-20 container mx-auto">
        <HomeSearch />
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-0 sm:px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase px-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent bg-[200%_auto] animate-gradient-pan">
              Best Real Estate and Interior Design Company
            </span>
          </h2>
           <div className="mt-8 relative">
             <div className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-4 hide-scrollbar px-4">
              {quickServices.map((service) => (
                <Link href={service.href} key={service.label} className="flex flex-col items-center gap-2 text-center group flex-shrink-0 w-24">
                  <div className="relative p-1 rounded-full bg-gradient-to-br from-primary via-accent to-purple-500 group-hover:scale-105 transition-transform duration-300">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary transition-all duration-300 group-hover:bg-primary">
                      <service.icon className="h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">{service.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <section id="offers" className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">What We Offer</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions to bring your vision to life, from dream properties to stunning interiors.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
            {homeServices.map((service) => (
              <Card key={service.title} className="flex flex-col text-center items-center justify-center p-6 h-full group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
                <div className="bg-primary/10 p-4 rounded-full mb-4 transition-colors group-hover:bg-primary">
                   <service.icon className="h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground" />
                </div>
                <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                <p className="text-muted-foreground text-sm flex-grow">{service.description}</p>
                <UIButton asChild variant="link" className="mt-4">
                  <Link href={service.href}>
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </UIButton>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <PopularProperties />

      <FeaturedProfessionals />

      <FeaturedProperties />

      <section id="contact-form" className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl font-bold">Contact Us</CardTitle>
              <p className="mt-2 text-muted-foreground">Begin your journey with us. We're here to assist you.</p>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name <span className="text-destructive">*</span></Label>
                  <Input id="name" placeholder="Your Name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email <span className="text-destructive">*</span></Label>
                  <Input id="email" type="email" placeholder="Your Email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Your Phone Number <span className="text-destructive">*</span></Label>
                  <Input id="phone" type="tel" placeholder="Your Phone Number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea id="message" placeholder="Your Message" rows={5} />
                </div>
                 <div className="flex flex-col sm:flex-row gap-4">
                   <MovingBorderButton
                      borderRadius="1.75rem"
                      className="w-full bg-background dark:bg-slate-900 text-foreground dark:text-white border-neutral-200 dark:border-slate-800"
                    >
                      Send Message
                    </MovingBorderButton>
                    <MovingBorderButton
                      as={Link}
                      href="https://wa.me/919953414336"
                      target="_blank"
                      borderRadius="1.75rem"
                      className="w-full bg-background dark:bg-slate-900 text-foreground dark:text-white border-neutral-200 dark:border-slate-800"
                      containerClassName="w-full"
                    >
                      <WhatsAppIcon className="h-6 w-6 mr-2 fill-current" />
                        Message on WhatsApp
                    </MovingBorderButton>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="why-us" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Why Choose Delhi's Best Real Estate Company?</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              We provide a seamless, end-to-end experience, grounded in trust, transparency, and a commitment to quality.
            </p>
          </div>
          <Card className="max-w-4xl mx-auto p-6 md:p-10 shadow-lg">
            <div className="space-y-8">
              {whyChooseUsPoints.map((point, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <div className="bg-primary/10 p-4 rounded-full text-primary shrink-0">
                    <point.icon className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{point.title}</h3>
                    <p className="text-muted-foreground mt-1">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section id="faq" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
            <p className="mt-2 text-muted-foreground">
              Your questions about the best real estate and interior design company in Delhi, answered.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
    