
'use client';

import Image from "next/image";
import type { Property, User } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bath, BedDouble, Building2, Phone, Star, Trash2, Heart, Image as ImageIcon, MoreVertical, MessageSquare, Pencil, Info, ChevronLeft, ChevronRight, Camera, Calendar, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, deleteDocumentNonBlocking, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, arrayUnion, arrayRemove, increment, updateDoc } from "firebase/firestore";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
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
import { useState } from "react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getImageUrl = (urlOrId: string | undefined) => {
    if (!urlOrId) return PlaceHolderImages.find(p => p.id === 'default-property')?.imageUrl;
    if (urlOrId.startsWith('http')) return urlOrId;
    
    const placeholder = PlaceHolderImages.find(p => p.id === urlOrId);
    return placeholder?.imageUrl || PlaceHolderImages.find(p => p.id === 'default-property')?.imageUrl;
  }

  const imageUrls = property.imageUrls && property.imageUrls.length > 0 
    ? property.imageUrls.map(getImageUrl).filter(Boolean) as string[]
    : [PlaceHolderImages.find(p => p.id === 'default-property')?.imageUrl].filter(Boolean) as string[];

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
  };
    
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile } = useDoc<User>(userDocRef);

  const isOwner = user && user.uid === property.userId;
  const showManagementControls = isOwner && pathname.startsWith('/settings');

  const isInWishlist = userProfile?.wishlist?.includes(property.id) ?? false;

  const handleDelete = (e: React.MouseEvent<HTMLDivElement>) => {
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
    router.push('/settings?tab=listings');
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
    
    const propertyRef = doc(firestore, 'properties', property.id);
    const propertyUpdate = {
        wishlistCount: increment(isInWishlist ? -1 : 1)
    };

    // Use non-blocking update for the user's wishlist
    updateDocumentNonBlocking(userDocRef, updateData);

    // Use blocking update for the property count to catch errors
    updateDoc(propertyRef, propertyUpdate)
      .then(() => {
        toast({
          title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
          description: `${property.title} has been ${isInWishlist ? 'removed from' : 'added to'} your wishlist.`,
          variant: "success",
        });
      })
      .catch(error => {
        // This is where we create and emit the contextual error
        const contextualError = new FirestorePermissionError({
            path: propertyRef.path,
            operation: 'update',
            requestResourceData: propertyUpdate
        });
        errorEmitter.emit('permission-error', contextualError);
      });
  };
  
  const handleEdit = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/add-property?id=${property.id}`);
  };

  const squareFeet = property.squareYards ? property.squareYards * 9 : 0;
  const dateListed = property.dateListed?.toDate ? property.dateListed.toDate() : null;
  const expiresAtDate = property.expiresAt?.toDate ? property.expiresAt.toDate() : null;
  const daysRemaining = expiresAtDate ? differenceInDays(expiresAtDate, new Date()) : null;


  return (
    <div className={cn("rounded-2xl bg-card text-card-foreground border overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col", className)}>
      <Link href={`/properties/${property.id}`} className="block flex flex-col flex-grow">
        <div className="relative h-56 flex-shrink-0 bg-muted group/image">
          {imageUrls.length > 0 && (
            <Image
              src={imageUrls[currentImageIndex]}
              alt={property.title}
              data-ai-hint="property image"
              fill
              className="object-cover"
              priority
            />
          )}
           <div className="absolute top-4 left-4 z-10">
              <Badge variant="default" className="bg-primary text-primary-foreground font-bold uppercase text-xs">
                  {property.listingType}
              </Badge>
          </div>
           <button
              onClick={handleWishlistToggle}
              className={cn(
                "absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors",
                isInWishlist && "text-red-500"
              )}
            >
              <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
            </button>
            
          {imageUrls.length > 1 && (
            <>
              <div className="absolute bottom-3 left-3 z-10 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {currentImageIndex + 1} / {imageUrls.length}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 text-white opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-black/50"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 text-white opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-black/50"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

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
               {dateListed && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Listed on {format(dateListed, "do MMM, yyyy")}</span>
                  <span className="text-muted-foreground/50">•</span>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{format(dateListed, "p")}</span>
                </div>
              )}
            </div>
             <Badge variant="outline" className="capitalize shrink-0">
                <HighlightedText text={property.propertyType} highlight={searchTerm} />
            </Badge>
          </div>
          
          <div className="flex-grow mt-4" />

          {showManagementControls && daysRemaining !== null && (
            <div className={cn(
                "mt-2 mb-2 p-2 rounded-md text-xs font-medium text-center",
                daysRemaining <= 0 ? "bg-red-100 text-red-800" :
                daysRemaining <= 7 ? "bg-amber-100 text-amber-800" :
                "bg-green-100 text-green-800"
            )}>
                {daysRemaining <= 0 ? "Listing Expired" : `Expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 mt-auto text-muted-foreground border-t">
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
               {showManagementControls ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.preventDefault()}>
                              <MoreVertical className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={handleEdit}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:bg-destructive/10">
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </div>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently delete your property listing. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                  <Button size="sm" variant="default" className="rounded-lg md:w-auto w-10 h-10 p-0 md:px-3 md:py-2 md:h-9">
                      <span className="hidden md:inline">View</span> <Info className="w-4 h-4 md:ml-2" />
                  </Button>
               )}
          </div>
        </div>
      </Link>
    </div>
  );
}
