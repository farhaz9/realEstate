
import Image from "next/image";
import type { Property, User } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bath, BedDouble, Building2, Phone, Star, Trash2, Heart, Image as ImageIcon, MoreVertical, MessageSquare, Pencil } from "lucide-react";
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

interface PropertyCardProps {
  property: Property;
  className?: string;
  showActiveBadge?: boolean;
}

export function PropertyCard({ property, className, showActiveBadge = false }: PropertyCardProps) {
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
    <div className={cn("rounded-2xl bg-gradient-to-br from-primary/80 to-purple-500/90 text-white overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 h-full flex flex-col", className)}>
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
              <Badge variant="default" className="bg-white/90 backdrop-blur-sm text-primary font-bold border-none uppercase text-xs">
                  {property.listingType}
              </Badge>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold text-white">{formatPrice(property.price)}</p>
              <h3 className="mt-1 text-lg font-semibold leading-tight truncate">{property.title}</h3>
              <p className="mt-0.5 text-sm text-neutral-200">{property.location.address}</p>
            </div>
             <Badge variant="outline" className="capitalize border-white/30 text-white bg-white/10 shrink-0">
                {property.propertyType}
            </Badge>
          </div>
          
          <div className="flex-grow mt-4" />

          <div className="flex items-center justify-between pt-4 mt-4 text-neutral-200 border-t border-white/20">
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
              <Button size="sm" className="text-primary bg-white hover:bg-neutral-100 rounded-lg">
                View Details <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
          </div>
        </div>
      </Link>
    </div>
  );
}
