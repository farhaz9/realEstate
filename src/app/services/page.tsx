
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Construction, DraftingCompass, Sparkles, Briefcase } from "lucide-react";

const services = [
  {
    icon: Building,
    title: "Properties",
    description: "Access a curated portfolio of Delhi's finest luxury properties, handpicked for quality, location, and value.",
  },
  {
    icon: Construction,
    title: "Construction",
    description: "End-to-end construction services, managed with precision and a commitment to architectural excellence.",
  },
  {
    icon: DraftingCompass,
    title: "Interiors",
    description: "Bespoke interior design solutions that transform your space into a true reflection of your personal style.",
  },
  {
    icon: Sparkles,
    title: "Miscellaneous",
    description: "Custom-crafted furniture, lighting, and finishing touches to complement your interiors and elevate your living experience.",
  },
  {
    icon: Briefcase,
    title: "Consultancy",
    description: "Expert guidance on market trends, investment strategies, and legal processes for informed decision-making.",
  },
];

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Our Services</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          A complete suite of services to manage every aspect of your real estate journey, from vision to reality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <Card key={index} className="text-center flex flex-col items-center p-6 hover:bg-secondary/50 transition-colors">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                <service.icon className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>{service.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

    