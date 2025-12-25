

'use client';

import { useState, useMemo, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PropertyCard } from '@/components/property-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal, Search, ArrowUpDown, LayoutGrid, ShoppingCart, Home, User, Building, X, Minus, Plus, MapPin } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc, updateDocumentNonBlocking } from '@/firebase';
import type { Property, User } from '@/types';
import { collection, query, orderBy, Query, where, doc, arrayUnion, serverTimestamp, increment } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import Link from 'next/link';
import { analyzeSearchQuery, type SearchAnalysis } from '@/ai/flows/property-search-flow';
import Fuse from 'fuse.js';
import { Spinner } from '@/components/ui/spinner-1';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LocationDisplay } from '@/components/shared/location-display';
import { Separator } from '@/components/ui/separator';

declare const Razorpay: any;

const staticSearchSuggestions = [
  'Search property in South Delhi',
  'Rent house in Chattarpur',
  'Find a 3BHK apartment',
  'Luxury villa for sale',
  'Penthouse with city view',
];

// Haversine formula to calculate distance between two points
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const tabOptions = [
    { value: "all", label: "All", icon: LayoutGrid },
    { value: "buy", label: "Buy", icon: ShoppingCart },
    { value: "rent", label: "Rent", icon: Home },
    { value: "pg", label: "PG / Co-living", icon: User },
    { value: "commercial", label: "Commercial", icon: Building },
];

