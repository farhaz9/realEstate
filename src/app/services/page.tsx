
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Construction, DraftingCompass, Sparkles, Briefcase, ArrowRight } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Our Services</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          A complete suite of services from the best real estate and interior design company in Delhi.
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
  );
}

    

