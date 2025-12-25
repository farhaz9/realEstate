
import Link from "next/link";
import { ArrowRight, Building, Palette, Sparkles, Handshake, Construction, DraftingCompass, Briefcase, KeyRound, Building2, ConciergeBell, Verified, Headset, Wallet, Tag, Armchair, Send, Plus } from "lucide-react";
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
import { PricingSection } from "@/components/shared/pricing-section";
import { PropertySalesAnimation } from "@/components/lottie/property-sales-animation";
import { InteriorDesignAnimation } from "@/components/lottie/interior-design-animation";
import { ConstructionAnimation } from "@/components/lottie/construction-animation";


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
    question: "What fees does Falcon Estates charge?",
    answer: "Our fees vary depending on the service. For property sales, we charge a standard commission. For interior design, we offer project-based pricing. Please contact us for a detailed quote."
  },
  {
    question: "Can I list my property myself?",
    answer: "Absolutely! We provide a user-friendly platform for property owners to list their properties for free. We also offer premium listing services for enhanced visibility."
  }
];

const coreServices = [
  {
    icon: Handshake,
    title: "Property Sales",
    description: "Whether buying or selling, our expert agents guide you through market analysis, listings, and closing the best deal.",
    href: "/properties",
    animation: <PropertySalesAnimation />,
  },
  {
    icon: DraftingCompass,
    title: "Construction",
    description: "From ground-up development to renovations, we manage construction projects with precision and quality assurance.",
    href: "/construction",
    animation: <ConstructionAnimation />,
  },
  {
    icon: Armchair,
    title: "Interior Design",
    description: "Transform your space with our curated network of top-rated interior designers tailored to your style.",
    href: "/interiors",
    animation: <InteriorDesignAnimation />,
  },
];

const quickServices = [
    { href: "/properties?type=buy", label: "Buy", icon: Building2, iconColor: "text-green-600", bgColor: "bg-green-100/60" },
    { href: "/properties?type=rent", label: "Rent", icon: KeyRound, iconColor: "text-blue-600", bgColor: "bg-blue-100/60" },
    { href: "/properties?type=sell", label: "Sell", icon: Tag, iconColor: "text-orange-600", bgColor: "bg-orange-100/60" },
    { href: "/interiors", label: "Interiors", icon: Palette, iconColor: "text-purple-600", bgColor: "bg-purple-100/60" },
  ];

const whyChooseUsPoints = [
  {
    icon: Verified,
    title: "Verified Listings",
    description: "Every property is physically verified by our team to ensure authenticity.",
  },
  {
    icon: Headset,
    title: "Expert Support",
    description: "24/7 dedicated support from certified real estate professionals.",
  },
  {
    icon: Wallet,
    title: "Transparent Pricing",
    description: "No hidden fees or surprise charges. What you see is what you pay.",
  },
];

const whyChooseUsImages = [
  { id: 'why-us-1', hint: 'modern building facade' },
  { id: 'why-us-2', hint: 'business handshake' },
  { id: 'why-us-3', hint: 'person reviewing blueprints' },
  { id: 'why-us-4', hint: 'living room furniture' }
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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

      <section className="py-12 bg-background overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            Quick Actions
          </p>
          <div className="relative">
            <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:justify-center">
              <div className="flex flex-nowrap sm:justify-center gap-x-4 sm:gap-x-8">
                {quickServices.map((service) => (
                  <Link href={service.href} key={service.label} className="flex flex-col items-center gap-3 text-center group flex-shrink-0 w-20 sm:w-24 snap-center">
                    <div className={`flex h-20 w-20 items-center justify-center rounded-full ${service.bgColor} group-hover:scale-105 transition-all duration-300`}>
                      <service.icon className={`h-10 w-10 ${service.iconColor} transition-colors`} />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground transition-colors group-hover:text-primary">{service.label}</p>
                  </Link>
                ))}
              </div>
            </div>
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none sm:hidden" />
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
          </div>
        </div>
      </section>
      
      <section className="pb-8 bg-background">
        <div className="container mx-auto px-4">
            <div className="text-center">
                <UIButton asChild className="h-14 mt-4 w-full max-w-sm mx-auto text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 group flex items-center justify-center relative md:hidden">
                    <Link href="/add-property">
                        <Plus className="mr-2 h-5 w-5" />
                        Post Property
                        <div className="absolute right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                          Free
                        </div>
                    </Link>
                </UIButton>
                 <UIButton asChild className="h-14 mt-4 w-full max-w-sm mx-auto text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 group items-center justify-center relative hidden md:flex">
                    <Link href="/add-property">
                        <Plus className="mr-2 h-5 w-5" />
                        Post Property
                        <div className="absolute right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                          Free
                        </div>
                    </Link>
                </UIButton>
            </div>
        </div>
      </section>

      <section id="offers" className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest">What we offer</p>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Our Core Services</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions for every step of your real estate journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {coreServices.map((service) => (
              <Card key={service.title} className="flex flex-col text-center items-center p-6 h-full group transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 bg-background border-transparent hover:border-primary/20">
                 <div className="w-full h-40 mb-4">
                    {service.animation ? service.animation : <service.icon className="h-full w-full text-primary transition-colors" />}
                </div>
                <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                <p className="text-muted-foreground text-sm flex-grow mb-6">{service.description}</p>
                <UIButton asChild className="mt-auto px-6 font-bold h-11 text-base group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                  <Link href={service.href}>
                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
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
      
      <PricingSection />

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
                    <UIButton type="submit" className="w-full !mt-6">
                      <Send className="mr-2 h-4 w-4" /> Send Inquiry
                    </UIButton>
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Why Choose Falcon Estates?</h2>
              <p className="mt-4 text-muted-foreground max-w-xl">
                We are redefining the real estate experience by combining technology with human expertise.
              </p>
              <div className="mt-8 space-y-6">
                {whyChooseUsPoints.map((point) => (
                  <div key={point.title} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      <point.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{point.title}</h3>
                      <p className="mt-1 text-muted-foreground">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {whyChooseUsImages.map((img, index) => {
                    const image = PlaceHolderImages.find(p => p.id === img.id);
                    return (
                        <div key={img.id} className={`rounded-xl overflow-hidden ${index === 0 ? 'row-span-1' : ''} ${index === 1 ? 'row-span-2' : ''} ${index === 2 ? 'row-span-2' : ''} ${index === 3 ? 'row-span-1' : ''}`}>
                             {image && (
                                <Image
                                    src={image.imageUrl}
                                    alt={image.description}
                                    data-ai-hint={image.imageHint}
                                    width={400}
                                    height={400}
                                    className="object-cover w-full h-full"
                                />
                             )}
                        </div>
                    )
                })}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
