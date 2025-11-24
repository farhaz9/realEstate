'use client';

import { useState, useMemo, useEffect } from 'react';
import { PropertyCard } from '@/components/property-card';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListFilter, Search, Loader2 } from 'lucide-react';
import { PageHero } from '@/components/shared/page-hero';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Property } from '@/types';
import { collection, query, where, orderBy, Query } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function PropertiesPage() {
  const firestore = useFirestore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 20]); // In Crores

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
      const searchTermMatch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const locationMatch = location === 'all' || p.location === location;
      const typeMatch = propertyType === 'all' || p.propertyType === propertyType;
      const bedroomsMatch = bedrooms === 0 || p.bedrooms >= bedrooms;
      const bathroomsMatch = bathrooms === 0 || p.bathrooms >= bathrooms;
      const priceMatch = p.price >= priceRange[0] * 10000000 && p.price <= priceRange[1] * 10000000;
      
      return searchTermMatch && locationMatch && typeMatch && bedroomsMatch && bathroomsMatch && priceMatch;
    });
  }, [properties, searchTerm, location, propertyType, bedrooms, bathrooms, priceRange]);
  
  const uniqueLocations = useMemo(() => {
      if (!properties) return [];
      return [...new Set(properties.map(p => p.location))];
  }, [properties]);

  const uniqueTypes = useMemo(() => {
    if (!properties) return [];
    return [...new Set(properties.map(p => p.propertyType))];
  }, [properties]);

  return (
    <div>
      <PageHero
        title="Properties"
        subtitle="Browse our curated selection of high-end homes, villas, and apartments from the best real estate company in Delhi."
        image={{
          id: 'properties-hero',
          imageHint: 'luxury villa',
        }}
      />
      <div className="container mx-auto px-4 py-16">
        <Card className="mb-8 p-4 bg-card/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="lg:col-span-3">
                <Label htmlFor="search">Search Properties</Label>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        id="search"
                        placeholder="Search by title..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div>
              <Label htmlFor="location-filter">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location-filter">
                  <SelectValue placeholder="All Localities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Localities</SelectItem>
                  {uniqueLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
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
            <div className="lg:col-span-3">
                <Label>Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</Label>
                <Slider
                    min={0}
                    max={20}
                    step={0.5}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value)}
                />
            </div>
          </div>
        </Card>

        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="flex flex-col h-full overflow-hidden">
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
                    </Card>
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
