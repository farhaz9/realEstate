'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useUser, addDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Banknote, Loader2, Plus, Star, X } from 'lucide-react';
import type { Property } from '@/types';
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
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PropertyCard } from '@/components/property-card';
import Link from 'next/link';
import React, { useState } from 'react';
import Image from 'next/image';
import ImageKit from 'imagekit-javascript';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const propertyTypes = [
  "Apartment", "Villa", "Independent House", "Plot", "PG / Co-living", "Commercial"
];


const propertyFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  images: z.any().optional(),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  listingType: z.enum(['sale', 'rent'], { required_error: 'You must select a listing type.' }),
  location: z.object({
    address: z.string().min(10, { message: 'Full address is required.' }),
    pincode: z.string().regex(/^\d{6}$/, { message: 'Must be a 6-digit Indian pincode.' }),
    state: z.string().min(2, { message: 'State is required.' }),
  }),
  contactNumber: z.string().regex(/^[6-9]\d{9}$/, { message: 'Must be a valid 10-digit Indian mobile number.' }),
  whatsappNumber: z.string().regex(/^[6-9]\d{9}$/, { message: 'Must be a valid 10-digit Indian mobile number.' }),
  propertyType: z.string().min(2, { message: 'Property type is required.' }),
  bedrooms: z.coerce.number().int().min(0, { message: 'Bedrooms must be a non-negative number.' }),
  bathrooms: z.coerce.number().int().min(0, { message: 'Bathrooms must be a non-negative number.' }),
  squareYards: z.coerce.number().positive({ message: 'Square yards must be a positive number.' }),
  furnishing: z.enum(['unfurnished', 'semi-furnished', 'fully-furnished'], {
    required_error: 'Please select a furnishing status.',
  }),
  overlooking: z.string().optional(),
  ageOfConstruction: z.string().optional(),
  amenities: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export function MyPropertiesTab() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const userPropertiesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'properties'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: properties, isLoading: arePropertiesLoading } = useCollection<Property>(userPropertiesQuery);
  const hasListedProperty = properties && properties.length > 0;

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      listingType: 'sale',
      location: {
        address: '',
        pincode: '',
        state: '',
      },
      contactNumber: '',
      whatsappNumber: '',
      propertyType: '',
      bedrooms: 0,
      bathrooms: 0,
      squareYards: 0,
      furnishing: 'unfurnished',
      overlooking: '',
      ageOfConstruction: '',
      amenities: '',
      images: null,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      // Set the files to the form state
      const currentFiles = form.getValues('images') || [];
      const combinedFiles = [...Array.from(currentFiles), ...Array.from(files)];
      const dataTransfer = new DataTransfer();
      combinedFiles.forEach(file => dataTransfer.items.add(file));
      form.setValue('images', dataTransfer.files);
    }
  };

  const removeImagePreview = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    const currentFiles = form.getValues('images');
    if (currentFiles) {
        const newFiles = Array.from(currentFiles).filter((_, i) => i !== index);
        const dataTransfer = new DataTransfer();
        newFiles.forEach(file => dataTransfer.items.add(file));
        form.setValue('images', dataTransfer.files);
    }
  };

  async function onSubmit(data: PropertyFormValues) {
    if (!user || !firestore) {
      toast({ title: 'Error', description: 'User or database not available.', variant: 'destructive' });
      return;
    }
    
    setIsUploading(true);

    let uploadedImageUrls: string[] = [];
    const files = data.images as FileList | null;

    if (files && files.length > 0) {
      try {
        const authRes = await fetch('/api/imagekit/auth');
        const authBody = await authRes.json();

        if (!authRes.ok) {
            throw new Error(authBody.message || `Authentication failed with status: ${authRes.status}`);
        }
        
        const imagekit = new ImageKit({
            publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
            urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
            authenticationEndpoint: `${process.env.NEXT_PUBLIC_APP_URL}/api/imagekit/auth`
        });

        const uploadPromises = Array.from(files).map(file => {
          return imagekit.upload({
            file,
            fileName: file.name,
            ...authBody,
            folder: "/delhi-estate-luxe",
          });
        });

        const uploadResults = await Promise.all(uploadPromises);
        uploadedImageUrls = uploadResults.map(result => result.url);

      } catch (error: any) {
        console.error("Image upload failed:", error);
        toast({
          title: "Image Upload Failed",
          description: error.message || "There was a problem uploading your images. Please try again.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }
    }
    
    const propertiesCollection = collection(firestore, 'properties');
    const amenitiesArray = data.amenities ? data.amenities.split(',').map(a => a.trim()).filter(a => a) : [];
    const { images, ...restOfData } = data; // Exclude images from the data to be saved to Firestore.

    const propertyData = {
      ...restOfData,
      imageUrls: uploadedImageUrls,
      amenities: amenitiesArray,
      userId: user.uid,
      dateListed: serverTimestamp(),
      isFeatured: false,
    };

    if (!data.overlooking) delete (propertyData as Partial<typeof propertyData>).overlooking;
    if (!data.ageOfConstruction) delete (propertyData as Partial<typeof propertyData>).ageOfConstruction;

    addDocumentNonBlocking(propertiesCollection, propertyData);
    
    setIsUploading(false);

    toast({
      title: 'Property Listed!',
      description: 'Your property has been successfully listed.',
      variant: 'success',
    });

    form.reset();
    setImagePreviews([]);
  }

  const renderSubscriptionCard = () => (
    <Card className="max-w-lg mx-auto text-center">
      <CardHeader>
        <CardTitle>Unlock Unlimited Listings</CardTitle>
        <CardDescription>You've used your one free property listing.</CardDescription>
      </CardHeader>
      <CardContent>
        <Star className="h-12 w-12 text-yellow-400 mx-auto fill-yellow-400" />
        <p className="mt-4 text-muted-foreground">To continue listing more properties and gain premium features, please subscribe to our unlimited plan.</p>
      </CardContent>
      <CardFooter className="flex-col gap-2">
         <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full">Subscribe for ₹99</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Premium Subscription</AlertDialogTitle>
              <AlertDialogDescription>
                Gain lifetime access to unlimited property listings and premium support for a one-time payment.
              </AlertDialogDescription>
            </AlertDialogHeader>
             <Alert>
                <Banknote className="h-4 w-4" />
                <AlertTitle>One-Time Payment: ₹99</AlertTitle>
                <AlertDescription>
                 This is a single payment for lifetime access to unlimited listings. No recurring fees.
                </AlertDescription>
              </Alert>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled>Proceed to Payment</AlertDialogAction>
            </AlertDialogFooter>
             <p className="text-xs text-muted-foreground mt-2 text-center">Payment gateway integration is coming soon.</p>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );

  const renderAddPropertyForm = () => (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Your First Listing is Free!</CardTitle>
        <CardDescription>Fill in the details below to add your property to our listings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="images"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                  <FormLabel>Property Images</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      onBlur={onBlur}
                      name={name}
                      ref={ref}
                      className="h-auto"
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload one or more images for your property.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={src}
                      alt={`Preview ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-auto object-cover rounded-md aspect-square"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImagePreview(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}


            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Luxury 3-BHK Apartment" {...field} disabled={isUploading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your property in detail..." rows={5} {...field} disabled={isUploading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid md:grid-cols-3 gap-8">
              <FormField
                  control={form.control}
                  name="location.address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 123, ABC Society, South Delhi" {...field} disabled={isUploading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="location.pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 110017" {...field} disabled={isUploading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isUploading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isUploading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propertyTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
               <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="e.g., 9876543210" {...field} disabled={isUploading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="e.g., 9876543210" {...field} disabled={isUploading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (in INR)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter amount" {...field} disabled={isUploading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="listingType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Listing For</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4"
                        disabled={isUploading}
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="sale" />
                          </FormControl>
                          <FormLabel className="font-normal">Sale</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="rent" />
                          </FormControl>
                          <FormLabel className="font-normal">Rent</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-8">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} disabled={isUploading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} disabled={isUploading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="squareYards"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (sq. yards)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 250" {...field} disabled={isUploading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid md:grid-cols-2 gap-8">
               <FormField
                control={form.control}
                name="furnishing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Furnishing</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isUploading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select furnishing status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unfurnished">Unfurnished</SelectItem>
                        <SelectItem value="semi-furnished">Semi-furnished</SelectItem>
                        <SelectItem value="fully-furnished">Fully-furnished</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Swimming Pool, Gym, Park" {...field} disabled={isUploading} />
                    </FormControl>
                    <FormDescription>
                      Enter a comma-separated list of amenities.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="overlooking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overlooking (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Park, Main Road" {...field} value={field.value ?? ''} disabled={isUploading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ageOfConstruction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age of Construction (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1-5 years" {...field} value={field.value ?? ''} disabled={isUploading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isUploading || form.formState.isSubmitting}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isUploading ? 'Uploading Images...' : (form.formState.isSubmitting ? 'Submitting...' : 'List My Property')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderMyProperties = () => (
    <>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">Manage Your Listings</h2>
        <p className="text-muted-foreground mt-2">You have {properties?.length} active propert{properties?.length === 1 ? 'y' : 'ies'}.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties?.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
         <Card className="h-full flex items-center justify-center border-2 border-dashed bg-muted/50 hover:bg-muted/80 hover:border-primary transition-all cursor-pointer" onClick={() => form.reset()}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">List a New Property</h3>
              <p className="text-sm text-muted-foreground">Your next listing could be someone's dream home.</p>
            </CardContent>
          </Card>
      </div>
    </>
  );

  if (isUserLoading || arePropertiesLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (hasListedProperty) {
    // If the user has listed at least one property, show their properties and the "Add More" card.
    // The "Add More" card, when clicked, should reveal the form again or navigate,
    // but for now, we show the subscription card if they have one property.
    // The logic is: 1 free, then subscribe.
    return (
      <div className="space-y-8">
        {renderMyProperties()}
        <div className="mt-12">
          {renderSubscriptionCard()}
        </div>
      </div>
    );
  }

  // If the user has never listed a property, show the form.
  return renderAddPropertyForm();
}
