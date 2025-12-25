
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Dumbbell, ParkingSquare, Wifi, Tv, Trees, Wind, Droplets, Utensils, Refrigerator, Building2 } from 'lucide-react';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, inCrores: boolean = false, isMax: boolean = false) {
  if (inCrores) {
    if (price === 20 && isMax) return '₹20 Cr+'
    return `₹${price.toFixed(price % 1 === 0 ? 0 : 1)} Cr`;
  }

  if (price >= 10000000) { // If price is 1 Cr or more
    const amount = price / 10000000;
    // Use toFixed(2) to show precision, then remove trailing .00
    const formattedAmount = amount.toFixed(2).replace(/\.00$/, '');
    return `₹${formattedAmount} Cr`;
  } else if (price >= 100000) { // If price is 1 Lakh or more
    const amount = price / 100000;
    const formattedAmount = amount.toFixed(2).replace(/\.00$/, '');
    return `₹${formattedAmount} Lac`;
  } else {
    return `₹${price.toLocaleString('en-IN')}`;
  }
}

const amenityIcons: { [key: string]: React.ElementType } = {
  'gym': Dumbbell,
  'swimming pool': Droplets,
  'parking': ParkingSquare,
  'wifi': Wifi,
  'tv': Tv,
  'park': Trees,
  'air conditioning': Wind,
  'kitchen': Utensils,
  'refrigerator': Refrigerator,
};

export const getAmenityIcon = (amenity: string) => {
  const normalizedAmenity = amenity.toLowerCase();
  // Find a matching key in our icon map
  const iconKey = Object.keys(amenityIcons).find(key => normalizedAmenity.includes(key));
  return iconKey ? amenityIcons[iconKey] : Building2; // Return a default icon if no match
};
