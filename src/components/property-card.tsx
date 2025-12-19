import Image from "next/image";
import type { Property, User } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bath, BedDouble, Building2, Phone, Star, Trash2, Heart, Image as ImageIcon, MoreVertical, MessageSquare, Pencil, Info } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, deleteDocumentNonBlocking, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, arrayUnion, arrayRemove } from "firebase/firestore";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HighlightedText } from "./shared/highlighted-text";

interface PropertyCardProps {
  property: Property;
  className?: string;
  showActiveBadge?: boolean;
  searchTerm?: string;
}

export function PropertyCard({ property, className, showActiveBadge = false, searchTerm = '' }: PropertyCardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname.startsWith('/admin');

  const getImageUrl = () => {
    if (property.imageUrls && property.imageUrls.length > 0 && property.imageUrls[0]) {
      if (property.imageUrls[0].startsWith('http')) {
        return property.imageUrls[0];
      }
      const placeholder = PlaceHolderImages.find(p => p.id === property.imageUrls[0]);
      return placeholder?.imageUrl;
    }
    return PlaceHolderImages.find(p => p.id === 'default-property')?.imageUrl;
  }

  const imageUrl = getImageUrl();
    
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile } = useDoc<User>(userDocRef);

  const isOwner = user && user.uid === property.userId;
  const showManagementControls = isAdmin || isOwner;

  const isInWishlist = userProfile?.wishlist?.includes(property.id) ?? false;

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!firestore) return;
    const propertyRef = doc(firestore, "properties", property.id);
    deleteDocumentNonBlocking(propertyRef);
    toast({
      title: "Property Deleted",
      description: "The property listing has been successfully removed.",
      variant: "destructive",
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !userDocRef) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add properties to your wishlist.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    const updateData = {
      wishlist: isInWishlist ? arrayRemove(property.id) : arrayUnion(property.id)
    };

    updateDocumentNonBlocking(userDocRef, updateData);

    toast({
        title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
        description: `${property.title} has been ${isInWishlist ? 'removed from' : 'added to'} your wishlist.`,
        variant: "success",
    });
  };
  
  const handleEdit = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/admin/edit/${property.id}`);
  };

  const squareFeet = property.squareYards ? property.squareYards * 9 : 0;

  return (
    <div className={cn("rounded-2xl bg-card text-card-foreground border overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col", className)}>
      <Link href={`/properties/${property.id}`} className="block flex flex-col flex-grow">
        <div className="relative h-56 flex-shrink-0 bg-muted">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={property.title}
              data-ai-hint="property image"
              fill
              className="object-cover"
            />
          )}
           <div className="absolute top-4 left-4">
              <Badge variant="default" className="bg-primary text-primary-foreground font-bold uppercase text-xs">
                  {property.listingType}
              </Badge>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
              <h3 className="mt-1 text-lg font-semibold leading-tight truncate text-foreground">
                <HighlightedText text={property.title} highlight={searchTerm} />
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                <HighlightedText text={property.location.address} highlight={searchTerm} />
              </p>
            </div>
             <Badge variant="outline" className="capitalize shrink-0">
                <HighlightedText text={property.propertyType} highlight={searchTerm} />
            </Badge>
          </div>
          
          <div className="flex-grow mt-4" />

          <div className="flex items-center justify-between pt-4 mt-4 text-muted-foreground border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4" />
                  <span className="text-sm font-medium">{property.bedrooms ?? 0} Beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-4 w-4" />
                  <span className="text-sm font-medium">{property.bathrooms ?? 0} Baths</span>
                </div>
                {squareFeet > 0 && (
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm font-medium">{squareFeet.toLocaleString()} sqft</span>
                    </div>
                )}
              </div>
              <Button size="sm" variant="default" className="rounded-lg md:w-auto w-10 h-10 p-0 md:px-3 md:py-2 md:h-9">
                  <span className="hidden md:inline">View</span> <Info className="w-4 h-4 md:ml-2" />
              </Button>
          </div>
        </div>
      </Link>
    </div>
  );
}
