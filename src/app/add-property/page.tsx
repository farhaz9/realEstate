
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
import { ImageUp, Loader2, Minus, Plus, X, ArrowLeft, Info, FileText, Banknote, Home, BedDouble, Bath, MapPin, Phone, Star } from 'lucide-react';
import type { Property, User, AppSettings, Transaction } from '@/types';
import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import ImageKit from 'imagekit-javascript';
import { useRouter, useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

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
  price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, { message: 'Price must be a positive number.' }),
  listingType: z.enum(['sale', 'rent'], { required_error: 'You must select a listing type.' }),
  location: z.object({
    address: z.string().min(3, { message: 'Address is required.' }),
    pincode: z.string().regex(/^\d{6}$/, { message: 'Must be a 6-digit Indian pincode.' }),
    state: z.string().min(2, { message: 'State is required.' }),
  }),
  contactNumber: z.string().regex(/^[6-9]\d{9}$/, { message: 'Must be a valid 10-digit Indian mobile number.' }),
  whatsappNumber: z.string().regex(/^[6-9]\d{9}$/, { message: 'Must be a valid 10-digit Indian mobile number.' }),
  propertyType: z.string().min(2, { message: 'Property type is required.' }),
  bedrooms: z.string().refine(val => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0, { message: 'Bedrooms must be a non-negative number.' }),
  bathrooms: z.string().refine(val => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0, { message: 'Bathrooms must be a non-negative number.' }),
  squareYards: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, { message: 'Square yards must be a positive number.' }),
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

const TOTAL_FORM_FIELDS = 13; // Number of fields we are tracking for completion

