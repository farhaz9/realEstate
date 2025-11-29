
'use client';

import { useState, useEffect } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface GeolocationResult {
  location: LocationData | null;
  error: string | null;
  isLoading: boolean;
  canAskPermission: boolean;
}

export function useGeolocation(): GeolocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [canAskPermission, setCanAskPermission] = useState<boolean>(false);

  useEffect(() => {
    const getGeolocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        setIsLoading(false);
        return;
      }

      const handleSuccess = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        const locationData: LocationData = { latitude, longitude };
        
        setLocation(locationData);
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
        maximumAge: 600000, // Cache for 10 minutes
      });
    };

    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        setCanAskPermission(permissionStatus.state !== 'denied');

        if (permissionStatus.state === 'granted') {
          getGeolocation();
        } else if (permissionStatus.state === 'prompt') {
          // If the state is 'prompt', we can try to get the location,
          // which will trigger the browser's permission prompt.
          getGeolocation();
        } else {
          // State is 'denied'
          setError('Location permission has been denied.');
          setIsLoading(false);
        }

        permissionStatus.onchange = () => {
          setCanAskPermission(permissionStatus.state !== 'denied');
          if (permissionStatus.state === 'granted') {
            getGeolocation();
          } else if (permissionStatus.state === 'denied') {
            setError('Location permission has been denied.');
            setLocation(null);
            setIsLoading(false);
          }
        };
      });
    } else {
      // Fallback for browsers that do not support the Permissions API
      getGeolocation();
    }
  }, []);

  return { location, error, isLoading, canAskPermission };
}
