
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { ListFilter, Search } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Property } from '@/types';
import { collection, query, orderBy, Query } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const searchSuggestions = [
  'Search property in South Delhi',
  'Rent house in Chattarpur',
  'Find a 3BHK apartment',
  'Luxury villa for sale',
  'Penthouse with city view',
];

export default function PropertiesPage() {
  const firestore = useFirestore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 20]); // In Crores
  const [placeholder, setPlaceholder] = useState(searchSuggestions[0]);

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

  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q: Query = collection(firestore, 'properties');
    q = query(q, orderBy('dateListed', 'desc'));
    return q;
  }, [firestore]);

  const { data: properties, isLoading, error } = useCollection<Property>(propertiesQuery);

  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    
    return properties.filter(p => {
      const searchTermMatch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              p.location.address.toLowerCase().includes(searchTerm.toLowerCase());
      const locationMatch = location === 'all' || p.location.state === location || p.location.pincode === location;
      const typeMatch = propertyType === 'all' || p.propertyType === propertyType;
      const bedroomsMatch = bedrooms === 0 || p.bedrooms >= bedrooms;
      const bathroomsMatch = bathrooms === 0 || p.bathrooms >= bathrooms;
      const priceMatch = p.price >= priceRange[0] * 10000000 && p.price <= priceRange[1] * 10000000;
      
      return searchTermMatch && locationMatch && typeMatch && bedroomsMatch && bathroomsMatch && priceMatch;
    });
  }, [properties, searchTerm, location, propertyType, bedrooms, bathrooms, priceRange]);
  
  const uniqueLocations = useMemo(() => {
      if (!properties) return [];
      const states = [...new Set(properties.map(p => p.location.state))];
      return states;
  }, [properties]);

  const uniqueTypes = useMemo(() => {
    if (!properties) return [];
    return [...new Set(properties.map(p => p.propertyType))];
  }, [properties]);

  return (
    <div>
      <section className="bg-primary text-primary-foreground py-8 md:py-12">
        <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                      id="search"
                      placeholder={placeholder}
                      className="pl-10 text-foreground"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <div className="mt-4 flex gap-4 items-end overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
                <div className="flex-shrink-0 min-w-[150px] space-y-1">
                  <Label className="text-xs font-semibold text-primary-foreground/80">Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="All Localities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Localities</SelectItem>
                      {uniqueLocations.map((loc, index) => <SelectItem key={`${loc}-${index}`} value={loc}>{loc}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-shrink-0 min-w-[150px] space-y-1">
                  <Label className="text-xs font-semibold text-primary-foreground/80">Property Type</Label>
                   <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueTypes.map((type, index) => <SelectItem key={`${type}-${index}`} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="flex-shrink-0 min-w-[200px] flex-grow space-y-1">
                   <Label className="text-xs font-semibold text-primary-foreground/80 truncate">
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
                 <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="secondary" className="flex-shrink-0">
                            <ListFilter className="mr-2 h-4 w-4" />
                            More Filters
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Advanced Filters</SheetTitle>
                        </SheetHeader>
                         <div className="grid gap-6 mt-6">
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
            </div>
            </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
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
                <p>Try adjusting your search filters.</p>
            </div>
        )}
      </div>
    </div>
  );
}
