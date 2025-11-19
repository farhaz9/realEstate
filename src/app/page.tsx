
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building, Home as HomeIcon, Palette, Sparkles, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyCard } from "@/components/property-card";
import { properties, builders } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const faqs = [
  {
    question: "What types of properties do you specialize in?",
    answer: "We specialize in high-end luxury properties in Delhi, including apartments, villas, penthouses, and farmhouses in prime locations like South Delhi, Central Delhi, and Lutyens' Delhi."
  },
  {
    question: "Do you offer interior design services?",
    answer: "Yes, we offer bespoke interior design services to help you personalize your new home. Our team works with you to create a space that reflects your style and meets your needs."
  },
  {
    question: "How does the AI Property Finder work?",
    answer: "Our AI Property Finder uses advanced algorithms to analyze your preferences, such as price range, location, and desired amenities, to provide you with personalized property recommendations, saving you time and effort."
  },
  {
    question: "Can you assist with legal and financial processes?",
    answer: "Absolutely. We provide end-to-end assistance, including connecting you with trusted legal advisors and financial experts to ensure a smooth and transparent transaction process."
  }
];


export default function HomePage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-1");

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full h-[60vh] md:h-[80vh] text-white overflow-hidden">
        <video
          src="https://images-r-eal-estae.vercel.app/13470975_1920_1080_24fps.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute z-[-1] w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-purple-900/50 to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Best Real Estate Company in Delhi
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-neutral-200">
            Experience unparalleled luxury and elegance with our exclusive
            collection of premium properties.
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
              Best Real Estate Company in Delhi
            </span>
          </h2>
        </div>
      </section>

      <section id="featured-listings" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Featured Listings
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Handpicked properties that define luxury, comfort, and
              sophistication in the heart of Delhi.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.slice(0, 3).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link href="/properties">
                View All Properties
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="why-us" className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Why Choose Delhi Estate Luxe?</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              We offer a seamless and luxurious experience from discovery to possession.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <HomeIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Exclusive Portfolio</h3>
              <p className="mt-2 text-muted-foreground">Access to Delhi's most sought-after luxury homes.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Builder Partnerships</h3>
              <p className="mt-2 text-muted-foreground">Collaborations with top-tier builders ensuring quality.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Design Services</h3>
              <p className="mt-2 text-muted-foreground">Bespoke interior solutions to personalize your space.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered Search</h3>
              <p className="mt-2 text-muted-foreground">Find your perfect match with our smart recommendation tool.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="ai-recommender" className="py-16 md:py-24 bg-background">
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

      <section id="faq" className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
            <p className="mt-2 text-muted-foreground">
              Have questions? We have answers.
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

      <section id="contact" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Get In Touch</h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              We're here to help you find your dream property. Contact us today.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="grid grid-cols-1 gap-8">
              <div>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112173.39399844981!2d77.13962699316524!3d28.52735728109861!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce1a7145788c7%3A0x28af8763c3d82343!2sSouth%20Delhi%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1700052954881!5m2!1sen!2sin"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg shadow-lg"
                ></iframe>
              </div>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <Input placeholder="Your Name" />
                    <Input type="email" placeholder="Your Email" />
                    <Textarea placeholder="Your Message" rows={5} />
                    <Button type="submit" className="w-full">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="builders" className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Our Esteemed Partners
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              We collaborate with the most reputable builders in the industry to bring you unparalleled quality.
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
