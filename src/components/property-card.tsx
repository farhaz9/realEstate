import Image from "next/image";
import type { Property } from "@/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bath, BedDouble, Building2, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, deleteDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const propertyImage = PlaceHolderImages.find((p) => p.id === (property.imageUrls?.[0] || 'property-1'));
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const pathname = usePathname();

  const isOwner = user && user.uid === property.userId;
  const showDeleteButton = isOwner && (pathname === '/my-properties' || pathname === '/profile');

  const handleDelete = () => {
    if (!firestore) return;
    const propertyRef = doc(firestore, "properties", property.id);
    deleteDocumentNonBlocking(propertyRef);
    toast({
      title: "Property Deleted",
      description: "Your property listing has been successfully removed.",
      variant: "destructive",
    });
  };

  return (
    <Card className={cn("flex flex-col h-full overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1", className)}>
      <CardHeader className="p-0 relative h-56 flex-shrink-0">
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
          <Badge variant={property.listingType === 'sale' ? 'default' : 'secondary'}>{property.listingType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6 flex flex-col">
        <p className="text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
        <CardTitle className="mt-2 text-xl font-semibold leading-tight">{property.title}</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground flex-grow">{property.location}</p>

        <div className="mt-4 flex items-center space-x-4 text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <BedDouble className="h-4 w-4" />
            <span className="text-sm">{property.bedrooms ?? 0} Beds</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4" />
            <span className="text-sm">{property.bathrooms ?? 0} Baths</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="text-sm">{property.squareFootage ? `${property.squareFootage.toLocaleString()} sqft` : 'N/A'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 mt-auto flex items-center gap-2">
        <Button className="w-full">
          View Details <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        {showDeleteButton && (
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your property listing from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}
