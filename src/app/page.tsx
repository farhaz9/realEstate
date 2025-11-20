
import Link from "next/link";
import { ArrowRight, Building, Palette, Sparkles, Handshake, Construction, DraftingCompass, Briefcase, KeyRound, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyCard } from "@/components/property-card";
import { properties, builders } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const faqs = [
  {
    question: "What types of properties do you specialize in?",
    answer: "We specialize in high-end luxury properties in Delhi, including apartments, villas, penthouses, and farmhouses in prime locations like South Delhi, Central Delhi, and Lutyens' Delhi."
  },
  {
    question: "What does your consultancy service include?",
    answer: "Our consultancy services cover market analysis, investment strategy, legal guidance, and financial advice to ensure you make informed decisions in your real estate journey."
  },
  {
    question: "Do you offer construction and interior design services?",
    answer: "Yes, we provide end-to-end solutions, from bespoke construction and architectural design to personalized interiors and custom furniture, creating spaces that are uniquely yours."
  },
  {
    question: "How do you partner with builders?",
    answer: "We maintain strong partnerships with Delhi's top builders, giving our clients exclusive access to premium projects, quality assurance, and seamless execution from start to finish."
  }
];

const homeServices = [
  {
    icon: Building,
    title: "Properties",
    description: "Access a curated portfolio of Delhi's finest luxury properties, handpicked for quality, location, and value.",
    imageId: "service-properties",
    href: "/properties"
  },
  {
    icon: Construction,
    title: "Construction",
    description: "End-to-end construction services, managed with precision and a commitment to architectural excellence.",
    imageId: "service-construction",
    href: "/services"
  },
  {
    icon: DraftingCompass,
    title: "Interiors",
    description: "Bespoke interior design solutions that transform your space into a true reflection of your personal style.",
    imageId: "service-interiors",
    href: "/interiors"
  },
  {
    icon: Sparkles,
    title: "Miscellaneous",
    description: "Custom-crafted furniture, lighting, and finishing touches to complement your interiors and elevate your living experience.",
    imageId: "service-miscellaneous",
    href: "/services"
  },
  {
    icon: Briefcase,
    title: "Consultancy",
    description: "Expert guidance on market trends, investment strategies, and legal processes for informed decision-making.",
    imageId: "service-consultancy",
    href: "/services"
  },
];

const quickServices = [
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/services", label: "Rent", icon: KeyRound },
  { href: "/services", label: "Architect", icon: DraftingCompass },
  { href: "/services", label: "Collaboration", icon: Handshake },
  { href: "/services", label: "Construction", icon: Construction },
  { href: "/interiors", label: "Interiors", icon: Palette },
  { href: "/services", label: "Consultancy", icon: Briefcase },
];


