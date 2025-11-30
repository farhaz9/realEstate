
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { History, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSearches = localStorage.getItem('recentSearches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    }
  }, []);

  const handleSearchClick = (searchTerm: string) => {
    router.push(`/properties?q=${encodeURIComponent(searchTerm)}`);
  };

  if (recentSearches.length === 0) {
    return null; // Don't render the component if there are no recent searches
  }

  return (
    <section id="recent-searches" className="py-16 md:py-24 bg-primary/5">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <History className="h-7 w-7 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold">Your Recent Searches</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {recentSearches.map((searchTerm, index) => (
            <Button
              key={index}
              variant="outline"
              className="rounded-full"
              onClick={() => handleSearchClick(searchTerm)}
            >
              <Search className="mr-2 h-4 w-4" />
              {searchTerm}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
