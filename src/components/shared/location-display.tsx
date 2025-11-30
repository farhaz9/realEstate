
'use client';

import { useGeolocation } from '@/hooks/use-geolocation';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function LocationDisplay() {
  const { city, error, isLoading, canAskPermission, requestPermission } = useGeolocation();

  const handleClick = () => {
    if (canAskPermission && !city && !error) {
      requestPermission();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Fetching...</span>
        </div>
      );
    }

    if (error) {
       return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleClick} className="text-sm text-destructive-foreground bg-destructive/80 hover:bg-destructive">
                        <MapPin className="mr-2" />
                        Error
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{error}</p>
                    {canAskPermission && <p>Click to try again.</p>}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
       )
    }

    if (city) {
      return (
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-sm">
                        <MapPin className="mr-2 text-primary" />
                        {city}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Your current location is set to {city}.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      );
    }
    
    if (canAskPermission) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={handleClick} className="text-sm">
                            <MapPin className="mr-2" />
                            Set Location
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Click to allow location access.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }
    
    return null; // Don't render anything if permission is denied and there is no error state
  };

  return <div className="flex items-center">{renderContent()}</div>;
}
