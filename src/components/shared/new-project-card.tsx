
'use client';

import Image from "next/image";
import type { Property } from "@/types";
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

interface NewProjectCardProps {
  project: Property;
}

export function NewProjectCard({ project }: NewProjectCardProps) {
    const getImageUrl = () => {
    const firstImage = project.imageUrls && project.imageUrls.length > 0 ? project.imageUrls[0] : null;
    if (!firstImage) return "https://picsum.photos/seed/default/600/400";

    if (firstImage.startsWith('http')) {
      return firstImage;
    }

    const placeholder = PlaceHolderImages.find(p => p.id === firstImage);
    return placeholder ? placeholder.imageUrl : "https://picsum.photos/seed/default2/600/400";
  }

  const imageUrl = getImageUrl();

  const getStatus = () => {
      if (project.ageOfConstruction === '0-1 year') return "Launching Soon";
      if (project.listingType === 'sale') return "Now Selling";
      return "Last Few Units";
  }

  return (
    <Link href={`/properties/${project.id}`} className="block group">
        <div className="relative rounded-xl overflow-hidden h-72">
            <Image
                src={imageUrl}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                 <Badge variant="secondary" className="mb-2 bg-white/90 text-foreground backdrop-blur-sm">
                    {getStatus()}
                </Badge>
                <h3 className="font-bold text-lg">{project.title}</h3>
                <div className="flex items-center gap-1.5 text-sm mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location.address}, {project.location.state}</span>
                </div>
            </div>
        </div>
    </Link>
  );
}
