
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Logo } from './logo';

const searchTabs = [
  { id: 'buy', label: 'Buy' },
  { id: 'rent', label: 'Rent' },
  { id: 'pg', label: 'PG / Co-living' },
  { id: 'commercial', label: 'Commercial' },
];

export function HomeSearch() {
  const [activeTab, setActiveTab] = useState('rent');

  return (
    <section className="bg-background/95 border-b sticky top-16 z-40 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            {searchTabs.map(tab => (
              <Button
                key={tab.id}
                variant="link"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'text-muted-foreground hover:text-primary font-semibold text-sm md:text-base p-0 h-auto relative transition-colors',
                  activeTab === tab.id && 'text-primary'
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </Button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Logo />
             <Button asChild variant="ghost" className="font-semibold">
                <Link href="/add-property">
                    Post Ad
                    <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-sm">FREE</span>
                </Link>
            </Button>
          </div>
        </div>
        <div className="relative mt-4">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="search-city"
            placeholder="Search by city, location, or project"
            className="pl-12 pr-14 h-12 text-base rounded-full"
          />
          <Button size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full">
            <Search />
          </Button>
        </div>
      </div>
    </section>
  );
}
