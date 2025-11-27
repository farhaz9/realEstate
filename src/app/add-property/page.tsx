
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { useEffect, useState } from 'react';
import { PageHero } from '@/components/shared/page-hero';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Banknote, Loader2, Star } from 'lucide-react';
import type { Property } from '@/types';
import { ImageUploader } from '@/components/shared/image-uploader';

const propertyFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
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
  imageUrls: z.array(z.string()).min(1, { message: 'Please upload at least one image.' }),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export default function AddPropertyPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userPropertiesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'properties'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: userProperties, isLoading: isLoadingUserProperties } = useCollection<Property>(userPropertiesQuery);

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
      imageUrls: [],
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to list a property.",
        variant: "destructive",
      });
      router.push('/login');
    }
  }, [user, isUserLoading, router, toast]);

  function onSubmit(data: PropertyFormValues) {
    if (!user || !firestore) {
      toast({ title: 'Error', description: 'User or database not available.', variant: 'destructive' });
      return;
    }

    const propertiesCollection = collection(firestore, 'properties');
    
    addDocumentNonBlocking(propertiesCollection, {
      ...data,
      userId: user.uid,
      dateListed: serverTimestamp(),
      isFeatured: false,
      amenities: [],
    });

    toast({
      title: 'Property Listed!',
      description: 'Your property has been successfully listed.',
      variant: 'success',
    });

    form.reset();
    router.push('/my-properties');
  }
  
  const renderContent = () => {
    if (isUserLoading || isLoadingUserProperties) {
      return (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (userProperties && userProperties.length > 0) {
      return (
        <div className="container mx-auto px-4 py-16">
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
                    <AlertDialogCancel onClick={() => router.push('/')}>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled>Proceed to Payment</AlertDialogAction>
                  </AlertDialogFooter>
                   <p className="text-xs text-muted-foreground mt-2 text-center">Payment gateway integration is coming soon.</p>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="link" size="sm" onClick={() => router.push('/my-properties')}>
                View My Properties
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }
    
    return (
       <div className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Your First Listing is Free!</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="imageUrls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Images</FormLabel>
                      <FormControl>
                        <ImageUploader
                          value={field.value}
                          onChange={field.onChange}
                          folder="properties"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Luxury 3-BHK Apartment" {...field} />
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
                        <Textarea placeholder="Describe your property in detail..." rows={5} {...field} />
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
                            <Input placeholder="e.g., 123, ABC Society, South Delhi" {...field} />
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
                            <Input placeholder="e.g., 110017" {...field} />
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
                          <FormControl>
                            <Input placeholder="e.g., Delhi" {...field} />
                          </FormControl>
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
                          <FormControl>
                            <Input placeholder="e.g., Apartment, Villa, PG" {...field} />
                          </FormControl>
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
                            <Input type="tel" placeholder="e.g., 9876543210" {...field} />
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
                            <Input type="tel" placeholder="e.g., 9876543210" {...field} />
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
                          <Input type="number" placeholder="Enter amount" {...field} />
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
                          <Input type="number" min="0" {...field} />
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
                          <Input type="number" min="0" {...field} />
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
                          <Input type="number" placeholder="e.g., 250" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Submitting...' : 'List My Property'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageHero 
        title="List a Property"
        subtitle="Fill in the details below to add your property to our listings."
        image={{ id: 'properties-hero', imageHint: 'modern living room' }}
      />
      {renderContent()}
    </>
  );
}

    