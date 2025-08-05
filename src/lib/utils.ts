import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function min(nums: number[]): number {
  const filteredNums = nums?.filter(Boolean) || [];
  return filteredNums.length
    ? filteredNums.reduce((a, b) => (a < b ? a : b))
    : 0;
}

export function max(nums: number[]): number {
  const filteredNums = nums?.filter(Boolean) || [];
  return filteredNums.length
    ? filteredNums.reduce((a, b) => (a > b ? a : b))
    : 0;
}

export function avg(nums: number[]): number {
  const filteredNums = nums?.filter(Boolean) || [];
  return filteredNums.length
    ? filteredNums.reduce((a, b) => a + b) / filteredNums.length
    : 0;
}

export function sum(nums: number[]): number {
  const filteredNums = nums?.filter(Boolean) || [];
  return filteredNums.reduce((a, b) => a + b, 0);
}

export function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}
