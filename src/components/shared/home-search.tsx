
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LocationDisplay } from './location-display';

const searchTabs = [
  { id: 'buy', label: 'Buy' },
  { id: 'rent', label: 'Rent' },
  { id: 'pg', label: 'PG / Co-living' },
];

export function HomeSearch() {
  const [activeTab, setActiveTab] = useState('buy');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      type: activeTab,
      q: searchTerm,
    }).toString();
    router.push(`/properties?${query}`);
  };

  return (
    <div className="bg-background/95 border-b py-6 rounded-lg shadow-lg">
      <div className="px-4 container mx-auto">
        <form onSubmit={handleSearch}>
            <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                id="search-city"
                placeholder="Search by location or project"
                className="pl-12 pr-14 h-12 text-base rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full">
                <Search className="h-5 w-5" />
            </Button>
            </div>
        </form>

        <div className="h-8 flex items-center justify-start mt-2">
            <LocationDisplay />
        </div>

        <div className="mt-4">
             <div className="flex items-center space-x-6">
              {searchTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'py-2 text-sm md:text-base font-semibold transition-colors relative',
                    activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute -bottom-px left-0 w-full h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
               <button
                  onClick={() => router.push('/profile?tab=listings')}
                  className={cn(
                    'py-2 text-sm md:text-base font-semibold transition-colors relative',
                    'text-muted-foreground hover:text-primary'
                  )}
                >
                  Post Ad
                  <span className="ml-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-sm">FREE</span>
                </button>
            </div>
        </div>
        
      </div>
    </div>
  );
}
