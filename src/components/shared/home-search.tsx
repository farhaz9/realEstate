

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
  { id: 'commercial', label: 'Commercial' },
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
    <section className="bg-background/95 border-b py-4 -mt-12 relative z-20 container mx-auto rounded-lg shadow-lg">
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            {searchTabs.map(tab => (
              <Button
                key={tab.id}
                variant="link"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'text-muted-foreground hover:text-primary font-semibold text-sm md:text-base p-0 h-auto relative transition-colors group no-underline hover:no-underline',
                  activeTab === tab.id && 'text-primary'
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
                 <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              </Button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2">
             <Button asChild variant="ghost" className="font-semibold">
                <Link href="/add-property">
                    Post Ad
                    <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-sm">FREE</span>
                </Link>
            </Button>
          </div>
        </div>
        <form onSubmit={handleSearch}>
            <div className="relative mt-4">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                id="search-city"
                placeholder="Search by location or project"
                className="pl-12 pr-28 h-12 text-base rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" size="lg" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 rounded-full">
                <Search className="h-5 w-5 mr-2" />
                Search
            </Button>
            </div>
        </form>
      </div>
    </section>
  );
}
