
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

export function MyPropertiesTab() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
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
        name: "Falcon Homes Property Listing",
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
              const newTransaction = {
                paymentId: response.razorpay_payment_id,
                amount: listingPrice,
                date: new Date(),
                description: "1 Listing Credit Purchase",
              };
              updateDocumentNonBlocking(userDocRef, {
                transactions: arrayUnion(newTransaction),
                listingCredits: increment(1)
              });
            }
            setIsPaymentAlertOpen(false);
            router.push('/add-property');
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
      router.push('/add-property');
    } else {
      setIsPaymentAlertOpen(true);
    }
  };
  
  const isVendor = userProfile?.category === 'vendor';

  return (
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
  )
}
