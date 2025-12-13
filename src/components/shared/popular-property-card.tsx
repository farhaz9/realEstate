
import Image from "next/image";
import type { Property } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Camera, MapPin, Image as ImageIcon, BedDouble, Bath, Building2 } from 'lucide-react';
import Link from 'next/link';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

interface PopularPropertyCardProps {
  property: Property;
  className?: string;
}

export function PopularPropertyCard({ property, className }: PopularPropertyCardProps) {
    const getImageUrl = () => {
    const firstImage = property.imageUrls && property.imageUrls.length > 0 ? property.imageUrls[0] : null;
    if (!firstImage) return null;

    if (firstImage.startsWith('http')) {
      return firstImage;
    }

    const placeholder = PlaceHolderImages.find(p => p.id === firstImage);
    return placeholder ? placeholder.imageUrl : null;
  }

  const imageUrl = getImageUrl();
  const imageCount = property.imageUrls?.length ?? 0;
  const squareFeet = property.squareYards ? property.squareYards * 9 : 0;

  return (
    <Link href={`/properties/${property.id}`} className="block group h-full">
        <div className="border bg-card text-card-foreground rounded-lg overflow-hidden transition-shadow duration-300 group-hover:shadow-lg h-full flex flex-col">
            <div className="relative h-48 bg-muted">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={property.title}
                        data-ai-hint="property image"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <ImageIcon className="h-10 w-10 text-gray-400" />
                    </div>
                )}
                 <div className="absolute top-3 left-3">
                    <Badge variant={property.listingType === 'sale' ? 'default' : 'secondary'} className="uppercase">
                        {property.listingType}
                    </Badge>
                 </div>
                {imageCount > 1 && (
                     <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white rounded-md px-2 py-1 text-xs">
                        <Camera className="h-3 w-3" />
                        <span>{imageCount}</span>
                    </div>
                )}
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                    <p className="font-bold text-lg text-primary">{formatPrice(property.price)}{property.listingType === 'rent' ? '/mo' : ''}</p>
                    <Badge variant="outline" className="capitalize text-primary border-primary/50">{property.propertyType}</Badge>
                </div>
                <p className="font-semibold truncate mt-1">{property.title}</p>
                <p className="text-sm text-muted-foreground truncate">{property.location.address}, {property.location.state}</p>
                
                <div className="mt-4 pt-4 border-t flex items-center space-x-4 text-muted-foreground text-sm">
                    <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4" />
                        <span>{property.bedrooms ?? 0} Beds</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms ?? 0} Baths</span>
                    </div>
                    {squareFeet > 0 && (
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>{squareFeet.toLocaleString()} sqft</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </Link>
  );
}
