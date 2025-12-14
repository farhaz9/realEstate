
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
import { collection, serverTimestamp, query, where, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Banknote, ExternalLink, ImageUp, Loader2, Plus, Star, X, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import type { Property, User } from '@/types';
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
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import ImageKit from 'imagekit-javascript';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

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

interface MyPropertiesTabProps {
  propertyToEdit?: Property | null;
  onSuccess?: () => void;
}

async function getCoordinatesForAddress(address: string) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Geocoding API request failed:', response.statusText);
      return null;
    }
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
}

export function MyPropertiesTab({ propertyToEdit, onSuccess }: MyPropertiesTabProps) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentAlertOpen, setIsPaymentAlertOpen] = useState(false);
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<User>(userDocRef);

  const userPropertiesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'properties'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: properties, isLoading: arePropertiesLoading } = useCollection<Property>(userPropertiesQuery);
  
  const isEditing = !!propertyToEdit;
  
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
        amount: "9900", // amount in the smallest currency unit
        currency: "INR",
        name: "Estately Property Listing",
        description: "One-time fee for one property listing.",
        image: "https://example.com/your_logo.jpg", // Optional
        handler: function (response: any){
            toast({
                title: "Payment Successful!",
                description: "You can now post your property.",
                variant: "success",
            });
            setIsPaymentAlertOpen(false);
            setIsFormOpen(true); 
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


  useEffect(() => {
    if(isEditing) {
        setIsFormOpen(true);
    }
  }, [isEditing]);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      listingType: 'sale',
      location: { address: '', pincode: '', state: '' },
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
      setImagePreviews(propertyToEdit.imageUrls || []);
    } else if (isFormOpen) { // Reset form only when opening for a new entry
        form.reset();
        setImagePreviews([]);
    }
  }, [isEditing, propertyToEdit, form, isFormOpen]);


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

      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
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
    
    const fullAddress = `${data.location.address}, ${data.location.state}, ${data.location.pincode}`;
    const coordinates = await getCoordinatesForAddress(fullAddress);
    
    if (!coordinates) {
       toast({
        title: "Location Not Found",
        description: "Could not find coordinates for the address. Please provide a more specific address.",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    let uploadedImageUrls: string[] = isEditing ? imagePreviews.filter(url => url.startsWith('http')) : [];
    const files = data.images as FileList | null;
    const newFilesToUpload = files ? Array.from(files) : [];

    if (newFilesToUpload.length > 0) {
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

        const uploadPromises = newFilesToUpload.map(file => {
          return imagekit.upload({
            file,
            fileName: file.name,
            ...authBody,
            folder: "/delhi-estate-luxe",
          });
        });

        const uploadResults = await Promise.all(uploadPromises);
        uploadedImageUrls = [...uploadedImageUrls, ...uploadResults.map(result => result.url)];

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
      location: { ...restOfData.location, ...coordinates },
      imageUrls: uploadedImageUrls,
      amenities: amenitiesArray,
    };
    
    if (!data.overlooking) delete (propertyData as Partial<typeof propertyData>).overlooking;
    if (!data.ageOfConstruction) delete (propertyData as Partial<typeof propertyData>).ageOfConstruction;

    if (isEditing && propertyToEdit) {
      const propertyRef = doc(firestore, 'properties', propertyToEdit.id);
      updateDocumentNonBlocking(propertyRef, propertyData);
      toast({ title: 'Property Updated!', description: 'Your property has been successfully updated.', variant: 'success' });
    } else if(user) {
      const propertiesCollection = collection(firestore, 'properties');
      const tier = 'premium';
      const isFeatured = true;
      const expirationDays = 90;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expirationDays);

      const newPropertyData = {
        ...propertyData,
        userId: user.uid,
        dateListed: serverTimestamp(),
        isFeatured,
        listingTier: tier,
        expiresAt: expirationDate,
      };
      
      addDocumentNonBlocking(propertiesCollection, newPropertyData);
      toast({ title: 'Property Listed!', description: `Your property has been successfully listed.`, variant: 'success' });
    }

    setIsUploading(false);
    setIsFormOpen(false);
    if(onSuccess) {
      onSuccess();
    }
  }
  
  const handleAddPropertyClick = () => {
    // Always open payment dialog.
    setIsPaymentAlertOpen(true);
  };


  const renderAddPropertyForm = () => (
     <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Property" : "Add a New Property"}</DialogTitle>
              <DialogDescription>Fill in the details below to {isEditing ? 'update your property' : 'add your property to our listings'}.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Property Images (up to 3)</FormLabel>
                          <Dialog>
                              <DialogTrigger asChild>
                                  <Button variant="outline" className="w-full">
                                  <ImageUp className="mr-2 h-4 w-4" />
                                  Upload Images
                                  </Button>
                              </DialogTrigger>
                               <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Image Upload Instructions</DialogTitle>
                                      <DialogDescription>
                                          For the best results, please follow these guidelines when uploading your property images.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                    <Alert>
                                        <AlertTitle>File Size Limit: 1MB</AlertTitle>
                                        <AlertDescription>
                                            Each image must be under 1MB. Large images may fail to upload.
                                        </AlertDescription>
                                        </Alert>
                                        <p className="text-sm text-muted-foreground">
                                            If your images are too large, you can use a free online tool to compress them before uploading.
                                        </p>
                                        <Button variant="secondary" asChild>
                                            <Link href="https://www.iloveimg.com/" target="_blank">
                                            Resize & Compress Images <ExternalLink className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                    <DialogFooter>
                                    <Button onClick={() => fileInputRef.current?.click()}>
                                        Select Files
                                    </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
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
                              {imagePreviews.length} / 3 uploaded.
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
                    
                    <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isUploading || form.formState.isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading || form.formState.isSubmitting}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isUploading ? 'Uploading...' : (form.formState.isSubmitting ? 'Submitting...' : (isEditing ? 'Update Property' : 'List My Property'))}
                    </Button>
                    </DialogFooter>
                </form>
                </Form>
            </div>
        </DialogContent>
     </Dialog>
  );

  const renderMyProperties = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card 
            className="h-full flex items-center justify-center border-2 border-dashed bg-muted/50 hover:bg-muted/80 hover:border-primary transition-all cursor-pointer"
            onClick={handleAddPropertyClick}
        >
            <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary">Add New Property</h3>
            </CardContent>
        </Card>
        {properties?.map((property) => (
          <PropertyCard key={property.id} property={property} showActiveBadge={true} />
        ))}
      </div>
       <AlertDialog open={isPaymentAlertOpen} onOpenChange={setIsPaymentAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Post a New Property</AlertDialogTitle>
            <AlertDialogDescription>
               A fee of ₹99 is required to post a new property listing. Please proceed to payment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePayment}>Pay ₹99</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
  
  if (isEditing) {
    return renderAddPropertyForm();
  }

  if (isUserLoading || arePropertiesLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {renderMyProperties()}
        {renderAddPropertyForm()}
    </div>
  )
}
