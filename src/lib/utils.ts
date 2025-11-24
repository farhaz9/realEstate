import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, inCrores: boolean = false) {
  if (price >= 10000000) { // If price is 1 Cr or more
    const amount = price / 10000000;
    return `₹${amount.toFixed(2)} Cr`;
  } else if (price >= 100000) { // If price is 1 Lakh or more
    const amount = price / 100000;
    return `₹${amount.toFixed(2)} Lakhs`;
  } else {
    return `₹${price.toLocaleString('en-IN')}`;
  }
}
