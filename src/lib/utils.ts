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
/**
 * Maps race type codes to arrays of similar/equivalent codes
 *
 * Examples:
 * raceTypeCodesToSimilarRaceTypeCodes("H") => ["p", "h"] // Hurdle races
 * raceTypeCodesToSimilarRaceTypeCodes("C") => ["c", "u"] // Chase races
 * raceTypeCodesToSimilarRaceTypeCodes("F") => ["f", "b"] // Flat races
 * raceTypeCodesToSimilarRaceTypeCodes("X") => ["w", "x"] // All-weather races
 */

const hurdlesRaceTypeCodes = ["p", "h"];
const chaseRaceTypeCodes = ["c", "u"];
const flatRaceTypeCodes = ["f", "b"];
const allWeatherRaceTypeCodes = ["w", "x", "a"];

const jumpsRaceTypes = [...hurdlesRaceTypeCodes, ...chaseRaceTypeCodes];
const flatRaceTypes = [...flatRaceTypeCodes, ...allWeatherRaceTypeCodes];

const raceTypeCodesToSimilarRaceTypeCodes = (
  raceTypeCode: string
): string[] => {
  const raceTypeCodeNormalised = raceTypeCode.toLowerCase().trim();

  const raceTypeCodesToSimilarRaceTypeCodesMap: Record<string, string[]> = {
    p: ["p", "h"], //hurdle
    h: ["p", "h"],
    c: ["c", "u"], //chase
    u: ["c", "u"],
    f: flatRaceTypes, //["f", "b"], //flat
    b: flatRaceTypes, //["f", "b"],
    w: flatRaceTypes, //["w", "x"], //aw
    x: flatRaceTypes, //["w", "x"], //aw
  };
  return raceTypeCodesToSimilarRaceTypeCodesMap[raceTypeCodeNormalised] || [];
};

/**
 * Checks if two race type codes match by comparing their similar/equivalent codes
 *
 * Examples:
 * matchRaceTypeCode("H", "P") => true  // Both are hurdle races
 * matchRaceTypeCode("C", "U") => true  // Both are chase races
 * matchRaceTypeCode("F", "B") => true  // Both are flat races
 * matchRaceTypeCode("W", "X") => true  // Both are all-weather races
 * matchRaceTypeCode("H", "C") => false // Hurdle vs Chase
 * matchRaceTypeCode("F", "X") => false // Flat vs All-weather
 * matchRaceTypeCode(undefined, "H") => false // Invalid input
 */
export const matchRaceTypeCode = (
  raceTypeCode1: string | undefined,
  raceTypeCode2: string | undefined
): boolean => {
  if (!raceTypeCode1 || !raceTypeCode2) return false;

  const raceTypeCode1Normalised = raceTypeCode1.toLowerCase().trim();
  const raceTypeCode2Normalised = raceTypeCode2.toLowerCase().trim();

  const raceTypeCode1Similar = raceTypeCodesToSimilarRaceTypeCodes(
    raceTypeCode1Normalised
  );
  const raceTypeCode2Similar = raceTypeCodesToSimilarRaceTypeCodes(
    raceTypeCode2Normalised
  );

  return raceTypeCode1Similar?.some((x) => raceTypeCode2Similar.includes(x));
};
/**
 * Checks if a horse's average race distance is within an acceptable tolerance of a race distance
 *
 * The tolerance increases with race distance, calibrated so that:
 * - 8f has ±1f tolerance
 * - 20f has ±2f tolerance
 *
 * Examples of acceptable ranges (in furlongs):
 *
 * Race Distance | Tolerance | Acceptable Range
 * 5f  | ±0.63f | 4.37f - 5.63f
 * 7f  | ±0.88f | 6.12f - 7.88f
 * 8f  | ±1.00f | 7.00f - 9.00f
 * 9f  | ±1.13f | 7.87f - 10.13f
 * 10f | ±1.25f | 8.75f - 11.25f
 * 12f | ±1.50f | 10.50f - 13.50f
 * 14f | ±1.75f | 12.25f - 15.75f
 * 16f | ±1.88f | 14.12f - 17.88f
 * 20f | ±2.00f | 18.00f - 22.00f
 * 24f | ±2.25f | 21.75f - 26.25f
 * 28f | ±2.50f | 25.50f - 30.50f
 * 30f | ±2.63f | 27.37f - 32.63f
 */
export const distanceOkay = (
  horsesAverageDistanceRanOver: number | undefined,
  raceDistance: number | undefined
): boolean => {
  if (!Boolean(raceDistance) || !Boolean(horsesAverageDistanceRanOver))
    return false;

  const raceDistanceF = raceDistance || 0;
  const horseAvgDistanceF = horsesAverageDistanceRanOver || 0;

  const maxThresholdAdd = raceDistanceF < 8 ? 1 : raceDistanceF < 21 ? 2 : 3;
  const minThresholdAdd =
    raceDistanceF < 7
      ? 0.33
      : raceDistanceF < 8
      ? 0.5
      : raceDistanceF < 13
      ? 1
      : 2;

  const maxThreshold = raceDistanceF + maxThresholdAdd;
  const minThreshold = raceDistanceF - minThresholdAdd;

  return horseAvgDistanceF >= minThreshold && horseAvgDistanceF <= maxThreshold;
};
