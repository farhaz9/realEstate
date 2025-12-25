'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
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
import { ImageUp, Loader2, Minus, Plus, X, ArrowLeft, Info, FileText, Banknote, Home, BedDouble, Bath, MapPin, Phone, Star, Building, Upload, Map, Eye, Check } from 'lucide-react';
import type { Property, User, AppSettings, Transaction } from '@/types';
import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import ImageKit from 'imagekit-javascript';
import { useRouter, useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Stepper, StepperItem, StepperIndicator, StepperSeparator, StepperTrigger, StepperTitle, StepperDescription } from '@/components/ui/stepper';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getAmenityIcon } from '@/lib/utils';
import { AnimatePresence, motion } from "framer-motion";


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

const steps = [
    { title: "Basics", fields: ["title", "description"], icon: FileText },
    { title: "Details", fields: ["price", "squareYards", "bedrooms", "bathrooms"], icon: Home },
    { title: "Location", fields: ["location.address", "location.pincode", "location.state", "contactNumber", "whatsappNumber"], icon: MapPin },
    { title: "Features", fields: ["listingType", "propertyType", "furnishing", "amenities", "overlooking", "ageOfConstruction"], icon: Star },
    { title: "Photos", fields: [], icon: Upload },
    { title: "Preview", icon: Eye },
];

