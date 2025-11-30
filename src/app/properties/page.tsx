
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
import { SlidersHorizontal, Search, ArrowUpDown, MapPin, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Property } from '@/types';
import { collection, query, orderBy, Query } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { analyzeSearchQuery, type SearchAnalysis } from '@/ai/flows/property-search-flow';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LocationDisplay } from '@/components/shared/location-display';

const searchSuggestions = [
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

export default function PropertiesPage() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const { location: userLocation, canAskPermission } = useGeolocation();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState('all');
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 20]); // In Crores
  const [sortBy, setSortBy] = useState('dateListed-desc');
  const [placeholder, setPlaceholder] = useState(searchSuggestions[0]);
  const [isAiSearchPending, startAiSearchTransition] = useTransition();
  const [aiAnalysis, setAiAnalysis] = useState<SearchAnalysis | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder(prev => {
        const currentIndex = searchSuggestions.indexOf(prev);
        const nextIndex = (currentIndex + 1) % searchSuggestions.length;
        return searchSuggestions[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchTerm) {
      setAiAnalysis(null);
      return;
    }

    startAiSearchTransition(async () => {
      const analysis = await analyzeSearchQuery({ query: searchTerm });
      setAiAnalysis(analysis);
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

  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    
    let processedProperties = [...properties];
    
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
                       (activeTab === 'pg' && p.propertyType?.toLowerCase().includes('pg'));

      if (aiAnalysis && searchTerm) {
        if (aiAnalysis.listingType) {
          tabMatch = p.listingType === aiAnalysis.listingType;
        }

        const aiLocationMatch = !aiAnalysis.location || p.location?.address?.toLowerCase().includes(aiAnalysis.location.toLowerCase()) || p.location?.state?.toLowerCase().includes(aiAnalysis.location.toLowerCase());
        const aiPropertyTypeMatch = !aiAnalysis.propertyType || p.propertyType?.toLowerCase().includes(aiAnalysis.propertyType.toLowerCase());
        const aiBedroomsMatch = !aiAnalysis.bedrooms || p.bedrooms >= aiAnalysis.bedrooms;

        return tabMatch && aiLocationMatch && aiPropertyTypeMatch && aiBedroomsMatch;
      }
      
      const searchTermMatch = !searchTerm || (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
                              (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (p.location?.address && p.location.address.toLowerCase().includes(searchTerm.toLowerCase()));
      const locationMatch = location === 'all' || p.location?.state === location || p.location?.pincode === location;
      const bedroomsMatch = bedrooms === 0 || p.bedrooms >= bedrooms;
      const bathroomsMatch = bathrooms === 0 || p.bathrooms >= bathrooms;
      const priceMatch = p.price >= priceRange[0] * 10000000 && p.price <= priceRange[1] * 10000000;
      
      return tabMatch && searchTermMatch && locationMatch && bedroomsMatch && bathroomsMatch && priceMatch;
    });
  }, [properties, activeTab, searchTerm, location, bedrooms, bathrooms, priceRange, aiAnalysis, sortBy, userLocation]);
  
  const uniqueLocations = useMemo(() => {
      if (!properties) return [];
      const states = [...new Set(properties.map(p => p.location?.state).filter(Boolean) as string[])];
      return states;
  }, [properties]);


  return (
    <div>
      <section className="bg-background border-b sticky top-14 z-40">
        <div className="container mx-auto px-4 pt-4 pb-2">
          <div className="flex justify-between items-center">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="rent">Rent</TabsTrigger>
                <TabsTrigger value="pg">PG / Co-living</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button asChild className="hidden sm:flex ml-4 flex-shrink-0">
                <Link href="/profile?tab=listings">
                    Post Ad
                    <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-sm">FREE</span>
                </Link>
            </Button>
          </div>
           <form onSubmit={handleSearch} className="flex items-center gap-2 my-4">
             <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    id="search"
                    placeholder={placeholder}
                    className="pl-10 text-foreground h-12 rounded-full pr-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                 <Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full" disabled={isAiSearchPending}>
                    {isAiSearchPending ? <ArrowUpDown className="h-5 w-5 animate-bounce" /> : <Search className="h-5 w-5" />}
                </Button>
            </div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-full flex-shrink-0 shadow-sm">
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
           <div className="h-6 flex items-center justify-center -mt-2">
              <LocationDisplay />
            </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {isLoading || isAiSearchPending ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col h-full overflow-hidden border rounded-lg">
                        <Skeleton className="h-56 w-full" />
                        <div className="p-6 flex-grow flex flex-col">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-5 w-2/3 mt-2" />
                            <Skeleton className="h-4 w-1/2 mt-1" />
                            <div className="mt-4 flex items-center space-x-4 border-t pt-4">
                                <Skeleton className="h-5 w-1/4" />
                                <Skeleton className="h-5 w-1/4" />
                                <Skeleton className="h-5 w-1/4" />
                            </div>
                        </div>
                         <div className="p-6 pt-0 mt-auto">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                ))}
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
    </div>
  );
}
