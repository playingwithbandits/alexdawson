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

// const aw_fast = ["st", "f"];
// const aw_med = ["st"];
// const aw_slow = ["st", "s", "sl"];

// const turf_fast = ["gf", "fm", "g", "gd"];
// const turf_med = ["g", "gd", "gs", "y", "sft"];
// const turf_slow = ["y", "sft", "vsft", "hy", "hvy"];
// const turf_v_slow = ["sft", "vsft", "hy", "hvy"];

// export const GOING_REMAP: { [key: string]: string[] } = {
//   slow: [...aw_slow],
//   "standard to slow": [...aw_slow],
//   standard: [...aw_med],
//   "standard to fast": [...aw_fast],
//   fast: [...aw_fast],

//   firm: [...turf_fast],
//   "good to firm": [...turf_fast],
//   good: [...turf_med],
//   "good to soft": [...turf_med],

//   "good to yielding": [...turf_med],
//   yielding: [...turf_med],
//   "yielding to soft": [...turf_slow],

//   soft: [...turf_slow],
//   "very soft": [...turf_slow],

//   "soft to heavy": [...turf_v_slow],
//   heavy: [...turf_v_slow],
// };

// export function mapGoingCodeToType(goingCode: string): string {
//   const normalizedCode = goingCode.toLowerCase().trim();

//   for (const [type, codes] of Object.entries(GOING_REMAP)) {
//     if (codes.some((code) => normalizedCode.includes(code))) {
//       return type;
//     }
//   }

//   console.log(`ERROR: No going type mapping found for code: ${goingCode}`);
//   return normalizedCode; // Return original if no match
// }
