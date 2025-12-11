
'use client';

import { useGeolocation } from '@/hooks/use-geolocation';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, AlertTriangle, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function LocationDisplay() {
  const { city, error, isLoading, canAskPermission, requestPermission } = useGeolocation();

  const handleClick = () => {
    if (canAskPermission && error !== 'Location permission denied.') {
      requestPermission();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Detecting location...</span>
        </div>
      );
    }

    if (error === 'Location permission denied.') {
       return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div 
                      onClick={handleClick} 
                      className="flex items-center gap-2 text-sm text-destructive h-auto p-1 cursor-pointer rounded-md hover:bg-destructive/10"
                    >
                        <AlertTriangle className="mr-1 h-4 w-4" />
                        Location Denied
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs">
                      Location access is blocked. Go to your browser's site settings for this page to allow it.
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
       )
    }
    
    if (error) {
       return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <div 
                      onClick={handleClick}
                      className="flex items-center gap-2 text-sm text-destructive h-auto p-1 cursor-pointer rounded-md hover:bg-destructive/10"
                    >
                        <AlertTriangle className="mr-1 h-4 w-4" />
                        Location Error
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{error}</p>
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
                    <Button variant="ghost" size="sm" className="text-sm text-primary font-semibold h-auto p-1">
                        <MapPin className="mr-2" />
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
                        <Button variant="ghost" size="sm" onClick={handleClick} className="text-sm h-auto p-1">
                            <MapPin className="mr-2" />
                            Detect Location
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Click to allow location access and find properties near you.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }
    
    // Fallback for any other unhandled case, though it's unlikely to be reached.
    return (
       <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-muted-foreground/60 px-3 py-1.5 cursor-help">
                        <HelpCircle className="h-4 w-4" />
                        <span className="text-sm">Location Unavailable</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Could not determine your location.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
  };

  return <div className="flex items-center h-full">{renderContent()}</div>;
}
