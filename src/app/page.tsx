

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
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { FeaturedProfessionals } from "@/components/shared/featured-professionals";
import { NewProjects } from "@/components/shared/new-projects";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


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
    question: "What fees does Falcon Homes charge?",
    answer: "Our fees vary depending on the service. For property sales, we charge a standard commission. For interior design, we offer project-based pricing. Please contact us for a detailed quote."
  },
  {
    question: "Can I list my property myself?",
    answer: "Absolutely! We provide a user-friendly platform for property owners to list their properties for free. We also offer premium listing services for enhanced visibility."
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
      <section className="relative w-full h-[80vh] md:h-[90vh] text-white overflow-hidden">
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
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Find your place in the world
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl text-neutral-200">
                The most comprehensive database of properties, exclusive listings, and top-rated agents in your area.
            </p>
            <div className="w-full max-w-2xl mt-8">
                 <HomeSearch />
            </div>
        </div>
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
                <Link href={service.href} key={service.label} className="flex flex-col items-center gap-2 text-center group flex-shrink-0 w-20 sm:w-24">
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
      
      <NewProjects />

      <FeaturedProperties />

       <section id="contact-faq" className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-1">
              <Card className="p-6 sm:p-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-3xl font-bold">Get in Touch</CardTitle>
                  <p className="text-muted-foreground">Interested in a property? Send us a message.</p>
                </CardHeader>
                <CardContent className="p-0">
                   <form className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input id="first-name" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input id="last-name" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john.doe@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="interest">I'm interested in...</Label>
                        <Select>
                            <SelectTrigger id="interest">
                                <SelectValue placeholder="Buying a Property" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="buy">Buying a Property</SelectItem>
                                <SelectItem value="rent">Renting a Property</SelectItem>
                                <SelectItem value="design">Interior Design Services</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Tell us how we can help..." rows={4} />
                    </div>
                    <UIButton type="submit" className="w-full !mt-6">Send Inquiry</UIButton>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">Frequently Asked Questions</h2>
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
          </div>
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

    </div>
  );
}
    
