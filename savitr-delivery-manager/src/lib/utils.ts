import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to combine class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique tracking ID for a delivery
 * @returns A unique tracking ID string
 */
export function generateTrackingId(): string {
  const prefix = 'SAV';
  const randomNum = Math.floor(100000000 + Math.random() * 900000000);
  return `${prefix}${randomNum}`;
}

/**
 * Format a date string to a more readable format
 * @param date Date string in ISO format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get the base URL for the application
 * @returns The base URL string
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Browser environment
    return window.location.origin;
  }
  // Server environment
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
