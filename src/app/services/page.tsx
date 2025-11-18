import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Gavel, Landmark, HandCoins } from "lucide-react";

const services = [
  {
    icon: Briefcase,
    title: "Property Management",
    description: "Comprehensive management services for your properties, ensuring they are well-maintained and profitable.",
  },
  {
    icon: Gavel,
    title: "Legal Assistance",
    description: "Expert legal guidance through every step of your real estate transactions, from contracts to closing.",
  },
  {
    icon: Landmark,
    title: "Financial Services",
    description: "Connect with our network of financial experts to secure the best loans and financing options for your purchase.",
  },
  {
    icon: HandCoins,
    title: "Vastu Consultancy",
    description: "Harmonize your new home with Vastu principles for a prosperous and positive living environment.",
  },
];

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Our Services</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Beyond finding your perfect property, we offer a range of services to make your real estate journey seamless.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