export default function HomePage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full h-[60vh] md:h-[80vh] text-white overflow-hidden">
        <video
            src="https://images-r-eal-estae.vercel.app/farhazhomes.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Crafting Delhi's Finest Homes
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-neutral-200">
            Your trusted partner in luxury properties, bespoke interiors, and end-to-end real estate solutions.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/properties">
              Explore Properties <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent bg-[200%_auto] animate-gradient-pan">
              Delhi's Premier Real Estate Partner
            </span>
          </h2>
           <div className="mt-8 relative">
             <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4 hide-scrollbar">
              {quickServices.map((service) => (
                <Link href={service.href} key={service.label} className="flex flex-col items-center gap-2 text-center group flex-shrink-0 w-24">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-primary">
                    <service.icon className="h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">{service.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="featured-listings" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Featured Properties
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              A curated selection of Delhi’s most exclusive properties, combining luxury, comfort, and prime locations.
            </p>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent className="-ml-4 animate-carousel-nudge">
              {properties.slice(0, 6).map((property, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 pl-4">
                  <PropertyCard property={property} className="shadow-lg" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </section>
      
      <section id="services" className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Our Services</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              A complete suite of services to manage every aspect of your real estate journey, from vision to reality.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {homeServices.slice(0, 3).map((service) => {
              const serviceImage = PlaceHolderImages.find(p => p.id === service.imageId);
              return (
              <Card key={service.title} className="flex flex-col overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
                <CardHeader className="p-0 relative h-48">
                  {serviceImage && (
                    <Image
                      src={serviceImage.imageUrl}
                      alt={service.title}
                      data-ai-hint={serviceImage.imageHint}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </CardHeader>
                <CardContent className="flex-grow p-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                       <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </div>
                  <p className="text-muted-foreground flex-grow">{service.description}</p>
                   <Button asChild variant="link" className="p-0 h-auto justify-start mt-4">
                      <Link href={service.href}>
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                </CardContent>
              </Card>
            )})}
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 justify-center max-w-4xl mx-auto">
            {homeServices.slice(3, 5).map((service) => {
                const serviceImage = PlaceHolderImages.find(p => p.id === service.imageId);
                return (
                <Card key={service.title} className="flex flex-col overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
                  <CardHeader className="p-0 relative h-48">
                    {serviceImage && (
                      <Image
                        src={serviceImage.imageUrl}
                        alt={service.title}
                        data-ai-hint={serviceImage.imageHint}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                         <service.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                    </div>
                    <p className="text-muted-foreground flex-grow">{service.description}</p>
                    <Button asChild variant="link" className="p-0 h-auto justify-start mt-4">
                      <Link href={service.href}>
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )})}
          </div>
        </div>
      </section>

      <section id="contact-form" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Quick Inquiry</h2>
            <p className="mt-2 text-muted-foreground">Begin your journey with us. We're here to assist you.</p>
          </div>
          <Card>
            <CardContent className="p-6">
              <form className="space-y-4">
                <Input placeholder="Your Name" />
                <Input type="email" placeholder="Your Email" />
                <Input type="tel" placeholder="Your Phone Number" />
                <Textarea placeholder="Your Message" rows={5} />
                 <div className="flex flex-col sm:flex-row gap-4">
                    <Button type="submit" className="w-full">Send Message</Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="https://wa.me/910000000000" target="_blank">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 mr-2"><path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path><path fill="#fff" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"></path><path fill="#cfd8dc" d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z"></path><path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path><path fill="#fff" fillRule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clipRule="evenodd"></path></svg>
                        Message on WhatsApp
                      </Link>
                    </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="why-us" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Why Farhaz Homes?</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              We provide a seamless, end-to-end experience, grounded in trust, transparency, and a commitment to quality.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <Card className="p-6">
              <CardHeader className="p-0">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Curated Properties</CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                <p className="text-muted-foreground">Access to Delhi’s most sought-after luxury homes, vetted for quality and value.</p>
              </CardContent>
            </Card>
            <Card className="p-6">
               <CardHeader className="p-0">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Expert Guidance</CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                <p className="text-muted-foreground">Personalized consultancy and end-to-end support from our experienced team.</p>
              </CardContent>
            </Card>
            <Card className="p-6">
               <CardHeader className="p-0">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <Handshake className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Trusted Partnerships</CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                <p className="text-muted-foreground">Strong collaborations with top builders, ensuring premium quality and craftsmanship.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="ai-recommender" className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <Card className="bg-secondary text-secondary-foreground border-none overflow-hidden">
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-8 md:p-12">
                <Sparkles className="h-12 w-12 text-primary mb-4" />
                <h2 className="text-3xl font-bold">Let AI Find Your Perfect Home</h2>
                <p className="mt-4 text-muted-foreground">
                  Our advanced AI analyzes your preferences to suggest properties that are just right for you. Spend less time searching and more time dreaming.
                </p>
                <Button asChild size="lg" className="mt-6">
                  <Link href="/recommendations">
                    Get Recommendations
                  </Link>
                </Button>
              </div>
              <div className="h-64 md:h-full w-full relative">
                <Image
                  src="https://picsum.photos/seed/ai-rec/800/600"
                  alt="AI recommendation concept"
                  data-ai-hint="futuristic interface"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="faq" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
            <p className="mt-2 text-muted-foreground">
              Your questions, answered.
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

      <section id="builders" className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Our Builder Partners
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              We collaborate with the industry's most reputable builders to deliver homes of exceptional quality and design.
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {builders.slice(0, 5).map((builder) => {
              const builderImage = PlaceHolderImages.find(p => p.id === builder.logo);
              return (
                <div key={builder.id} className="grayscale hover:grayscale-0 transition-all duration-300">
                  {builderImage && (
                    <Image
                      src={builderImage.imageUrl}
                      alt={builder.name}
                      data-ai-hint={builderImage.imageHint}
                      width={140}
                      height={70}
                      className="object-contain"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

    