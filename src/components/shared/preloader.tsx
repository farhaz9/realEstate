
'use client';

import { useState, useEffect } from 'react';
import { Logo } from './logo';
import { WaveLoader } from '@/components/ui/wave-loader';

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => {
        setLoading(false);
      }, 1500); // Ensures preloader is visible for a minimum duration
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <Logo size="large" />
        <div className="mt-4">
            <WaveLoader />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
