'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, arrayUnion, arrayRemove, updateDoc, collection, query, where, limit } from 'firebase/firestore';
import type { Property, User } from '@/types';
import { Loader2, BedDouble, Bath, Building2, Check, Phone, Mail, ArrowLeft, Heart, Share2, MessageSquare, Verified, Dumbbell, ParkingSquare, Wifi, Tv, Trees, Wind, Droplets, Utensils, Refrigerator } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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
import React from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

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

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const propertyRef = useMemoFirebase(() => {
    if (!firestore || !propertyId) return null;
    return doc(firestore, 'properties', propertyId);
  }, [firestore, propertyId]);

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
    if (!user || !userDocRef) {
      toast({ title: 'Please log in', description: 'You need to be logged in to manage your wishlist.', variant: 'destructive' });
      return;
    }
    
    const updateData = {
      wishlist: isInWishlist ? arrayRemove(propertyId) : arrayUnion(propertyId),
    };
    
    await updateDoc(userDocRef, updateData);
    toast({
      title: isInWishlist ? 'Removed from Wishlist' : 'Added to Wishlist',
      description: `${property?.title} has been ${isInWishlist ? 'removed from' : 'added to'} your wishlist.`,
      variant: 'success',
    });
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out this property: ${property?.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link Copied!', description: 'Property link copied to your clipboard.' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
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

  const hasImages = property.imageUrls && property.imageUrls.length > 0;
  const mainImage = PlaceHolderImages.find(p => p.id === (hasImages ? property.imageUrls![0] : 'default-property'));


  const squareFeet = property.squareYards ? property.squareYards * 9 : 0;

  const keySpecs = [
    { label: 'Bedrooms', value: property.bedrooms, icon: BedDouble },
    { label: 'Bathrooms', value: property.bathrooms, icon: Bath },
    { label: 'Area (sq. ft.)', value: squareFeet ? `${squareFeet.toLocaleString()}`: 'N/A', icon: Building2 },
    { label: 'Property Type', value: property.propertyType, icon: Building2 },
    { label: 'Listing Type', value: property.listingType, icon: Badge },
  ];
  
  const moreDetails = [
      { label: 'Bedrooms', value: `${property.bedrooms} BHK` },
      { label: 'Price Breakup', value: `${formatPrice(property.price)}`},
      { label: 'Address', value: `${property.location.address}, ${property.location.state}` },
      { label: 'Furnishing', value: property.furnishing?.replace('-', ' ') || 'N/A' },
      { label: 'Overlooking', value: property.overlooking || 'N/A' },
      { label: 'Age of Construction', value: property.ageOfConstruction || 'N/A' },
    ];


  return (
    <div className="bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-0">
                <div className="relative h-96 w-full">
                  {mainImage && (
                    <Image src={mainImage.imageUrl} alt={property.title} data-ai-hint={mainImage.imageHint} fill className="object-cover rounded-t-lg" priority />
                  )}
                  <div className="absolute top-4 left-4">
                     <Button asChild variant="secondary" size="sm">
                       <Link href="/properties"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
                     </Button>
                  </div>
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
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16 border">
                      <AvatarImage src={owner.photoURL} alt={owner.fullName} />
                       <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {owner.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg">{owner.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{owner.category === 'real-estate-agent' ? 'Real Estate Agent' : 'Owner'}</p>
                    </div>
                  </div>
                )}
                 <div className="flex gap-2">
                    <Button className="w-full" asChild>
                      <Link href={`tel:${property.contactNumber}`}><Phone className="mr-2" /> Call</Link>
                    </Button>
                    <Button className="w-full bg-green-500 hover:bg-green-600" asChild>
                      <Link href={`https://wa.me/${property.whatsappNumber}`} target="_blank"><MessageSquare className="mr-2" /> WhatsApp</Link>
                    </Button>
                 </div>
               </CardContent>
                 <CardFooter className="p-2 bg-muted/50 justify-center">
                    <p className="text-xs text-muted-foreground text-center">Posted on {new Date(property.dateListed?.seconds * 1000).toLocaleDateString()}</p>
                </CardFooter>
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
    </div>
  );
}
