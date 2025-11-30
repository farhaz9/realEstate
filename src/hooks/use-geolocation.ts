
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
        if (!response.ok) {
          throw new Error(`Reverse geocoding failed with status: ${response.status}`);
        }
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
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const handleSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const locationData: LocationData = { latitude, longitude };
      
      setLocation(locationData);
      try {
        const fetchedCity = await getCityFromCoordinates(latitude, longitude);
        if (fetchedCity) {
            setCity(fetchedCity);
            setError(null);
        } else {
            setError("Could not determine city name.");
        }
      } catch (e) {
         setError("Failed to fetch city.");
      } finally {
        setIsLoading(false);
      }
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
    if (canAskPermission) {
        getGeolocation();
    }
  }, [getGeolocation, canAskPermission]);

  useEffect(() => {
    let isMounted = true;

    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (!isMounted) return;
        
        const updateState = () => {
            setCanAskPermission(permissionStatus.state !== 'denied');
            
            if (permissionStatus.state === 'granted') {
              getGeolocation();
            } else {
              setIsLoading(false); 
              if (permissionStatus.state === 'denied') {
                 setError('Location permission is denied.');
                 setLocation(null);
                 setCity(null);
              } else { // 'prompt'
                 setError(null);
                 setLocation(null);
                 setCity(null);
              }
            }
        }

        updateState();
        permissionStatus.onchange = updateState;
      });
    } else {
      setIsLoading(false);
      setError('Permissions API is not supported.');
    }

    return () => {
        isMounted = false;
    }
  }, [getGeolocation]);

  return { location, city, error, isLoading, canAskPermission, requestPermission };
}
