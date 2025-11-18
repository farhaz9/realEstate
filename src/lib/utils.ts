import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(priceInCrores: number) {
  if (priceInCrores >= 1) {
    return `₹${priceInCrores.toFixed(2)} Cr`;
  } else {
    const priceInLakhs = priceInCrores * 100;
    return `₹${priceInLakhs.toFixed(0)} Lakhs`;
  }
}
