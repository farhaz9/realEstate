
import Image from "next/image";
import type { Property, User } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bath, BedDouble, Building2, Phone, Star, Trash2, Heart } from "lucide-react";
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
import { WhatsAppIcon } from "./icons/whatsapp-icon";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const imageUrl =
    property.imageUrls && property.imageUrls.length > 0 && property.imageUrls[0]
      ? property.imageUrls[0]
      : "https://ik.imagekit.io/ei1qzvmub/default-property_Uj8gI7k3p.jpg";
    
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile } = useDoc<User>(userDocRef);

  const isOwner = user && user.uid === property.userId;
  const showDeleteButton = isOwner && (pathname === '/profile' || pathname === '/wishlist');

  const rating = 4.5 + (property.title.length % 5) / 10;

  const isInWishlist = userProfile?.wishlist?.includes(property.id) ?? false;

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!firestore) return;
    const propertyRef = doc(firestore, "properties", property.id);
    deleteDocumentNonBlocking(propertyRef);
    toast({
      title: "Property Deleted",
      description: "Your property listing has been successfully removed.",
      variant: "destructive",
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
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
  
  const handlePhoneClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    window.location.href = `tel:${property.contactNumber}`;
  };

  const handleWhatsAppClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    window.open(`https://wa.me/${property.whatsappNumber}`, '_blank');
  };

  const squareFeet = property.squareYards ? property.squareYards * 9 : 0;

  return (
     <Card className={cn("flex flex-col h-full overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1", className)}>
        <Link href={`/properties/${property.id}`} className="block">
            <div className="relative h-56 flex-shrink-0">
                <Image
                    src={imageUrl}
                    alt={property.title}
                    data-ai-hint="property image"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                    <div className="flex items-center gap-1 text-yellow-300 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{rating.toFixed(1)}</span>
                    </div>
                    <Badge variant={property.listingType === 'sale' ? 'default' : 'secondary'}>{property.listingType}</Badge>
                </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <p className="text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
                <CardTitle className="mt-2 text-xl font-semibold leading-tight">{property.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground flex-grow">{property.location.address}, {property.location.state} - {property.location.pincode}</p>

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
                    <span className="text-sm">{squareFeet ? `${squareFeet.toLocaleString()} sqft` : 'N/A'}</span>
                    </div>
                </div>
            </div>
        </Link>
      <CardFooter className="p-6 pt-0 mt-auto flex items-center gap-2">
          <Button asChild className="w-full">
            <Link href={`/properties/${property.id}`}>
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="icon" variant="outline" onClick={handlePhoneClick}>
            <Phone />
          </Button>
          <Button size="icon" variant="outline" onClick={handleWhatsAppClick}>
            <WhatsAppIcon className="h-6 w-6 text-green-600" />
          </Button>
           <Button size="icon" variant="ghost" className="rounded-full h-9 w-9" onClick={handleWishlistToggle}>
            <Heart className={cn("h-5 w-5", isInWishlist ? 'text-red-500 fill-red-500' : 'text-muted-foreground')} />
          </Button>
          {showDeleteButton && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                 <Button variant="outline" size="icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <Trash2 className="text-destructive"/>
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
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
    </Card>
  );
}