function AddPropertyForm() {
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
  const [progress, setProgress] = useState(0);
  
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
      price: '',
      listingType: 'sale',
      location: {
        address: '',
        pincode: '',
        state: '',
      },
      contactNumber: '',
      whatsappNumber: '',
      propertyType: '',
      bedrooms: '',
      bathrooms: '',
      squareYards: '',
      furnishing: 'unfurnished',
      overlooking: '',
      ageOfConstruction: '',
      amenities: '',
    },
  });
  
  const watchedFields = form.watch();
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;


  useEffect(() => {
    const filledFields = Object.values(watchedFields).filter(value => {
        if (typeof value === 'object' && value !== null) {
            return Object.values(value).some(v => v !== '' && v !== 0);
        }
        return value !== '' && value !== 0;
    }).length;

    const imageFilled = imagePreviews.length > 0;
    const totalFilled = filledFields + (imageFilled ? 1 : 0);
    
    // Adjust total fields for calculation if images are included in tracking
    const trackedFields = TOTAL_FORM_FIELDS + 1;

    setProgress((totalFilled / trackedFields) * 100);
  }, [watchedFields, imagePreviews]);
  
  useEffect(() => {
    if (isEditMode && propertyToEdit) {
      if (propertyToEdit.userId !== user?.uid && !isAdmin) {
        toast({ title: 'Unauthorized', description: 'You do not have permission to edit this property.', variant: 'destructive' });
        router.push('/settings?tab=listings');
        return;
      }
      form.reset({
        title: propertyToEdit.title ?? '',
        description: propertyToEdit.description ?? '',
        price: propertyToEdit.price?.toString() ?? '',
        listingType: propertyToEdit.listingType ?? 'sale',
        location: {
          address: propertyToEdit.location?.address ?? '',
          pincode: propertyToEdit.location?.pincode ?? '',
          state: propertyToEdit.location?.state ?? '',
        },
        contactNumber: propertyToEdit.contactNumber ?? '',
        whatsappNumber: propertyToEdit.whatsappNumber ?? '',
        propertyType: propertyToEdit.propertyType ?? '',
        bedrooms: propertyToEdit.bedrooms?.toString() ?? '',
        bathrooms: propertyToEdit.bathrooms?.toString() ?? '',
        squareYards: propertyToEdit.squareYards?.toString() ?? '',
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
          price: '5000000',
          listingType: 'sale',
          location: { address: '123, Sunshine Apartments, Sector 18', pincode: '110001', state: 'Delhi' },
          contactNumber: '9876543210',
          whatsappNumber: '9876543210',
          propertyType: 'Apartment',
          bedrooms: '3',
          bathrooms: '2',
          squareYards: '200',
          furnishing: 'semi-furnished',
          overlooking: 'Park',
          ageOfConstruction: '1-5 years',
          amenities: 'Park, Gym, Reserved Parking'
      });
    }
  }, [isEditMode, propertyToEdit, form, user, router, toast, isAdmin]);

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
  
  const hasPremiumPlan = useMemo(() => {
    if (!userProfile?.transactions) return false;
    // Check if any transaction description includes 'basic', 'pro', or 'business'
    const planLevels = ['basic', 'pro', 'business'];
    return userProfile.transactions.some((transaction: Transaction) => 
        planLevels.some(level => transaction.description?.toLowerCase().includes(level))
    );
  }, [userProfile]);


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
    
    const propertyData: Partial<Property> = {
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      listingType: data.listingType,
      location: data.location,
      contactNumber: data.contactNumber,
      whatsappNumber: data.whatsappNumber,
      propertyType: data.propertyType,
      bedrooms: parseInt(data.bedrooms, 10),
      bathrooms: parseInt(data.bathrooms, 10),
      squareYards: parseFloat(data.squareYards),
      furnishing: data.furnishing,
      amenities: amenitiesArray,
      imageUrls: uploadedImageUrls,
    };
    
    if (isEditMode) {
      propertyData.price = isAdmin ? parseFloat(data.price) : propertyToEdit?.price;
    }

    if (!data.overlooking) delete (propertyData as Partial<typeof propertyData>).overlooking;
    if (!data.ageOfConstruction) delete (propertyData as Partial<typeof propertyData>).ageOfConstruction;

    if (isEditMode && propertyToEditRef) {
      const finalData = { ...propertyToEdit, ...propertyData };
      setDocumentNonBlocking(propertyToEditRef, finalData, { merge: true });
      toast({ title: 'Property Updated!', description: `Your property has been successfully updated.`, variant: 'success' });
    } else {
      const propertiesCollection = collection(firestore, 'properties');
      
      const isBusinessUser = !!(userProfile?.isVerified && userProfile.verifiedUntil && userProfile.verifiedUntil.toDate() > new Date());
      const expirationDate = new Date();

      if (hasPremiumPlan) {
        expirationDate.setDate(expirationDate.getDate() + 30);
      } else {
        expirationDate.setDate(expirationDate.getDate() + 90);
      }
      
      const newPropertyData = {
          ...propertyData,
          userId: user.uid,
          dateListed: serverTimestamp(),
          listingTier: hasPremiumPlan ? 'premium' : 'free',
          expiresAt: expirationDate,
          status: 'approved' as const,
          isFeatured: isBusinessUser,
      };
      
      addDocumentNonBlocking(propertiesCollection, newPropertyData);
      updateDocumentNonBlocking(userDocRef, { listingCredits: increment(-1) });
      toast({ title: 'Property Listed!', description: `Your property has been successfully listed.`, variant: 'success' });
    }

    setIsSubmitting(false);
    
    if (isAdmin) {
        router.back();
    } else {
        router.push('/settings?tab=listings');
    }
  }

  const IconInput = ({ field, icon: Icon, placeholder, ...props }: { field: any, icon: React.ElementType, placeholder: string, [x:string]: any }) => (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <Input {...field} {...props} placeholder={placeholder} className="pl-10" />
    </div>
  );
  
  const step = Math.floor(progress / 33) + 1;

  const handleBackClick = () => {
    router.back();
  }

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
            {isAdmin ? (
                <Button variant="ghost" className="mb-6 -ml-4" onClick={handleBackClick}>
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
                </Button>
            ) : (
                <Button asChild variant="ghost" className="mb-6 -ml-4">
                    <Link href="/settings?tab=listings"><ArrowLeft className="mr-2 h-4 w-4"/> Back to My Listings</Link>
                </Button>
            )}
            
            <div className="mb-8">
                <p className="text-sm font-semibold text-primary">STEP {Math.min(step, 3)} OF 3</p>
                <h1 className="text-3xl font-bold mt-1">{isEditMode ? 'Edit Property' : 'List a New Property'}</h1>
                <Progress value={progress} className="mt-4 h-2" />
            </div>

            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3"><FileText className="text-primary"/> Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                            <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe your property in detail..." rows={5} {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3"><Home className="text-primary"/> Property Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price (in INR)</FormLabel>
                                    <FormControl>
                                      <IconInput field={field} icon={Banknote} placeholder="Enter amount" type="text" inputMode="numeric" disabled={isSubmitting || (isEditMode && !isAdmin)} />
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
                                      <IconInput field={field} icon={Home} placeholder="e.g., 250" type="text" inputMode="numeric" disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bedrooms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bedrooms</FormLabel>
                                        <FormControl>
                                          <IconInput field={field} icon={BedDouble} placeholder="e.g., 3" type="text" inputMode="numeric" disabled={isSubmitting} />
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
                                           <IconInput field={field} icon={Bath} placeholder="e.g., 2" type="text" inputMode="numeric" disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-3"><ImageUp className="text-primary"/> Photos</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {isEditMode && !isAdmin ? (
                            <Alert variant="destructive" className="mb-6">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Important</AlertTitle>
                                <AlertDescription>
                                    Property price and images cannot be changed after the initial listing.
                                </AlertDescription>
                            </Alert>
                        ) : !isEditMode && (
                           <Alert className="mb-6">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Please Note</AlertTitle>
                                <AlertDescription>
                                    The price and images for your property cannot be changed after you submit the listing.
                                </AlertDescription>
                            </Alert>
                        )}
                        <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                            <FormItem>
                                <div 
                                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-muted"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                        <ImageUp className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="font-semibold">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, or GIF (max. 1MB each)</p>
                                </div>
                            <FormControl>
                                <Input 
                                type="file" 
                                multiple
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                                disabled={isSubmitting || imagePreviews.length >= 3 || (isEditMode && !isAdmin)}
                                />
                            </FormControl>
                            <FormDescription className="text-center mt-2">
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
                                    {(!isEditMode || isAdmin) && (
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
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-3"><MapPin className="text-primary"/> Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="location.address"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Full Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 123, ABC Society, South Delhi" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        <div className="grid md:grid-cols-3 gap-6">
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-3"><Phone className="text-primary"/> Contact Details</CardTitle>
                    </CardHeader>
                     <CardContent className="grid md:grid-cols-2 gap-6">
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-3"><Star className="text-primary"/> Features & Amenities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                        <div className="grid md:grid-cols-2 gap-6">
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
                                Comma-separated list.
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
                    </CardContent>
                </Card>

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
        </div>
      </div>
    </div>
  );
}

export default function AddPropertyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddPropertyForm />
    </Suspense>
  );
}
