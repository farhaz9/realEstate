

'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection, addDocumentNonBlocking } from '@/firebase';
import { doc, arrayUnion, arrayRemove, updateDoc, collection, query, where, limit, serverTimestamp, increment } from 'firebase/firestore';
import type { Property, User, Lead } from '@/types';
import { Loader2, BedDouble, Bath, Building2, Check, Phone, Mail, ArrowLeft, Heart, Share2, Verified, Dumbbell, ParkingSquare, Wifi, Tv, Trees, Wind, Droplets, Utensils, Refrigerator, Image as ImageIcon, CalendarDays, Eye, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PopularPropertyCard } from '@/components/shared/popular-property-card';
import React, { useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useOnScroll } from '@/hooks/use-on-scroll';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

const amenityIcons: { [key: string]: React.ElementType } = {
  'gym': Dumbbell,
  'swimming pool': Droplets,
  'parking': ParkingSquare,
  'wifi': Wifi,
  'tv': Tv,
  'park': Trees,
  'air conditioning': Wind,
  'kitchen': Utensils,
  'refrigerator': Refrigerator,
};

const getAmenityIcon = (amenity: string) => {
  const normalizedAmenity = amenity.toLowerCase();
  // Find a matching key in our icon map
  const iconKey = Object.keys(amenityIcons).find(key => normalizedAmenity.includes(key));
  return iconKey ? amenityIcons[iconKey] : Building2; // Return a default icon if no match
};

function PropertyDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <Skeleton className="h-96 w-full rounded-t-lg" />
                        <div className="p-6 space-y-6">
                            <Skeleton className="h-8 w-1/4" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-5 w-1/2" />
                            <Separator />
                            <Skeleton className="h-8 w-1/3" />
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="lg:sticky top-24 h-fit">
                    <Card>
                        <CardHeader><Skeleton className="h-10 w-1/2" /></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}


