
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
import { useFirestore, useUser, addDocumentNonBlocking, useCollection, useMemoFirebase, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, query, where, doc, arrayUnion, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Banknote, ExternalLink, ImageUp, Loader2, Plus, Star, X, Zap, CheckCircle2, ArrowRight, FileText, Minus, Gem, Building } from 'lucide-react';
import type { Property, User, AppSettings } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PropertyCard } from '@/components/property-card';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import ImageKit from 'imagekit-javascript';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { Separator } from '../ui/separator';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { BoostReachCard } from '../shared/boost-reach-card';

declare const Razorpay: any;

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
}

export interface PropertyFormProps {
  propertyToEdit?: Property | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  isOpen: boolean;
}

const defaultFormData: Partial<PropertyFormValues> = {
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
};

export function PropertyForm({ propertyToEdit, onSuccess, onCancel, isOpen }: PropertyFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const appSettingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'app_settings', 'config');
  }, [firestore]);

  const { data: appSettings } = useDoc<AppSettings>(appSettingsRef);
  
  const isEditing = !!propertyToEdit;
  const listingValidityDays = appSettings?.listingValidityDays ?? 90;

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: isEditing ? {} : defaultFormData
  });

  useEffect(() => {
    if (isEditing && propertyToEdit) {
      form.reset({
        title: propertyToEdit.title,
        description: propertyToEdit.description,
        price: propertyToEdit.price,
        listingType: propertyToEdit.listingType,
        location: {
          address: propertyToEdit.location.address,
          pincode: propertyToEdit.location.pincode,
          state: propertyToEdit.location.state,
        },
        contactNumber: propertyToEdit.contactNumber,
        whatsappNumber: propertyToEdit.whatsappNumber,
        propertyType: propertyToEdit.propertyType,
        bedrooms: propertyToEdit.bedrooms,
        bathrooms: propertyToEdit.bathrooms,
        squareYards: propertyToEdit.squareYards,
        furnishing: propertyToEdit.furnishing || 'unfurnished',
        overlooking: propertyToEdit.overlooking || '',
        ageOfConstruction: propertyToEdit.ageOfConstruction || '',
        amenities: propertyToEdit.amenities?.join(', ') || '',
      });
      setImagePreviews(propertyToEdit.imageUrls?.map(url => ({ url, name: 'Uploaded Image', size: 0 })) || []);
    } else { 
        form.reset(defaultFormData);
        setImagePreviews([]);
    }
  }, [isEditing, propertyToEdit, form, isOpen]);


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
      }));
      setImagePreviews(prev => [...prev, ...newPreviews]);

      const currentFiles = form.getValues('images') || [];
      const combinedFiles = [...Array.from(currentFiles), ...validFiles];
      const dataTransfer = new DataTransfer();
      combinedFiles.forEach(file => dataTransfer.items.add(file));
      form.setValue('images', dataTransfer.files, { shouldValidate: true });
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
    if ((!user && !isEditing) || !firestore) {
      toast({ title: 'Error', description: 'User or database not available.', variant: 'destructive' });
      return;
    }
    
    setIsUploading(true);

    let uploadedImageUrls: string[] = isEditing ? imagePreviews.filter(p => p.url.startsWith('http')).map(p => p.url) : [];
    
    const filesToUpload = imagePreviews.filter(p => p.url.startsWith('blob:'));


    if (filesToUpload.length > 0) {
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
        
        const fileList = form.getValues('images') as FileList | null;
        
        const uploadPromises = filesToUpload.map(async (preview) => {
            if (fileList) {
                const file = Array.from(fileList).find(f => f.name === preview.name && f.size === preview.size);
                if (file) {
                    return imagekit.upload({
                        file,
                        fileName: file.name,
                        ...authBody,
                        folder: "/delhi-estate-luxe",
                    });
                }
            }
            return null;
        });

        const uploadResults = await Promise.all(uploadPromises);
        const newUrls = uploadResults.filter(r => r).map(result => result!.url);
        uploadedImageUrls = [...uploadedImageUrls, ...newUrls];

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
    
    
    const amenitiesArray = data.amenities ? data.amenities.split(',').map(a => a.trim()).filter(a => a) : [];
    const { images, ...restOfData } = data;
    
    const propertyData = {
      ...restOfData,
      status: 'approved' as const,
      imageUrls: uploadedImageUrls,
      amenities: amenitiesArray,
    };
    
    if (!data.overlooking) delete (propertyData as Partial<typeof propertyData>).overlooking;
    if (!data.ageOfConstruction) delete (propertyData as Partial<typeof propertyData>).ageOfConstruction;

    if (isEditing && propertyToEdit) {
      const propertyRef = doc(firestore, 'properties', propertyToEdit.id);
      updateDocumentNonBlocking(propertyRef, propertyData);
      toast({ title: 'Property Updated!', description: 'Your property has been successfully updated.', variant: 'success' });
    } else if(user && userDocRef) {
      const propertiesCollection = collection(firestore, 'properties');
      const tier = 'premium';
      const isFeatured = true;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + listingValidityDays);

      const newPropertyData = {
        ...propertyData,
        userId: user.uid,
        dateListed: serverTimestamp(),
        isFeatured,
        listingTier: tier,
        expiresAt: expirationDate,
      };
      
      addDocumentNonBlocking(propertiesCollection, newPropertyData);
      updateDocumentNonBlocking(userDocRef, { listingCredits: increment(-1) });
      toast({ title: 'Property Listed!', description: `Your property has been successfully listed.`, variant: 'success' });
    }

    setIsUploading(false);
    if(onSuccess) {
      onSuccess();
    }
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
  
  const handleOpenChange = (open: boolean) => {
    if (!open && onCancel) {
      onCancel();
    }
  }

  return (
     <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Property" : "Add a New Property"}</DialogTitle>
              <DialogDescription>Fill in the details below to {isEditing ? 'update your property' : 'add your property to our listings'}.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    <h3 className="text-lg font-semibold border-b pb-2">Property Images</h3>
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Upload Images (up to 3, 1MB max each)</FormLabel>
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="w-full"
                                onClick={() => fileInputRef.current?.click()}>
                                <ImageUp className="mr-2 h-4 w-4" />
                                Select Images
                            </Button>
                          <FormControl>
                              <Input 
                              type="file" 
                              multiple
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleImageChange}
                              className="hidden"
                              disabled={isUploading || imagePreviews.length >= 3}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-1 right-1 h-7 w-7 rounded-full shrink-0"
                                    onClick={() => removeImagePreview(index)}
                                    disabled={isUploading}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                </CardContent>
                            </Card>
                            ))}
                        </div>
                    )}
                    
                    <Separator />

                    <h3 className="text-lg font-semibold border-b pb-2">Property Details</h3>

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
                                    className="flex items-center space-x-4 pt-2"
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
                    
                    <Separator />
                    <h3 className="text-lg font-semibold border-b pb-2">Location</h3>
                    
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
                            <FormItem className="md:col-span-2">
                            <FormLabel>State</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isUploading}>
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
                    
                    <Separator />
                    <h3 className="text-lg font-semibold border-b pb-2">Contact Details</h3>
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

                    <Separator />
                    <h3 className="text-lg font-semibold border-b pb-2">Features & Amenities</h3>
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
                                <Input type="number" placeholder="e.g., 250" {...field} disabled={isUploading} />
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
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isUploading}>
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
                    
                    <DialogFooter className="pt-8">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading || form.formState.isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading || form.formState.isSubmitting}>
                        {isUploading || form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isUploading ? 'Uploading...' : (form.formState.isSubmitting ? 'Submitting...' : (isEditing ? 'Update Property' : 'List My Property'))}
                    </Button>
                    </DialogFooter>
                </form>
                </Form>
            </div>
        </DialogContent>
     </Dialog>
  );
}

