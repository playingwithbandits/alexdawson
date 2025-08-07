import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { placeToPlaceKey } from "./racing/scores/funcs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function min(nums: number[]): number {
  const filteredNums = nums?.filter(Boolean) || [];
  return filteredNums.length
    ? filteredNums.reduce((a, b) => (a < b ? a : b), filteredNums[0])
    : 0;
}

export function max(nums: number[]): number {
  const filteredNums = nums?.filter(Boolean) || [];
  return filteredNums.length
    ? filteredNums.reduce((a, b) => (a > b ? a : b), filteredNums[0])
    : 0;
}

export function avg(nums: number[]): number {
  const filteredNums = nums?.filter(Boolean) || [];
  return filteredNums.length
    ? filteredNums.reduce((a, b) => a + b, 0) / filteredNums.length
    : 0;
}

export function sum(nums: number[]): number {
  const filteredNums = nums?.filter(Boolean) || [];
  return filteredNums.reduce((a, b) => a + b, 0);
}

export function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

/**
 * Returns an array of the most frequently occurring strings in the input array.
 *
 * Examples:
 * mostFrequentString(['a', 'b', 'a', 'c']) => ['a']
 * mostFrequentString(['a', 'b', 'b', 'a']) => ['a', 'b']
 * mostFrequentString(['x', 'y']) => ['x', 'y']
 * mostFrequentString([]) => []
 */
export function mostFrequentString(arr: string[]): string[] {
  if (!arr.length) return [];

  // Create frequency map
  const frequencyMap = new Map<string, number>();
  arr.forEach((item) => {
    frequencyMap.set(item, (frequencyMap.get(item) || 0) + 1);
  });

  // Find max frequency
  const entries = Array.from(frequencyMap.entries());
  if (!entries.length) return [];
  const maxFreq = Math.max(...entries.map((e) => e[1]));

  // Return all strings that appear maxFreq times
  return entries
    .filter((entry) => entry[1] === maxFreq)
    .map((entry) => entry[0]);
}

export function courseNameToTrackId(courseName: string): string {
  return placeToPlaceKey(courseName) || "-";
}

export const normaliseGoingToGoingCode = (
  goingCodeOrString: string
): string => {
  const goingMap: Record<string, string> = {
    fast: "f", //done
    standard: "st", //done
    slow: "slw", //done

    firm: "fm", //done
    "good to firm": "gf", //done
    good: "gd", //done
    "good to soft": "gs", //done
    soft: "sft", //done
    "soft to heavy": "vsft", //done
    heavy: "hy", //done

    "good to yielding": "gy", //done
    yielding: "y", //done
    "yielding to soft": "ys", //done
    "very soft": "vsft", //done
  };

  const normalised = goingCodeOrString.toLowerCase().trim();
  return goingMap[normalised] || normalised;
};

const aw_fast = ["f"];
const aw_med = ["st"];
const aw_slow = ["s", "sl"];

const turf_fast = ["gf", "fm", "g", "gd"];
const turf_med = ["g", "gd", "gs"];
const turf_slow = ["y", "sft", "vsft"];
const turf_v_slow = ["hy", "hvy"];

const goingCodeToArrayOfSimilarGoingcodes = (goingCode: string): string[] => {
  const similarCodes = new Set([
    ...(aw_fast.includes(goingCode) ? aw_fast : []),
    ...(aw_med.includes(goingCode) ? aw_med : []),
    ...(aw_slow.includes(goingCode) ? aw_slow : []),
    ...(turf_fast.includes(goingCode) ? turf_fast : []),
    ...(turf_med.includes(goingCode) ? turf_med : []),
    ...(turf_slow.includes(goingCode) ? turf_slow : []),
    ...(turf_v_slow.includes(goingCode) ? turf_v_slow : []),
  ]);
  return Array.from(similarCodes);
};

export const compareTwoGoingCodeArrays = (
  goingCodes1: string[],
  goingCodes2: string[]
): boolean => {
  const goingCodes1Remapped = goingCodes1.map(
    goingCodeToArrayOfSimilarGoingcodes
  );
  const goingCodes2Remapped = goingCodes2.map(
    goingCodeToArrayOfSimilarGoingcodes
  );

  const goingCodes1Set = Array.from(
    new Set(goingCodes1Remapped.flatMap((x) => x))
  );
  const goingCodes2Set = Array.from(
    new Set(goingCodes2Remapped.flatMap((x) => x))
  );

  return goingCodes1Set
    .map((input) => goingCodes2Set.includes(input))
    .some((x) => x);
};
