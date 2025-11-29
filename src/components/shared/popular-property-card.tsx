
import Image from "next/image";
import type { Property } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Camera, MapPin } from 'lucide-react';
import Link from 'next/link';

interface PopularPropertyCardProps {
  property: Property;
  className?: string;
}

export function PopularPropertyCard({ property, className }: PopularPropertyCardProps) {
  const imageUrl =
    property.imageUrls && property.imageUrls.length > 0 && typeof property.imageUrls[0] === 'string'
      ? property.imageUrls[0]
      : null;

  const imageCount = property.imageUrls?.length ?? 0;
  const squareFeet = property.squareYards ? property.squareYards * 9 : 0;

  return (
    <Link href={`/properties/${property.id}`} className="block group h-full">
        <div className="border rounded-lg overflow-hidden transition-shadow duration-300 group-hover:shadow-md h-full flex flex-col">
            <div className="relative h-40 bg-muted">
                {imageUrl && (
                    <Image
                        src={imageUrl}
                        alt={property.title}
                        data-ai-hint="property image"
                        fill
                        className="object-cover"
                    />
                )}
                {imageCount > 0 && (
                     <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white rounded-sm px-2 py-1 text-xs">
                        <Camera className="h-3 w-3" />
                        <span>{imageCount}</span>
                    </div>
                )}
            </div>
            <div className="p-4 bg-card flex-grow flex flex-col">
                <p className="font-semibold truncate">{`${property.bedrooms} BHK ${property.propertyType}`}</p>
                <p className="font-bold text-lg text-primary">{formatPrice(property.price)} {squareFeet ? `|` : ''} <span className="text-base font-medium text-muted-foreground">{squareFeet ? `${squareFeet.toLocaleString()} sqft` : ''}</span></p>
                <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground flex-grow">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="truncate">{property.location.address}</p>
                </div>
                <p className="text-sm font-medium mt-2">Ready to Move</p>
            </div>
        </div>
    </Link>
  );
}