export function MyPropertiesTab() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentAlertOpen, setIsPaymentAlertOpen] = useState(false);
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const appSettingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'app_settings', 'config');
  }, [firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);
  const { data: appSettings, isLoading: isLoadingSettings } = useDoc<AppSettings>(appSettingsRef);

  const userPropertiesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'properties'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: properties, isLoading: arePropertiesLoading } = useCollection<Property>(userPropertiesQuery);
  
  const listingPrice = appSettings?.listingPrice ?? 99;
  
  const handlePayment = async () => {
    if (typeof window === 'undefined' || !(window as any).Razorpay) {
      toast({
        title: "Payment Gateway Error",
        description: "Razorpay is not available. Please check your connection and try again.",
        variant: "destructive",
      });
      return;
    }

    const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: (listingPrice * 100).toString(),
        currency: "INR",
        name: "Falcon Axe Homes Property Listing",
        description: "One-time fee for one property listing.",
        image: "/logo.png",
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay with UPI',
                instruments: [
                  { method: 'upi' },
                ],
              },
            },
            sequence: ['block.upi'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        handler: function (response: any){
            toast({
                title: "Payment Successful!",
                description: "You have received 1 listing credit.",
                variant: "success",
            });
            if(userDocRef) {
              const newOrder = {
                paymentId: response.razorpay_payment_id,
                amount: listingPrice,
                date: new Date(),
                description: "1 Listing Credit Purchase",
              };
              updateDocumentNonBlocking(userDocRef, {
                orders: arrayUnion(newOrder),
                listingCredits: increment(1)
              });
            }
            setIsPaymentAlertOpen(false);
            if (!isFormOpen) { 
               setIsFormOpen(true); 
            }
        },
        prefill: {
            name: userProfile?.fullName,
            email: userProfile?.email,
            contact: userProfile?.phone
        },
        theme: {
            color: "#6D28D9"
        }
    };
    const rzp = new Razorpay(options);
    rzp.open();
  }

  const handleAddPropertyClick = () => {
    if (userProfile && userProfile.listingCredits && userProfile.listingCredits > 0) {
      setIsFormOpen(true);
    } else {
      setIsPaymentAlertOpen(true);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
  };
  
  const handleFormCancel = () => {
    setIsFormOpen(false);
  }

  const isVendor = userProfile?.category === 'vendor';

  const renderMyProperties = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            { (isUserLoading || arePropertiesLoading || isProfileLoading || isLoadingSettings) ? (
                [...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <Skeleton className="h-56 w-full" />
                        <CardContent className="p-6">
                            <Skeleton className="h-5 w-2/3 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                ))
            ) : (
                <>
                    {!isVendor && (
                      <Card 
                          className="h-full flex items-center justify-center border-2 border-dashed bg-muted/50 hover:bg-muted/80 hover:border-primary transition-all cursor-pointer"
                          onClick={handleAddPropertyClick}
                      >
                          <CardContent className="p-6 text-center">
                              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Plus className="h-8 w-8 text-primary" />
                              </div>
                              <h3 className="text-lg font-semibold text-primary">Add New Property</h3>
                               <p className="text-sm text-muted-foreground">You have {userProfile?.listingCredits || 0} credits remaining.</p>
                          </CardContent>
                      </Card>
                    )}
                    
                    {properties?.map((property) => (
                      <PropertyCard key={property.id} property={property} showActiveBadge={true} />
                    ))}
                 </>
            )}
      </div>

      {userProfile && !isVendor && (!userProfile.listingCredits || userProfile.listingCredits === 0) && (
        <BoostReachCard price={listingPrice} onPurchase={handlePayment} />
      )}
      
      {isVendor && (
          <Alert>
              <Building className="h-4 w-4" />
              <AlertTitle>Property Listings are Unavailable</AlertTitle>
              <AlertDescription>
                  As a vendor, you do not have permission to list properties. This section is for property owners and agents.
              </AlertDescription>
          </Alert>
      )}

       <AlertDialog open={isPaymentAlertOpen} onOpenChange={setIsPaymentAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Post a New Property</AlertDialogTitle>
            <AlertDialogDescription>
               A fee of {formatPrice(listingPrice)} is required to post a new property listing. Please proceed to payment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePayment}>Pay {formatPrice(listingPrice)}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
  
  return (
    <div className="space-y-8">
        {renderMyProperties()}
        <PropertyForm 
          isOpen={isFormOpen}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
    </div>
  )
}
