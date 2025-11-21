
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Construction, DraftingCompass, Sparkles, Briefcase, ArrowRight, Lightbulb, PencilRuler, Handshake } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";

const services = [
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
    href: "#"
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
    href: "#"
  },
  {
    icon: Briefcase,
    title: "Consultancy",
    description: "Expert guidance on market trends, investment strategies, and legal processes for informed decision-making.",
    imageId: "service-consultancy",
    href: "#"
  },
];

const processSteps = [
  {
    icon: Lightbulb,
    title: "1. Consult & Plan",
    description: "We start by understanding your vision, requirements, and budget to create a tailored plan.",
  },
  {
    icon: PencilRuler,
    title: "2. Design & Build",
    description: "Our team of experts brings the plan to life with meticulous design, quality construction, and project management.",
  },
  {
    icon: Handshake,
    title: "3. Deliver & Support",
    description: "We ensure a seamless handover and provide ongoing support to guarantee your complete satisfaction.",
  },
];

export default function ServicesPage() {
  return (
    <div>
       <PageHero
        title="Services"
        subtitle="A complete suite of services from the best real estate and interior design company in Delhi."
        image={{
          id: "services-hero",
          imageHint: "construction site",
        }}
      />
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Our Approach</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              We follow a structured process to ensure excellence at every stage of your project.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {processSteps.map((step) => (
              <Card key={step.title} className="text-center p-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Explore Our Services</h2>
             <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              From finding the perfect property to designing your dream interior, we offer a comprehensive range of solutions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const serviceImage = PlaceHolderImages.find(p => p.id === service.imageId);
              return(
              <Card key={index} className="flex flex-col overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
                <CardHeader className="p-0 relative h-56">
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
    </div>
  );
}
