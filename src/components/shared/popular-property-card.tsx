
import Image from "next/image";
import type { Property } from "@/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { formatPrice } from "@/lib/utils";
import { Camera } from 'lucide-react';
import Link from 'next/link';

interface PopularPropertyCardProps {
  property: Property;
  className?: string;
}

export function PopularPropertyCard({ property, className }: PopularPropertyCardProps) {
  const propertyImage = PlaceHolderImages.find((p) => p.id === (property.imageUrls?.[0] || 'property-1'));
  const imageCount = property.imageUrls?.length ?? 0;

  return (
    <Link href="#" className="block group h-full">
        <div className="border rounded-lg overflow-hidden transition-shadow duration-300 group-hover:shadow-md h-full flex flex-col">
            <div className="relative h-40">
                {propertyImage && (
                    <Image
                        src={propertyImage.imageUrl}
                        alt={property.title}
                        data-ai-hint={propertyImage.imageHint}
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
                <p className="font-bold text-lg text-primary">{formatPrice(property.price)} | <span className="text-base font-medium text-muted-foreground">{property.squareFootage.toLocaleString()} sqft</span></p>
                <p className="text-sm text-muted-foreground truncate flex-grow">{property.location.address}</p>
                <p className="text-sm font-medium mt-2">Ready to Move</p>
            </div>
        </div>
    </Link>
  );
}
