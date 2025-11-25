
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const circumference = 2 * Math.PI * 20; // 2 * pi * radius (where radius is 20)
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPosition = window.scrollY;
      
      if (totalHeight > 0) {
        const scrollPercentage = (scrollPosition / totalHeight) * 100;
        setProgress(scrollPercentage);
      } else {
        setProgress(0);
      }
      
      setIsVisible(scrollPosition > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-20 md:bottom-8 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-lg transition-all duration-300',
        'hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
      )}
      aria-label="Scroll to top"
    >
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r="20"
          strokeWidth="3"
          className="stroke-primary/20 fill-none"
        />
        <circle
          cx="22"
          cy="22"
          r="20"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="stroke-primary fill-none transition-all duration-300 ease-linear"
        />
      </svg>
      <div className="absolute flex h-full w-full items-center justify-center">
        <ArrowUp className="h-5 w-5 text-primary" />
      </div>
    </button>
  );
}
