
'use client';

import { useState, useEffect, useCallback } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface GeolocationResult {
  location: LocationData | null;
  city: string | null;
  error: string | null;
  isLoading: boolean;
  canAskPermission: boolean;
  requestPermission: () => void;
}

const getCityFromCoordinates = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        if (data && data.address) {
            return data.address.city || data.address.town || data.address.village || data.address.state;
        }
        return null;
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        return null;
    }
};

export function useGeolocation(): GeolocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [canAskPermission, setCanAskPermission] = useState<boolean>(false);

  const getGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const handleSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const locationData: LocationData = { latitude, longitude };
      
      setLocation(locationData);
      const fetchedCity = await getCityFromCoordinates(latitude, longitude);
      setCity(fetchedCity);

      setError(null);
      setIsLoading(false);
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'An unknown error occurred.';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied.';
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

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 600000,
    });
  }, []);

  const requestPermission = useCallback(() => {
    getGeolocation();
  }, [getGeolocation]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        setCanAskPermission(permissionStatus.state !== 'denied');

        if (permissionStatus.state === 'granted') {
          getGeolocation();
        } else {
          setIsLoading(false); // Not granted, so stop loading
          if (permissionStatus.state === 'denied') {
             setError('Location permission has been denied.');
          }
        }

        permissionStatus.onchange = () => {
          setCanAskPermission(permissionStatus.state !== 'denied');
          if (permissionStatus.state === 'granted') {
            getGeolocation();
          } else {
             setIsLoading(false);
             if (permissionStatus.state === 'denied') {
                setError('Location permission has been denied.');
                setLocation(null);
                setCity(null);
             } else {
                // state is 'prompt'
                setError(null);
                setLocation(null);
                setCity(null);
             }
          }
        };
      });
    } else {
      // Fallback for browsers without Permissions API
      setIsLoading(false);
      setError('Permissions API not supported.');
    }
  }, [getGeolocation]);

  return { location, city, error, isLoading, canAskPermission, requestPermission };
}
