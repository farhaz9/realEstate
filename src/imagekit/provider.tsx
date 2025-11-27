
'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import ImageKit from 'imagekit-javascript';

// Define the shape of the context state
interface ImageKitContextState {
  imageKit: ImageKit | null;
  publicKey: string | null;
  urlEndpoint: string | null;
}

// Create the context with an initial undefined value
const ImageKitContext = createContext<ImageKitContextState | undefined>(undefined);

interface ImageKitProviderProps {
  children: ReactNode;
}

/**
 * ImageKitProvider component to initialize and provide the ImageKit instance.
 */
export const ImageKitProvider: React.FC<ImageKitProviderProps> = ({ children }) => {
  const imageKitState = useMemo(() => {
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

    if (!urlEndpoint || !publicKey) {
      console.warn(
        'ImageKit is not fully configured. Please set NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT and NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY in your environment variables.'
      );
      return { imageKit: null, publicKey: null, urlEndpoint: null };
    }
    
    // For client-side uploads, you only need the urlEndpoint.
    // The authenticationEndpoint should be set up on your ImageKit dashboard
    // to allow unauthenticated uploads for this to work without a backend.
    const imageKit = new ImageKit({
      urlEndpoint: urlEndpoint,
      publicKey: publicKey,
    });

    return { imageKit, publicKey, urlEndpoint };
  }, []);

  return (
    <ImageKitContext.Provider value={imageKitState}>
      {children}
    </ImageKitContext.Provider>
  );
};

/**
 * Custom hook to access the ImageKit instance from the context.
 * Throws an error if used outside of an ImageKitProvider.
 */
export const useImageKit = (): ImageKitContextState => {
  const context = useContext(ImageKitContext);

  if (context === undefined) {
    throw new Error('useImageKit must be used within an ImageKitProvider.');
  }

  return context;
};
