
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { PageHero } from '@/components/shared/page-hero';

const propertyFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  listingType: z.enum(['sale', 'rent'], { required_error: 'You must select a listing type.' }),
  location: z.string().min(3, { message: 'Location is required.' }),
  propertyType: z.string().min(3, { message: 'Property type is required.' }),
  bedrooms: z.coerce.number().int().min(0, { message: 'Bedrooms must be a non-negative number.' }),
  bathrooms: z.coerce.number().int().min(0, { message: 'Bathrooms must be a non-negative number.' }),
  squareFootage: z.coerce.number().positive({ message: 'Square footage must be a positive number.' }),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export default function AddPropertyPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      listingType: 'sale',
      bedrooms: 0,
      bathrooms: 0,
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

    const propertiesCollection = collection(firestore, `users/${user.uid}/properties`);
    
    addDocumentNonBlocking(propertiesCollection, {
      ...data,
      userId: user.uid,
      dateListed: serverTimestamp(),
      isFeatured: false,
      imageUrls: [], 
      amenities: [],
    });

    toast({
      title: 'Property Listed!',
      description: 'Your property has been successfully listed.',
    });

    form.reset();
    router.push('/properties');
  }
  
  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
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
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter amount in INR" {...field} />
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

               <div className="grid md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location / Address</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., South Delhi" {...field} />
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
                          <Input placeholder="e.g., Apartment, Villa, Farmhouse" {...field} />
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
                  name="squareFootage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area (sq. ft.)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2200" {...field} />
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
    </>
  );
}
