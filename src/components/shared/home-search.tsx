'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    <section className="bg-background/95 border-b py-6 -mt-16 relative z-20 container mx-auto rounded-lg shadow-lg">
      <div className="px-4">
        <div className="flex items-center space-x-6 border-b mb-4">
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
            <Link href="/add-property" className="ml-auto text-sm font-semibold text-muted-foreground hover:text-primary relative pb-2">
                Post Ad
                <span className="absolute top-[-10px] right-[-25px] bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-sm text-[10px]">FREE</span>
            </Link>
        </div>
        
        <form onSubmit={handleSearch}>
            <div className="relative mt-4">
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
      </div>
    </section>
  );
}
