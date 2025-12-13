
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const stats = [
  { label: '1M+ Listings' },
  { label: 'Top Agents' },
  { label: 'Verified Photos' },
];

export function HomeSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      q: searchTerm,
    }).toString();
    router.push(`/properties?${query}`);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form
        onSubmit={handleSearch}
        className="flex w-full items-center rounded-full bg-white p-2 shadow-lg"
      >
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="search-city"
            placeholder="Enter an address, neighborhood, city, or ZIP code"
            className="pl-12 pr-4 h-12 text-base rounded-full border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="rounded-full px-8 text-base h-12"
        >
          Search
        </Button>
      </form>
      <div className="mt-4 flex items-center justify-center gap-x-6 text-sm text-white">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-white" />
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
