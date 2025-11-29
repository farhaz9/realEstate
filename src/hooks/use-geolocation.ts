
'use client';

import { useState, useEffect } from 'react';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const LOCATION_STORAGE_KEY = 'user_geolocation';
const PERMISSION_STORAGE_KEY = 'geolocation_permission_status';

interface LocationData {
  city: string | null;
  state: string | null;
  country: string | null;
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

    const handleSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch location data from Google Maps API.');
        }

        const data = await response.json();
        if (data.status !== 'OK') {
          throw new Error(data.error_message || 'Geocoding failed.');
        }

        const addressComponents = data.results[0]?.address_components;
        if (!addressComponents) {
          throw new Error('Could not parse address components.');
        }

        const city =
          addressComponents.find((c: any) => c.types.includes('locality'))?.long_name || null;
        const state =
          addressComponents.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name || null;
        const country =
          addressComponents.find((c: any) => c.types.includes('country'))?.long_name || null;

        const locationData: LocationData = { city, state, country };
        setLocation(locationData);
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
        localStorage.setItem(PERMISSION_STORAGE_KEY, 'granted');
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to reverse geocode.');
      } finally {
        setIsLoading(false);
      }
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

    