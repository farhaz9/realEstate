
'use client';

import { useState, useEffect } from 'react';

const LOCATION_STORAGE_KEY = 'user_geolocation_coords';
const PERMISSION_STORAGE_KEY = 'geolocation_permission_status';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface GeolocationResult {
  location: LocationData | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation(): GeolocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if location is already stored
    const storedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (storedLocation) {
      setLocation(JSON.parse(storedLocation));
      setIsLoading(false);
      return;
    }

    // Check if permission has been denied before
    const permissionStatus = localStorage.getItem(PERMISSION_STORAGE_KEY);
    if (permissionStatus === 'denied') {
      setError('Location permission was previously denied.');
      setIsLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const locationData: LocationData = { latitude, longitude };
      
      setLocation(locationData);
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
      localStorage.setItem(PERMISSION_STORAGE_KEY, 'granted');
      setError(null);
      setIsLoading(false);
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'An unknown error occurred.';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied.';
          localStorage.setItem(PERMISSION_STORAGE_KEY, 'denied');
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'The request to get user location timed out.';
          break;
      }
      setError(errorMessage);
      setIsLoading(false);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  }, []);

  return { location, error, isLoading };
}