function PropertiesPageContent() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState('all');
  const [pincode, setPincode] = useState('');
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 20]); // In Crores
  const [sortBy, setSortBy] = useState('dateListed-desc');
  const [placeholder, setPlaceholder] = useState(staticSearchSuggestions[0]);
  const [isAiSearchPending, startAiSearchTransition] = useTransition();
  const [aiAnalysis, setAiAnalysis] = useState<SearchAnalysis | null>(null);
  const [isPaymentAlertOpen, setIsPaymentAlertOpen] = useState(false);
  
  const currentSearchTerm = searchParams.get('q') || '';
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

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
                amount: 99,
                date: new Date(),
              };
              updateDocumentNonBlocking(userDocRef, {
                orders: arrayUnion(newOrder),
                listingCredits: increment(1)
              });
            }
            setIsPaymentAlertOpen(false);
            router.push('/settings?tab=listings');
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

  const handlePostAdClick = () => {
    if (!user) {
        router.push('/login');
        return;
    }
    
    if (userProfile && userProfile.listingCredits && userProfile.listingCredits > 0) {
      router.push('/add-property');
    } else {
      setIsPaymentAlertOpen(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder(prev => {
        const currentIndex = staticSearchSuggestions.indexOf(prev);
        const nextIndex = (currentIndex + 1) % staticSearchSuggestions.length;
        return staticSearchSuggestions[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams(window.location.search);
    params.set('q', searchTerm);
    router.replace(`/properties?${params.toString()}`);
  }
  
  useEffect(() => {
    setSearchTerm(currentSearchTerm);
    
    if (!currentSearchTerm) {
      setAiAnalysis(null);
      return;
    }

    if (typeof window !== 'undefined') {
        const recentSearchesRaw = localStorage.getItem('recentSearches');
        let recentSearches: string[] = recentSearchesRaw ? JSON.parse(recentSearchesRaw) : [];
        
        recentSearches = recentSearches.filter((s) => s.toLowerCase() !== currentSearchTerm.toLowerCase());
        
        recentSearches.unshift(currentSearchTerm);
        
        recentSearches = recentSearches.slice(0, 5);
        
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }


    startAiSearchTransition(async () => {
      try {
        const analysis = await analyzeSearchQuery({ query: currentSearchTerm });
        setAiAnalysis(analysis);
      } catch (error) {
        console.error('AI search failed:', error);
        setAiAnalysis(null);
      }
    });
  }, [currentSearchTerm])


  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q: Query = collection(firestore, 'properties');
    if (sortBy !== 'nearby' && sortBy !== 'relevance') {
      const [sortField, sortDirection] = sortBy.split('-');
      q = query(q, orderBy(sortField, sortDirection as 'asc' | 'desc'));
    }
    return q;
  }, [firestore, sortBy]);

  const { data: properties, isLoading, error } = useCollection<Property>(propertiesQuery);

  const fuse = useMemo(() => {
    if (!properties) return null;
    const options = {
      keys: ['title', 'description', 'location.address', 'propertyType', 'location.pincode', 'location.state'],
      includeScore: true,
      threshold: 0.4,
    };
    return new Fuse(properties, options);
  }, [properties]);

  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    
    let baseProperties = [...properties];

    // Step 1: Filter by search term (either AI or fuzzy)
    if (currentSearchTerm.trim()) {
        if (aiAnalysis) {
            // AI-driven filtering
            baseProperties = baseProperties.filter(p => {
                const aiLocationMatch = !aiAnalysis.location || p.location?.address?.toLowerCase().includes(aiAnalysis.location.toLowerCase()) || p.location?.state?.toLowerCase().includes(aiAnalysis.location.toLowerCase());
                const aiPropertyTypeMatch = !aiAnalysis.propertyType || p.propertyType?.toLowerCase().includes(aiAnalysis.propertyType.toLowerCase());
                const aiBedroomsMatch = !aiAnalysis.bedrooms || p.bedrooms >= aiAnalysis.bedrooms;
                const aiBathroomsMatch = !aiAnalysis.bathrooms || p.bathrooms >= aiAnalysis.bathrooms;
                const aiListingTypeMatch = !aiAnalysis.listingType || p.listingType === aiAnalysis.listingType;
                return aiLocationMatch && aiPropertyTypeMatch && aiBedroomsMatch && aiBathroomsMatch && aiListingTypeMatch;
            });
        } else if (fuse) {
             // Fallback to regular fuzzy search
            baseProperties = fuse.search(currentSearchTerm).map(result => result.item);
        }
    }
    
    // Step 2: Apply manual filters on the result of Step 1
    return baseProperties.filter(p => {
      const tabMatch = activeTab === 'all' || 
                       (activeTab === 'buy' && p.listingType === 'sale') ||
                       (activeTab === 'rent' && p.listingType === 'rent') ||
                       (activeTab === 'pg' && p.propertyType?.toLowerCase().includes('pg')) ||
                       (activeTab === 'commercial' && p.propertyType?.toLowerCase().includes('commercial'));
      
      const locationMatch = location === 'all' || p.location?.state === location;
      const pincodeMatch = !pincode || p.location?.pincode === pincode;
      const bedroomsMatch = bedrooms === 0 || p.bedrooms >= bedrooms;
      const bathroomsMatch = bathrooms === 0 || p.bathrooms >= bathrooms;
      const priceMatch = p.price >= priceRange[0] * 10000000 && p.price <= priceRange[1] * 10000000;
      
      return tabMatch && locationMatch && pincodeMatch && bedroomsMatch && bathroomsMatch && priceMatch;
    });

  }, [properties, currentSearchTerm, fuse, aiAnalysis, activeTab, location, pincode, bedrooms, bathrooms, priceRange]);
  
  const uniqueLocations = useMemo(() => {
      if (!properties) return [];
      const states = [...new Set(properties.map(p => p.location?.state).filter(Boolean) as string[])];
      return states;
  }, [properties]);


  return (
    <div>
      <section className="bg-background border-b sticky top-14 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
              <div className="hidden md:block">
                  <LocationDisplay />
              </div>
              <form onSubmit={handleSearch} className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                    id="search"
                    placeholder={placeholder}
                    className="pl-12 pr-4 text-foreground h-12 rounded-full bg-muted border-transparent focus-visible:ring-primary focus-visible:ring-2 focus-visible:bg-background transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
               <Button
                variant="default"
                className="rounded-full h-12 hidden md:flex items-center shadow-sm relative"
                onClick={handlePostAdClick}
               >
                <Plus className="mr-2 h-4 w-4" />
                Post Property
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full uppercase shadow-md">
                    Free
                </div>
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-full flex-shrink-0 shadow-sm">
                    <SlidersHorizontal className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col p-0">
                    <SheetHeader className="p-6 pb-4 border-b">
                        <SheetTitle className="text-2xl">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 space-y-8 overflow-y-auto p-6">

                        {/* Sort & Filter */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Sort & Filter</h3>
                            <div className="space-y-2">
                                <Label>Sort By</Label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="bg-muted border-none h-11">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {searchTerm && <SelectItem value="relevance">Relevance</SelectItem>}
                                        <SelectItem value="dateListed-desc">Newest First</SelectItem>
                                        <SelectItem value="dateListed-asc">Oldest First</SelectItem>
                                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                        {location && <SelectItem value="nearby">Nearby</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <Separator />

                        {/* Location */}
                         <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Location</h3>
                            <div className="space-y-2">
                                <Label>State</Label>
                                <Select value={location} onValueChange={setLocation}>
                                    <SelectTrigger className="bg-muted border-none h-11">
                                    <SelectValue placeholder="All States" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    <SelectItem value="all">All States</SelectItem>
                                    {uniqueLocations.map((loc, index) => <SelectItem key={`${loc}-${index}`} value={loc}>{loc}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input 
                                id="pincode"
                                placeholder="e.g. 110085"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                className="bg-muted border-none h-11"
                                />
                            </div>
                        </div>
                        
                        <Separator />
                        
                        {/* Price Range */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Price Range</h3>
                            <Label className="text-base font-bold text-center block">
                                {formatPrice(priceRange[0], true)} - {formatPrice(priceRange[1], true, true)}
                            </Label>
                            <Slider
                                min={0}
                                max={20}
                                step={0.5}
                                value={priceRange}
                                onValueChange={(value) => setPriceRange(value)}
                                className="[&>span]:bg-background py-2"
                            />
                        </div>

                        <Separator />
                        
                        {/* Rooms & Bathrooms */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Features</h3>
                             <div className="space-y-2">
                                <Label>Bedrooms</Label>
                                <div className="flex items-center gap-2">
                                     <Button variant="outline" size="icon" className="rounded-full" onClick={() => setBedrooms(b => Math.max(0, b - 1))}><Minus className="h-4 w-4" /></Button>
                                     <Input className="text-center font-bold bg-muted border-none h-11" readOnly value={bedrooms > 0 ? `${bedrooms}+` : 'Any'} />
                                     <Button variant="outline" size="icon" className="rounded-full" onClick={() => setBedrooms(b => Math.min(10, b + 1))}><Plus className="h-4 w-4" /></Button>
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label>Bathrooms</Label>
                                <div className="flex items-center gap-2">
                                     <Button variant="outline" size="icon" className="rounded-full" onClick={() => setBathrooms(b => Math.max(0, b - 1))}><Minus className="h-4 w-4" /></Button>
                                     <Input className="text-center font-bold bg-muted border-none h-11" readOnly value={bathrooms > 0 ? `${bathrooms}+` : 'Any'} />
                                     <Button variant="outline" size="icon" className="rounded-full" onClick={() => setBathrooms(b => Math.min(10, b + 1))}><Plus className="h-4 w-4" /></Button>
                                </div>
                             </div>
                        </div>

                    </div>
                    <SheetFooter className="grid grid-cols-2 gap-4 border-t p-6 bg-background">
                        <Button variant="outline" onClick={() => {
                            setLocation('all');
                            setPincode('');
                            setBedrooms(0);
                            setBathrooms(0);
                            setPriceRange([0, 20]);
                        }}>Clear All</Button>
                        <SheetClose asChild>
                            <Button>Apply Filters</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
              </Sheet>
          </div>
           <div className="flex items-center overflow-x-auto hide-scrollbar mt-4 border-b">
              {tabOptions.map(tab => (
                 <button 
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "relative py-3 px-4 text-sm font-medium whitespace-nowrap transition-colors text-muted-foreground flex items-center gap-2",
                    activeTab === tab.value && "text-primary"
                  )}
                 >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                    {activeTab === tab.value && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                 </button>
              ))}
            </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center text-sm mb-6">
           <p className="font-semibold">{filteredProperties.length} Properties found</p>
           <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-auto h-auto px-3 py-1.5 border-none bg-transparent shadow-none text-sm gap-1">
                  <span className="text-muted-foreground">Sort by:</span><SelectValue />
              </SelectTrigger>
              <SelectContent>
                  {searchTerm && <SelectItem value="relevance">Relevance</SelectItem>}
                  <SelectItem value="dateListed-desc">Newest</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  {location && <SelectItem value="nearby">Nearby</SelectItem>}
              </SelectContent>
          </Select>
        </div>

        {isLoading || isAiSearchPending || isUserLoading || isProfileLoading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Spinner size={48} />
            </div>
        ) : error ? (
            <div className="text-center text-destructive">
                <p>Error loading properties: {error.message}</p>
            </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} searchTerm={currentSearchTerm} />
            ))}
          </div>
        ) : (
            <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg font-semibold">No properties found.</p>
                <p>Try adjusting your search filters or rephrasing your search.</p>
            </div>
        )}
      </div>

       <AlertDialog open={isPaymentAlertOpen} onOpenChange={setIsPaymentAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Post a New Property</AlertDialogTitle>
            <AlertDialogDescription>
              To post a new property listing, a fee of ₹99 is required. Please proceed to payment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePayment}>Proceed to Pay ₹99</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


function LoadingFallback() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="relative h-56 w-full rounded-xl" />
                        <div className="space-y-2 p-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function PropertiesPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <PropertiesPageContent />
        </Suspense>
    )
}
