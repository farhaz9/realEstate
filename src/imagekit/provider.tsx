
'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import ImageKit from 'imagekit-javascript';

// Define the shape of the context state
interface ImageKitContextState {
  imageKit: ImageKit | null;
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
  const imageKitInstance = useMemo(() => {
    // IMPORTANT: You must create this environment variable.
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

    if (!urlEndpoint) {
      console.warn(
        'ImageKit URL-endpoint is not configured. Please set NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT in your environment variables.'
      );
      return null;
    }

    // For client-side uploads, you only need the urlEndpoint.
    // The authenticationEndpoint should be set up on your ImageKit dashboard
    // to allow unauthenticated uploads for this to work without a backend.
    return new ImageKit({
      urlEndpoint: urlEndpoint,
    });
  }, []);

  const contextValue = useMemo(() => ({
    imageKit: imageKitInstance
  }), [imageKitInstance]);

  return (
    <ImageKitContext.Provider value={contextValue}>
      {children}
    </ImageKitContext.Provider>
  );
};

/**
 * Custom hook to access the ImageKit instance from the context.
 * Throws an error if used outside of an ImageKitProvider.
 */
export const useImageKit = (): ImageKit | null => {
  const context = useContext(ImageKitContext);

  if (context === undefined) {
    throw new Error('useImageKit must be used within an ImageKitProvider.');
  }

  return context.imageKit;
};
