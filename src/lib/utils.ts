import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCrore(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L Cr`;
  if (value >= 1000)   return `₹${(value / 1000).toFixed(2)}K Cr`;
  return `₹${value.toFixed(2)} Cr`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

export function formatPrice(value: number): string {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
