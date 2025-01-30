import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b) / nums.length : 0;
}

export function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

export function normalize(value: number, avg: number): number {
  return avg ? value / avg : 0;
}
