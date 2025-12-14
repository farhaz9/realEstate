
'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { SlidersHorizontal, Search, ArrowUpDown, Bell } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc, updateDocumentNonBlocking } from '@/firebase';
import type { Property, User } from '@/types';
import { collection, query, orderBy, Query, where, doc, arrayUnion, serverTimestamp, increment } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { analyzeSearchQuery, type SearchAnalysis } from '@/ai/flows/property-search-flow';
import { useGeolocation } from '@/hooks/use-geolocation';
import { LocationDisplay } from '@/components/shared/location-display';
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
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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
  { value: "all", label: "All" },
  { value: "buy", label: "Buy" },
  { value: "rent", label: "Rent" },
  { value: "pg", label: "PG / Co-living" },
  { value: "commercial", label: "Commercial" },
];


export default function PropertiesPage() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const { location: userLocation, city: detectedCity, canAskPermission } = useGeolocation();
  
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
      router.push('/settings?tab=listings');
    } else {
      setIsPaymentAlertOpen(true);
    }
  };

  const searchSuggestions = useMemo(() => {
    if (detectedCity) {
      return [
        `Search for properties in ${detectedCity}`,
        `Find 2BHK apartments in ${detectedCity}`,
        `Luxury villas for sale near ${detectedCity}`,
        `Rent a house in ${detectedCity}`,
      ];
    }
    return staticSearchSuggestions;
  }, [detectedCity]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder(prev => {
        const currentIndex = searchSuggestions.indexOf(prev);
        const nextIndex = (currentIndex + 1) % searchSuggestions.length;
        return searchSuggestions[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [searchSuggestions]);
  
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchTerm) {
      setAiAnalysis(null);
      return;
    }

    if (typeof window !== 'undefined') {
        const recentSearchesRaw = localStorage.getItem('recentSearches');
        let recentSearches: string[] = recentSearchesRaw ? JSON.parse(recentSearchesRaw) : [];
        
        recentSearches = recentSearches.filter((s) => s.toLowerCase() !== searchTerm.toLowerCase());
        
        recentSearches.unshift(searchTerm);
        
        recentSearches = recentSearches.slice(0, 5);
        
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }


    startAiSearchTransition(async () => {
      try {
        const analysis = await analyzeSearchQuery({ query: searchTerm });
        setAiAnalysis(analysis);
      } catch (error) {
        console.error('AI search failed:', error);
        setAiAnalysis(null);
      }
    });
  }

  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q: Query = collection(firestore, 'properties');
    if (sortBy !== 'nearby') {
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
    
    let baseProperties = properties;

    if (searchTerm && fuse) {
        if (aiAnalysis) {
            // AI-driven search takes priority if analysis is available
            const aiResults = fuse.search(searchTerm);
            baseProperties = aiResults.map(result => result.item);
        } else {
            const fuseResults = fuse.search(searchTerm);
            baseProperties = fuseResults.map(result => result.item);
        }
    }
    
    let processedProperties = [...baseProperties];
    
    // Calculate distances if user location is available
    if (userLocation) {
        processedProperties = processedProperties.map(p => {
          if (p.location?.latitude && p.location?.longitude) {
            const distance = getDistance(userLocation.latitude, userLocation.longitude, p.location.latitude, p.location.longitude);
            return {
              ...p,
              distance: distance
            };
          }
          return { ...p, distance: Infinity }; // Assign infinite distance if no coords
        });
    }

    // Apply sorting
    if (sortBy === 'nearby' && userLocation) {
      processedProperties.sort((a, b) => ((a as any).distance || Infinity) - ((b as any).distance || Infinity));
    }

    return processedProperties.filter(p => {
      let tabMatch = activeTab === 'all' || 
                       (activeTab === 'buy' && p.listingType === 'sale') ||
                       (activeTab === 'rent' && p.listingType === 'rent') ||
                       (activeTab === 'pg' && p.propertyType?.toLowerCase().includes('pg')) ||
                       (activeTab === 'commercial' && p.propertyType?.toLowerCase().includes('commercial'));


      if (aiAnalysis && searchTerm) {
        if (aiAnalysis.listingType) {
          tabMatch = p.listingType === aiAnalysis.listingType;
        }

        const aiLocationMatch = !aiAnalysis.location || p.location?.address?.toLowerCase().includes(aiAnalysis.location.toLowerCase()) || p.location?.state?.toLowerCase().includes(aiAnalysis.location.toLowerCase());
        const aiPropertyTypeMatch = !aiAnalysis.propertyType || p.propertyType?.toLowerCase().includes(aiAnalysis.propertyType.toLowerCase());
        const aiBedroomsMatch = !aiAnalysis.bedrooms || p.bedrooms >= aiAnalysis.bedrooms;
        
        return tabMatch && aiLocationMatch && aiPropertyTypeMatch && aiBedroomsMatch;
      }
      
      const detectedCityMatch = !detectedCity || (p.location?.address?.toLowerCase().includes(detectedCity.toLowerCase())) || (p.location?.state?.toLowerCase().includes(detectedCity.toLowerCase()));
      const locationMatch = location === 'all' || p.location?.state === location;
      const pincodeMatch = !pincode || p.location?.pincode === pincode;
      const bedroomsMatch = bedrooms === 0 || p.bedrooms >= bedrooms;
      const bathroomsMatch = bathrooms === 0 || p.bathrooms >= bathrooms;
      const priceMatch = p.price >= priceRange[0] * 10000000 && p.price <= priceRange[1] * 10000000;
      
      const manualFiltersApplied = location !== 'all' || pincode || bedrooms > 0 || bathrooms > 0;
      
      if (manualFiltersApplied) {
        return tabMatch && locationMatch && pincodeMatch && bedroomsMatch && bathroomsMatch && priceMatch;
      }

      return tabMatch && detectedCityMatch && priceMatch;
    });
  }, [properties, activeTab, searchTerm, location, pincode, bedrooms, bathrooms, priceRange, aiAnalysis, sortBy, userLocation, fuse, detectedCity]);
  
  const uniqueLocations = useMemo(() => {
      if (!properties) return [];
      const states = [...new Set(properties.map(p => p.location?.state).filter(Boolean) as string[])];
      return states;
  }, [properties]);


  return (
    <div>
      <section className="bg-background border-b sticky top-14 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center mb-4">
             <LocationDisplay />
             <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <div className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background" />
             </Button>
          </div>
           <form onSubmit={handleSearch} className="flex items-center gap-2">
             <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    id="search"
                    placeholder={placeholder}
                    className="pl-12 text-foreground h-12 rounded-lg bg-muted border-transparent focus:bg-background focus:border-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" className="h-12 w-12 rounded-lg flex-shrink-0 shadow-sm">
                        <SlidersHorizontal className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                     <div className="grid gap-6 mt-6">
                        <div className="space-y-2">
                            <Label>Sort By</Label>
                             <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="bg-background text-foreground h-9 shadow-sm">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dateListed-desc">Newest First</SelectItem>
                                    <SelectItem value="dateListed-asc">Oldest First</SelectItem>
                                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                    {userLocation && canAskPermission && <SelectItem value="nearby">Nearby</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>State</Label>
                                <Select value={location} onValueChange={setLocation}>
                                    <SelectTrigger className="bg-background text-foreground h-9 shadow-sm">
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
                                  className="bg-background text-foreground h-9 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold truncate text-center block">
                                Price: {formatPrice(priceRange[0], true)} - {formatPrice(priceRange[1], true, true)}
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="bedrooms-filter">Beds</Label>
                                <Select value={String(bedrooms)} onValueChange={(val) => setBedrooms(Number(val))}>
                                    <SelectTrigger id="bedrooms-filter">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[0, 1, 2, 3, 4, 5].map(b => <SelectItem key={b} value={String(b)}>{b === 0 ? 'Any' : `${b}+`}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="bathrooms-filter">Baths</Label>
                                <Select value={String(bathrooms)} onValueChange={(val) => setBathrooms(Number(val))}>
                                    <SelectTrigger id="bathrooms-filter">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[0, 1, 2, 3, 4, 5].map(b => <SelectItem key={b} value={String(b)}>{b === 0 ? 'Any' : `${b}+`}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
           </form>
           <div className="flex items-center overflow-x-auto hide-scrollbar mt-4 border-b">
              {tabOptions.map(tab => (
                 <button 
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "relative py-3 px-4 text-sm font-medium whitespace-nowrap transition-colors text-muted-foreground",
                    activeTab === tab.value && "text-primary"
                  )}
                 >
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
                  <SelectItem value="dateListed-desc">Newest</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  {userLocation && <SelectItem value="nearby">Nearby</SelectItem>}
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
              <PropertyCard key={property.id} property={property} />
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
