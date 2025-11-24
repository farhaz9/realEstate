import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, inCrores: boolean = false) {
  const amount = inCrores ? price : price / 10000000;
  if (amount >= 1) {
    return `₹${amount.toFixed(2)} Cr`;
  } else {
    const priceInLakhs = amount * 100;
    return `₹${priceInLakhs.toFixed(0)} Lakhs`;
  }
}