export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { isScrollingUp } = useOnScroll(100);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const propertyRef = useMemoFirebase(() => {
    if (!firestore || !propertyId) return null;
    return doc(firestore, 'properties', propertyId);
  }, [firestore, propertyId]);

  useEffect(() => {
    if (propertyRef) {
      updateDoc(propertyRef, {
        viewCount: increment(1)
      }).catch(err => console.error("Failed to increment view count:", err));
    }
  }, [propertyRef]);

  const { data: property, isLoading, error } = useDoc<Property>(propertyRef);
  
  const ownerRef = useMemoFirebase(() => {
    if (!firestore || !property) return null;
    return doc(firestore, 'users', property.userId);
  }, [firestore, property]);
  
  const { data: owner } = useDoc<User>(ownerRef);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<User>(userDocRef);
  
  const relatedPropertiesQuery = useMemoFirebase(() => {
    if (!firestore || !property) return null;
    return query(
      collection(firestore, 'properties'),
      where('propertyType', '==', property.propertyType),
      limit(6) 
    );
  }, [firestore, property]);

  const { data: relatedPropertiesData } = useCollection<Property>(relatedPropertiesQuery);
  const relatedProperties = relatedPropertiesData?.filter(p => p.id !== propertyId);

  const isInWishlist = userProfile?.wishlist?.includes(propertyId) ?? false;
  
  const handleWishlistToggle = async () => {
    if (!user || !userDocRef || !propertyRef) {
      toast({ title: 'Please log in', description: 'You need to be logged in to manage your wishlist.', variant: 'destructive' });
      return;
    }
    
    const updateData = {
      wishlist: isInWishlist ? arrayRemove(propertyId) : arrayUnion(propertyId),
    };

    const propertyUpdate = {
        wishlistCount: increment(isInWishlist ? -1 : 1)
    };
    
    await updateDoc(userDocRef, updateData);
    await updateDoc(propertyRef, propertyUpdate);

    toast({
      title: isInWishlist ? 'Removed from Wishlist' : 'Added to Wishlist',
      description: `${property?.title} has been ${isInWishlist ? 'removed from' : 'added to'} your wishlist.`,
      variant: 'success',
    });
  };

  const createLead = (method: 'call' | 'whatsapp' | 'email') => {
    if (!user || !userProfile || !property || !owner) {
        toast({ title: 'Please log in', description: 'You need to be logged in to contact an agent.', variant: 'destructive' });
        router.push('/login');
        return false;
    }

    const leadsCollection = collection(firestore, 'leads');
    const newLead: Omit<Lead, 'id'> = {
        propertyId: property.id,
        propertyTitle: property.title,
        agentId: owner.id,
        agentName: owner.fullName,
        inquiringUserId: user.uid,
        inquiringUserName: userProfile.fullName,
        inquiringUserEmail: userProfile.email,
        inquiringUserPhone: userProfile.phone,
        leadDate: serverTimestamp(),
        contactMethod: method,
    };
    addDocumentNonBlocking(leadsCollection, newLead);
    toast({
        title: "Agent Notified",
        description: "The agent has been notified of your interest.",
        variant: "success"
    });
    return true;
  }

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>, method: 'call' | 'whatsapp') => {
      if (!createLead(method)) {
          e.preventDefault();
      }
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `Check out this property: ${property?.title}`,
          url: window.location.href,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
          console.error('Share failed:', error);
          toast({
            title: 'Share Failed',
            description: 'Could not share this property.',
            variant: 'destructive',
          });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link Copied!', description: 'Property link copied to your clipboard.' });
      } catch (error) {
        console.error('Copy failed:', error);
        toast({
          title: 'Copy Failed',
          description: 'Could not copy link to clipboard.',
          variant: 'destructive',
        });
      }
    }
  };

  if (isLoading) {
    return <PropertyDetailSkeleton />;
  }

  if (error || !property) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold">Property Not Found</h2>
        <p className="text-muted-foreground">We couldn't find the property you were looking for.</p>
        {error && <p className="text-destructive text-sm mt-2">{error.message}</p>}
        <Button asChild className="mt-4">
          <Link href="/properties">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Link>
        </Button>
      </div>
    );
  }

  const getImageUrl = (imgIdentifier: string | null) => {
    if (!imgIdentifier) return null;
    if (imgIdentifier.startsWith('http')) {
      return imgIdentifier;
    }
    const placeholder = PlaceHolderImages.find(p => p.id === imgIdentifier);
    return placeholder ? placeholder.imageUrl : null;
  }

  const imageUrls = property.imageUrls && property.imageUrls.length > 0 
    ? property.imageUrls.map(getImageUrl).filter(Boolean) as string[]
    : [PlaceHolderImages.find(p => p.id === 'default-property')?.imageUrl].filter(Boolean) as string[];

  const mainImage = imageUrls[currentImageIndex];

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

  const squareFeet = property.squareYards ? property.squareYards * 9 : 0;

  const keySpecs = [
    { label: 'Bedrooms', value: property.bedrooms, icon: BedDouble },
    { label: 'Bathrooms', value: property.bathrooms, icon: Bath },
    { label: 'Area (sq. ft.)', value: squareFeet ? `${squareFeet.toLocaleString()}`: 'N/A', icon: Building2 },
  ];
  
  const moreDetails = [
      { label: 'Bedrooms', value: `${property.bedrooms} BHK` },
      { label: 'Price Breakup', value: `${formatPrice(property.price)}`},
      { label: 'Address', value: `${property.location.address}, ${property.location.state}` },
      { label: 'Furnishing', value: property.furnishing?.replace('-', ' ') || 'N/A' },
      { label: 'Overlooking', value: property.overlooking || 'N/A' },
      { label: 'Age of Construction', value: property.ageOfConstruction || 'N/A' },
    ];

  const listingDate = property.dateListed?.toDate ? property.dateListed.toDate() : (property.dateListed ? new Date(property.dateListed) : null);
  const isOwnerVerified = owner?.verifiedUntil && owner.verifiedUntil.toDate() > new Date();

  return (
    <div className="bg-muted/40 pb-24 md:pb-8">
       <Button variant="ghost" size="icon" onClick={() => router.back()} className="fixed top-4 left-4 z-50 h-10 w-10 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="container mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-0">
                <div className="relative h-96 w-full bg-muted group/image">
                  {mainImage ? (
                    <Image src={mainImage} alt={property.title} data-ai-hint="property image" fill className="object-cover rounded-t-lg" priority />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted rounded-t-lg">
                      <ImageIcon className="h-24 w-24 text-gray-400" />
                    </div>
                  )}
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
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant={property.listingType === 'sale' ? 'default' : 'secondary'}>{property.listingType}</Badge>
                      <h1 className="mt-2 text-3xl font-bold">{property.title}</h1>
                      <p className="mt-1 text-muted-foreground">{property.location.address}, {property.location.state} - {property.location.pincode}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={handleWishlistToggle}>
                        <Heart className={cn("h-5 w-5", isInWishlist ? 'text-red-500 fill-red-500' : '')} />
                      </Button>
                       <Button variant="outline" size="icon" onClick={handleShare}>
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>{property.viewCount || 0} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span>{property.wishlistCount || 0} wishlists</span>
                    </div>
                  </div>


                  <Separator className="my-6" />
                  
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Key Specifications</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {keySpecs.map(spec => (
                        <div key={spec.label} className="flex items-center gap-3 p-3 rounded-md border bg-background">
                          <spec.icon className="h-6 w-6 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">{spec.label}</p>
                            <p className="font-semibold capitalize">{spec.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h2 className="text-2xl font-semibold mb-4">About this property</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{property.description}</p>
                  </div>
                  
                  {property.amenities && property.amenities.length > 0 && (
                    <>
                      <Separator className="my-6" />
                      <div>
                        <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
                          {property.amenities.map(amenity => {
                             const Icon = getAmenityIcon(amenity);
                             return (
                                <div key={amenity} className="flex items-center gap-3">
                                  <Icon className="h-6 w-6 text-primary" />
                                  <span className="capitalize">{amenity}</span>
                                </div>
                             )
                          })}
                        </div>
                      </div>
                    </>
                  )}

                </div>
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>More Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        {moreDetails.map(detail => (
                            <div key={detail.label} className="grid grid-cols-2">
                                <p className="font-medium text-muted-foreground">{detail.label}</p>
                                <p className="capitalize">{detail.value}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
          </div>
          {/* Sticky Sidebar */}
          <div className="lg:sticky top-24 h-fit">
            <Card className="overflow-hidden">
               <CardHeader className="bg-primary/5">
                 <p className="text-3xl font-bold text-primary">{formatPrice(property.price)}</p>
                 <p className="text-sm text-muted-foreground">Onwards</p>
               </CardHeader>
               <CardContent className="p-4 md:p-6">
                {owner && (
                  <div className="flex flex-col items-start gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border">
                        <AvatarImage src={owner.photoURL} alt={owner.fullName} />
                         <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                          {owner.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold text-lg">{owner.fullName}</h3>
                           {isOwnerVerified && <Verified className="h-5 w-5 text-blue-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{owner.category === 'real-estate-agent' ? 'Real Estate Agent' : 'Owner'}</p>
                      </div>
                    </div>
                     <Separator />
                     <div className="space-y-3 w-full">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${owner.email}`} className="text-primary hover:underline truncate">{owner.email}</a>
                        </div>
                         <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${owner.phone}`} className="text-primary hover:underline">{owner.phone}</a>
                        </div>
                     </div>
                     <Separator />
                     <div className="grid grid-cols-2 gap-3 w-full">
                        <Button asChild size="lg" className="w-full bg-primary/10 text-primary hover:bg-primary/20">
                            <a href={`tel:+91${property.contactNumber}`} onClick={(e) => handleContactClick(e, 'call')}>
                                <Phone className="mr-2 h-5 w-5" /> Call Agent
                            </a>
                        </Button>
                         <Button asChild size="lg" variant="outline" className="w-full bg-white text-foreground hover:bg-muted">
                             <a href={`https://wa.me/91${property.whatsappNumber}?text=${encodeURIComponent(`I'm interested in your property: ${property.title}`)}`} target="_blank" rel="noopener noreferrer" onClick={(e) => handleContactClick(e, 'whatsapp')}>
                                <WhatsAppIcon className="mr-2 h-6 w-6" /> WhatsApp
                            </a>
                        </Button>
                     </div>
                    {listingDate && (
                      <p className="text-xs text-muted-foreground text-center w-full pt-2">
                        Posted on {listingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                )}
               </CardContent>
            </Card>
          </div>
        </div>

        {relatedProperties && relatedProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8">Related Properties</h2>
             <Carousel
              opts={{
                align: 'start',
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {relatedProperties.map((relatedProperty) => (
                  <CarouselItem key={relatedProperty.id} className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pl-2 md:pl-4">
                     <div className="h-full">
                      <PopularPropertyCard property={relatedProperty} />
                     </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        )}
      </div>

       {/* Sticky Action Buttons for Mobile */}
      <div className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-t p-3 transition-transform duration-300",
        isScrollingUp ? "translate-y-0" : "translate-y-full"
      )}>
         <div className="grid grid-cols-2 gap-3 w-full">
            <Button asChild size="lg" className="w-full bg-primary/10 text-primary hover:bg-primary/20 h-12">
                <a href={`tel:+91${property.contactNumber}`} onClick={(e) => handleContactClick(e, 'call')} aria-label="Call Agent">
                    <Phone className="mr-2 h-5 w-5" /> Call
                </a>
            </Button>
            <Button asChild size="lg" className="w-full bg-green-500/10 text-green-600 hover:bg-green-500/20 h-12">
               <a href={`https://wa.me/91${property.whatsappNumber}?text=${encodeURIComponent(`I'm interested in your property: ${property.title}`)}`} target="_blank" onClick={(e) => handleContactClick(e, 'whatsapp')} aria-label="Contact on WhatsApp">
                <WhatsAppIcon className="mr-2 h-6 w-6" /> WhatsApp
              </a>
            </Button>
         </div>
      </div>

    </div>
  );
}
