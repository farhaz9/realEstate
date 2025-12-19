
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useUser, addDocumentNonBlocking, useDoc, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUp, Loader2, Minus, Plus, X, ArrowLeft, Info } from 'lucide-react';
import type { Property, User, AppSettings } from '@/types';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import ImageKit from 'imagekit-javascript';
import { useRouter, useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
    address: z.string().min(3, { message: 'Address is required.' }),
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

interface ImagePreview {
  url: string;
  name: string;
  size: number;
  file?: File;
}

export default function AddPropertyPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('id');
  const isEditMode = !!propertyId;
  
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const propertyToEditRef = useMemoFirebase(() => {
    if (!firestore || !propertyId) return null;
    return doc(firestore, 'properties', propertyId);
  }, [firestore, propertyId]);

  const { data: propertyToEdit, isLoading: isLoadingPropertyToEdit } = useDoc<Property>(propertyToEditRef);
  const { data: userProfile } = useDoc<User>(userDocRef);
  
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
    },
  });
  
  useEffect(() => {
    if (isEditMode && propertyToEdit) {
      if (propertyToEdit.userId !== user?.uid) {
        toast({ title: 'Unauthorized', description: 'You do not have permission to edit this property.', variant: 'destructive' });
        router.push('/settings?tab=listings');
        return;
      }
      form.reset({
        title: propertyToEdit.title ?? '',
        description: propertyToEdit.description ?? '',
        price: propertyToEdit.price ?? 0,
        listingType: propertyToEdit.listingType ?? 'sale',
        location: {
          address: propertyToEdit.location?.address ?? '',
          pincode: propertyToEdit.location?.pincode ?? '',
          state: propertyToEdit.location?.state ?? '',
        },
        contactNumber: propertyToEdit.contactNumber ?? '',
        whatsappNumber: propertyToEdit.whatsappNumber ?? '',
        propertyType: propertyToEdit.propertyType ?? '',
        bedrooms: propertyToEdit.bedrooms ?? 0,
        bathrooms: propertyToEdit.bathrooms ?? 0,
        squareYards: propertyToEdit.squareYards ?? 0,
        furnishing: propertyToEdit.furnishing ?? 'unfurnished',
        amenities: propertyToEdit.amenities?.join(', ') ?? '',
        overlooking: propertyToEdit.overlooking ?? '',
        ageOfConstruction: propertyToEdit.ageOfConstruction ?? '',
      });
      if (propertyToEdit.imageUrls) {
          setImagePreviews(propertyToEdit.imageUrls.map(url => ({ url, name: 'Existing Image', size: 0 })));
      }
    } else if (!isEditMode) {
      form.reset({
          title: 'Spacious 3BHK with Modern Amenities',
          description: 'A beautiful and well-maintained property in a prime location, perfect for families. Features include modular kitchen, ample sunlight, and 24/7 security.',
          price: 5000000,
          listingType: 'sale',
          location: { address: '123, Sunshine Apartments, Sector 18', pincode: '110001', state: 'Delhi' },
          contactNumber: '9876543210',
          whatsappNumber: '9876543210',
          propertyType: 'Apartment',
          bedrooms: 3,
          bathrooms: 2,
          squareYards: 200,
          furnishing: 'semi-furnished',
          overlooking: 'Park',
          ageOfConstruction: '1-5 years',
          amenities: 'Park, Gym, Reserved Parking'
      });
    }
  }, [isEditMode, propertyToEdit, form, user, router, toast]);

  useEffect(() => {
    if (!isEditMode && userProfile && userProfile.listingCredits === 0) {
      toast({
        title: "No Listing Credits",
        description: "Please purchase a listing credit to post a property.",
        variant: "destructive"
      });
      router.push('/settings?tab=listings');
    }
  }, [userProfile, router, toast, isEditMode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentImageCount = imagePreviews.length;
      const availableSlots = 3 - currentImageCount;

      if (availableSlots <= 0) {
        toast({
          title: "Image limit reached",
          description: "You can upload a maximum of 3 images.",
          variant: "destructive",
        });
        return;
      }
      
      const filesToProcess = Array.from(files).slice(0, availableSlots);
      const validFiles = filesToProcess.filter(file => file.size <= 1 * 1024 * 1024);
      
      if (validFiles.length < filesToProcess.length) {
        toast({
          title: "File Size Limit Exceeded",
          description: "Some images were not selected because they exceed the 1MB size limit.",
          variant: "destructive",
        })
      }
      
      if (files.length > availableSlots) {
        toast({
          title: "Image limit exceeded",
          description: `You can only add ${availableSlots} more image(s).`,
          variant: "destructive",
        });
      }

      if (validFiles.length === 0) return;

      const newPreviews: ImagePreview[] = validFiles.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        file: file,
      }));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImagePreview = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(data: PropertyFormValues) {
    if (!user || !userDocRef) {
      toast({ title: 'Authentication Error', description: 'Please log in to list a property.', variant: 'destructive' });
      router.push('/login');
      return;
    }
    
    setIsSubmitting(true);

    let uploadedImageUrls: string[] = imagePreviews.filter(p => !p.file).map(p => p.url);
    
    const filesToUpload = imagePreviews.filter(p => p.file);

    if (filesToUpload.length > 0) {
      try {
        const imagekit = new ImageKit({
            publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
            urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
            authenticationEndpoint: `${process.env.NEXT_PUBLIC_APP_URL}/api/imagekit/auth`
        });
        
        for (const preview of filesToUpload) {
          if (preview.file) {
            const authRes = await fetch('/api/imagekit/auth');
            if (!authRes.ok) {
              const errorBody = await authRes.json().catch(() => ({ message: 'Unknown authentication error' }));
              throw new Error(`Authentication failed: ${errorBody.message || authRes.statusText}`);
            }
            const authBody = await authRes.json();

            const uploadResult = await imagekit.upload({
              file: preview.file,
              fileName: preview.file.name,
              ...authBody,
              folder: "/delhi-estate-luxe",
            });
            uploadedImageUrls.push(uploadResult.url);
          }
        }

      } catch (error: any) {
        const errorMessage = error.message || (typeof error === 'string' ? error : JSON.stringify(error));
        toast({
          title: "Image Upload Failed",
          description: `There was a problem uploading your images. Details: ${errorMessage}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }
    
    const amenitiesArray = data.amenities ? data.amenities.split(',').map(a => a.trim()).filter(a => a) : [];
    const { images, ...restOfData } = data;
    
    const propertyData = {
      ...restOfData,
      amenities: amenitiesArray,
      imageUrls: uploadedImageUrls,
      price: isEditMode ? propertyToEdit?.price : data.price,
    };
    
    if (!data.overlooking) delete (propertyData as Partial<typeof propertyData>).overlooking;
    if (!data.ageOfConstruction) delete (propertyData as Partial<typeof propertyData>).ageOfConstruction;

    if (isEditMode && propertyToEditRef) {
      const finalData = { ...propertyToEdit, ...propertyData };
      setDocumentNonBlocking(propertyToEditRef, finalData, { merge: true });
      toast({ title: 'Property Updated!', description: `Your property has been successfully updated.`, variant: 'success' });
    } else {
      const propertiesCollection = collection(firestore, 'properties');
      const tier = 'premium';
      const isFeatured = true;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 90);

      const newPropertyData = {
          ...propertyData,
          userId: user.uid,
          dateListed: serverTimestamp(),
          isFeatured,
          listingTier: tier,
          expiresAt: expirationDate,
          status: 'approved' as const,
      };
      
      addDocumentNonBlocking(propertiesCollection, newPropertyData);
      updateDocumentNonBlocking(userDocRef, { listingCredits: increment(-1) });
      toast({ title: 'Property Listed!', description: `Your property has been successfully listed.`, variant: 'success' });
    }

    setIsSubmitting(false);
    router.push('/settings?tab=listings');
  }

  const NumberInputStepper = ({ field }: { field: any }) => {
    const value = field.value || 0;
    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => field.onChange(Math.max(0, value - 1))}
            >
                <Minus className="h-4 w-4" />
            </Button>
            <Input
                {...field}
                type="number"
                className="h-10 text-center font-bold text-lg"
                value={value}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
            />
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => field.onChange(value + 1)}
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
  };
  

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
            <Button asChild variant="ghost" className="mb-6 -ml-4">
                <Link href="/settings?tab=listings"><ArrowLeft className="mr-2 h-4 w-4"/> Back to My Listings</Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{isEditMode ? 'Edit Property' : 'List a New Property'}</CardTitle>
                    <CardDescription>
                        {isEditMode 
                            ? "Update the details of your property listing below."
                            : "Fill out the form below to get your property in front of thousands of potential buyers and renters."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditMode ? (
                        <Alert variant="destructive" className="mb-6">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Important</AlertTitle>
                            <AlertDescription>
                                Property price and images cannot be changed after the initial listing. Please ensure all other details are correct before submitting.
                            </AlertDescription>
                        </Alert>
                    ) : (
                       <Alert className="mb-6">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Please Note</AlertTitle>
                            <AlertDescription>
                                The price and images for your property cannot be changed after you submit the listing. Please fill these details carefully.
                            </AlertDescription>
                        </Alert>
                    )}
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                        
                        <div>
                            <h3 className="text-xl font-semibold border-b pb-3 mb-6">Property Images</h3>
                            <FormField
                            control={form.control}
                            name="images"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Upload Images (up to 3, 1MB max each)</FormLabel>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full h-24 border-dashed text-lg"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isEditMode}
                                    >
                                        <ImageUp className="mr-2 h-6 w-6" />
                                        Click to Select Images
                                    </Button>
                                <FormControl>
                                    <Input 
                                    type="file" 
                                    multiple
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={isSubmitting || imagePreviews.length >= 3 || isEditMode}
                                    />
                                </FormControl>
                                <FormDescription>
                                    {imagePreviews.length} / 3 selected.
                                </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                                    {imagePreviews.map((preview, index) => (
                                    <Card key={index} className="relative group overflow-hidden">
                                        <CardContent className="p-2 flex items-start gap-3">
                                        <Image
                                            src={preview.url}
                                            alt={`Preview ${index + 1}`}
                                            width={64}
                                            height={64}
                                            className="w-16 h-16 object-cover rounded-md aspect-square bg-muted"
                                        />
                                        <div className="flex-1 truncate pt-1">
                                            <p className="text-sm font-semibold truncate" title={preview.name}>{preview.name}</p>
                                            {preview.size > 0 && (
                                                <p className="text-xs text-muted-foreground">{(preview.size / 1024).toFixed(1)} KB</p>
                                            )}
                                        </div>
                                        {!isEditMode && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-1 right-1 h-7 w-7 rounded-full shrink-0"
                                                onClick={() => removeImagePreview(index)}
                                                disabled={isSubmitting}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                        </CardContent>
                                    </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold border-b pb-3 mb-6">Property Details</h3>

                            <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Property Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Luxury 3-BHK Apartment" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                            <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="mt-6">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Describe your property in detail..." rows={5} {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <div className="grid md:grid-cols-2 gap-8 mt-6">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price (in INR)</FormLabel>
                                        <FormControl>
                                        <Input type="number" placeholder="Enter amount" {...field} disabled={isSubmitting || isEditMode} />
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
                                            className="flex items-center space-x-4 pt-2"
                                            disabled={isSubmitting}
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
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold border-b pb-3 mb-6">Location</h3>
                            
                            <div className="grid md:grid-cols-3 gap-8">
                            <FormField
                                control={form.control}
                                name="location.address"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-3">
                                    <FormLabel>Full Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., 123, ABC Society, South Delhi" {...field} disabled={isSubmitting} />
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
                                        <Input placeholder="e.g., 110017" {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="location.state"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                    <FormLabel>State</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isSubmitting}>
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
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold border-b pb-3 mb-6">Contact Details</h3>
                            <div className="grid md:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="contactNumber"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Contact Number</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="e.g., 9876543210" {...field} disabled={isSubmitting} />
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
                                        <Input type="tel" placeholder="e.g., 9876543210" {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold border-b pb-3 mb-6">Features & Amenities</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-end">
                                <FormField
                                    control={form.control}
                                    name="bedrooms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bedrooms</FormLabel>
                                            <NumberInputStepper field={field} />
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
                                            <NumberInputStepper field={field} />
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
                                        <Input type="number" placeholder="e.g., 250" {...field} disabled={isSubmitting} />
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isSubmitting}>
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

                            <div className="grid md:grid-cols-2 gap-8 mt-6">
                            <FormField
                                control={form.control}
                                name="furnishing"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Furnishing</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
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
                                    <Input placeholder="e.g., Swimming Pool, Gym, Park" {...field} value={field.value ?? ''} />
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
                                    <Input placeholder="e.g., Park, Main Road" {...field} value={field.value ?? ''} disabled={isSubmitting} />
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
                                    <Input placeholder="e.g., 1-5 years" {...field} value={field.value ?? ''} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-8">
                            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting || form.formState.isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>
                                {isSubmitting || form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isSubmitting ? 'Submitting...' : (isEditMode ? 'Save Changes' : 'List My Property')}
                            </Button>
                        </div>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