function AddPropertyForm() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('id');
  const isEditMode = !!propertyId;
  const formRef = useRef<HTMLFormElement>(null);
  
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

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
  
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  
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

  async function handleFormSubmit(data: PropertyFormValues) {
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
      await setDocumentNonBlocking(propertyToEditRef, finalData, { merge: true });
    } else {
      const propertiesCollection = collection(firestore, 'properties');
      
      const isBusinessUser = !!(userProfile?.isVerified && userProfile.verifiedUntil && new Date(userProfile.verifiedUntil.seconds * 1000) > new Date());
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
      
      await addDocumentNonBlocking(propertiesCollection, newPropertyData);
      await updateDocumentNonBlocking(userDocRef, { listingCredits: increment(-1) });
    }

    setIsSubmitting(false);
    setShowSuccess(true);
    
    setTimeout(() => {
        if (isAdmin) {
            router.back();
        } else {
            router.push('/settings?tab=listings');
        }
    }, 2000);
  }
  
  const nextStep = async () => {
    let isValid = true;
    if (currentStep <= steps.length) {
        if(steps[currentStep - 1].fields) {
            isValid = await form.trigger(steps[currentStep - 1].fields as any);
        }
    }
    if (isValid) {
      if (currentStep < steps.length) {
        setDirection(1);
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // This is the final step, so submit the form.
        form.handleSubmit(handleFormSubmit)();
      }
    }
  };

  const prevStep = () => {
    if(currentStep > 1) {
        setDirection(-1);
        setCurrentStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackClick = () => {
    router.back();
  }
  
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const PreviewSection = () => {
    const formData = form.getValues();
    const squareFeet = formData.squareYards ? parseFloat(formData.squareYards) * 9 : 0;
    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>This is how your property listing will look to others.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold">{formData.title}</h2>
                        <p className="text-muted-foreground">{formData.location.address}</p>
                    </div>

                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                            {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                                <Image src={preview.url} alt={`Preview ${index + 1}`} fill className="object-cover" />
                            </div>
                            ))}
                        </div>
                    )}
                    
                    <Separator />

                    <div>
                        <h3 className="font-semibold text-lg mb-2">Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2"><Banknote className="w-4 h-4 text-primary"/>Price: {formatPrice(parseFloat(formData.price))}</div>
                            <div className="flex items-center gap-2"><Building className="w-4 h-4 text-primary"/>Area: {squareFeet.toLocaleString()} sqft</div>
                            <div className="flex items-center gap-2"><BedDouble className="w-4 h-4 text-primary"/>Bedrooms: {formData.bedrooms}</div>
                            <div className="flex items-center gap-2"><Bath className="w-4 h-4 text-primary"/>Bathrooms: {formData.bathrooms}</div>
                            <div className="flex items-center gap-2"><Home className="w-4 h-4 text-primary"/>Type: {formData.propertyType}</div>
                            <div className="flex items-center gap-2"><Star className="w-4 h-4 text-primary"/>Furnishing: <span className="capitalize">{formData.furnishing.replace('-', ' ')}</span></div>
                        </div>
                    </div>

                     {formData.amenities && (
                        <>
                        <Separator />
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Amenities</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {formData.amenities.split(',').map(a => a.trim()).filter(a => a).map(amenity => {
                                    const Icon = getAmenityIcon(amenity);
                                    return (
                                        <Badge key={amenity} variant="secondary" className="flex items-center gap-2">
                                            <Icon className="h-3 w-3" />
                                            {amenity}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                        </>
                    )}

                    <Separator />

                    <div>
                        <h3 className="font-semibold text-lg mb-2">Description</h3>
                        <p className="text-muted-foreground text-sm">{formData.description}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
  };
  
  if (showSuccess) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative flex h-32 w-32 items-center justify-center"
            >
                <motion.svg
                    className="absolute h-full w-full"
                    viewBox="0 0 100 100"
                    initial={{ strokeDasharray: "0, 283", stroke: "hsl(var(--primary))" }}
                    animate={{ strokeDasharray: "283, 283" }}
                    transition={{ duration: 0.6, ease: "easeInOut", delay: 0.2 }}
                >
                    <circle cx="50" cy="50" r="45" fill="none" strokeWidth="4" />
                </motion.svg>
                <motion.svg
                    className="absolute h-16 w-16"
                    viewBox="0 0 24 24"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.7 }}
                >
                    <path
                        d="M20 6L9 17L4 12"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </motion.svg>
            </motion.div>
            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.3 }}
                className="mt-4 text-xl font-semibold"
            >
                Property Listed!
            </motion.h2>
             <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.3 }}
                className="text-muted-foreground"
            >
                Redirecting you to your listings...
            </motion.p>
        </div>
    );
  }

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-6 -ml-4" onClick={handleBackClick}>
                <ArrowLeft className="mr-2 h-4 w-4"/> Back
            </Button>
            
            <Form {...form}>
            <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="space-y-12">
            
            <div className="mb-8">
                <Stepper value={currentStep}>
                  {steps.map((step, index) => {
                      const StepIcon = step.icon;
                      return (
                        <StepperItem key={index + 1} step={index + 1} className="[&:not(:last-child)]:flex-1">
                          <StepperTrigger asChild>
                            <div className="flex items-center gap-2 p-1 cursor-default">
                                <StepperIndicator>
                                    <StepIcon className="h-4 w-4" />
                                </StepperIndicator>
                                <div className="flex-col items-start hidden sm:flex">
                                    <StepperTitle>{step.title}</StepperTitle>
                                </div>
                            </div>
                          </StepperTrigger>
                          {index < steps.length - 1 && <StepperSeparator />}
                        </StepperItem>
                      )
                  })}
                </Stepper>
            </div>
               <div className="overflow-hidden relative">
                 <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                      key={currentStep}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.3 }}
                      className="w-full"
                    >
                    {currentStep === 1 && (
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3"><FileText className="text-primary"/> Basic Information</CardTitle>
                                <CardDescription>Start with the title and a compelling description of your property.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={form.control} name="title" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Property Title</FormLabel>
                                    <FormControl><Input placeholder="e.g., Luxury 3-BHK Apartment" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea placeholder="Describe your property in detail..." rows={5} {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>
                    )}
                     {currentStep === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3"><Home className="text-primary"/> Property Details</CardTitle>
                                <CardDescription>Provide essential details like price, size, and room count.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="price" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Price (in INR)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                        <Banknote className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input {...field} placeholder="Enter amount" type="text" inputMode="numeric" disabled={isEditMode && !isAdmin} className="pl-10" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                 <FormField control={form.control} name="squareYards" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Area (sq. yards)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                        <Map className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input {...field} placeholder="e.g., 250" type="text" inputMode="numeric" className="pl-10" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                 <FormField control={form.control} name="bedrooms" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Bedrooms</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                        <BedDouble className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input {...field} placeholder="e.g., 3" type="text" inputMode="numeric" className="pl-10" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="bathrooms" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Bathrooms</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                        <Bath className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input {...field} placeholder="e.g., 2" type="text" inputMode="numeric" className="pl-10" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>
                    )}
                     {currentStep === 3 && (
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3"><MapPin className="text-primary"/> Location & Contact</CardTitle>
                                <CardDescription>Help potential buyers find and contact you.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={form.control} name="location.address" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Address</FormLabel>
                                    <FormControl><Input placeholder="e.g., 123, ABC Society, South Delhi" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="location.pincode" render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Pincode</FormLabel>
                                        <FormControl><Input placeholder="e.g., 110017" {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="location.state" render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>State</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a state" /></SelectTrigger></FormControl>
                                            <SelectContent>{indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <Separator />
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="contactNumber" render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Contact Number</FormLabel>
                                        <FormControl><Input type="tel" placeholder="e.g., 9876543210" {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="whatsappNumber" render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>WhatsApp Number</FormLabel>
                                        <FormControl><Input type="tel" placeholder="e.g., 9876543210" {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                     {currentStep === 4 && (
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3"><Star className="text-primary"/> Features & Amenities</CardTitle>
                                <CardDescription>Highlight the unique features of your property.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={form.control} name="listingType" render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>Listing For</FormLabel>
                                    <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
                                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="sale" /></FormControl><FormLabel className="font-normal">Sale</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="rent" /></FormControl><FormLabel className="font-normal">Rent</FormLabel></FormItem>
                                    </RadioGroup></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="propertyType" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Property Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a property type" /></SelectTrigger></FormControl>
                                        <SelectContent>{propertyTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="furnishing" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Furnishing</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select furnishing status" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                        <SelectItem value="unfurnished">Unfurnished</SelectItem>
                                        <SelectItem value="semi-furnished">Semi-furnished</SelectItem>
                                        <SelectItem value="fully-furnished">Fully-furnished</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="amenities" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Amenities (Optional)</FormLabel>
                                    <FormControl><Input placeholder="e.g., Swimming Pool, Gym, Park" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormDescription>Comma-separated list.</FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="overlooking" render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Overlooking (Optional)</FormLabel>
                                        <FormControl><Input placeholder="e.g., Park, Main Road" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="ageOfConstruction" render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Age of Construction (Optional)</FormLabel>
                                        <FormControl><Input placeholder="e.g., 1-5 years" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {currentStep === 5 && (
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3"><Upload className="text-primary"/> Upload Photos</CardTitle>
                                <CardDescription>A picture is worth a thousand words. Upload up to 3 images.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               {isEditMode && !isAdmin && (
                                    <Alert variant="destructive" className="mb-6">
                                        <Info className="h-4 w-4" />
                                        <AlertTitle>Important</AlertTitle>
                                        <AlertDescription>Property images cannot be changed after the initial listing.</AlertDescription>
                                    </Alert>
                                )}
                                <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-muted" onClick={() => fileInputRef.current?.click()}>
                                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"><ImageUp className="h-6 w-6 text-primary" /></div>
                                    <p className="font-semibold">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, or GIF (max. 1MB each)</p>
                                </div>
                                <Input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" disabled={isSubmitting || imagePreviews.length >= 3 || (isEditMode && !isAdmin)} />
                                <FormDescription className="text-center mt-2">{imagePreviews.length} / 3 selected.</FormDescription>
                                
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                                        {imagePreviews.map((preview, index) => (
                                        <Card key={index} className="relative group overflow-hidden">
                                            <CardContent className="p-2 flex items-start gap-3">
                                            <Image src={preview.url} alt={`Preview ${index + 1}`} width={64} height={64} className="w-16 h-16 object-cover rounded-md aspect-square bg-muted" />
                                            <div className="flex-1 truncate pt-1">
                                                <p className="text-sm font-semibold truncate" title={preview.name}>{preview.name}</p>
                                                {preview.size > 0 && (<p className="text-xs text-muted-foreground">{(preview.size / 1024).toFixed(1)} KB</p>)}
                                            </div>
                                            {(!isEditMode || isAdmin) && (<Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 rounded-full shrink-0" onClick={() => removeImagePreview(index)} disabled={isSubmitting}><X className="h-4 w-4" /></Button>)}
                                            </CardContent>
                                        </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                     {currentStep === 6 && (
                        <PreviewSection />
                    )}
                    </motion.div>
                </AnimatePresence>
                </div>


                <div className="flex justify-between items-center pt-8">
                    <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1 || isSubmitting}>
                        Back
                    </Button>
                    <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                        {currentStep === steps.length ? (isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null) : null}
                        {currentStep === steps.length ? (isSubmitting ? 'Submitting...' : (isEditMode ? 'Save Changes' : 'List My Property')) : 'Next'}
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
