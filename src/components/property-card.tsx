import Image from "next/image";
import type { Property } from "@/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bath, BedDouble, Building2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const propertyImage = PlaceHolderImages.find((p) => p.id === property.image);

  return (
    <Card className={cn("flex flex-col overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1", className)}>
      <CardHeader className="p-0 relative h-56">
        {propertyImage && (
          <Image
            src={propertyImage.imageUrl}
            alt={property.title}
            data-ai-hint={propertyImage.imageHint}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute top-4 right-4">
          <Badge variant="secondary">{property.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6">
        <p className="text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
        <CardTitle className="mt-2 text-xl font-semibold leading-tight">{property.title}</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{property.location}</p>

        <div className="mt-4 flex items-center space-x-4 text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <BedDouble className="h-4 w-4" />
            <span className="text-sm">{property.beds} Beds</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4" />
            <span className="text-sm">{property.baths} Baths</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="text-sm">{property.area.toLocaleString()} sqft</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full">
          View Details <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
