import { avg } from "@/lib/utils";

// Add helper function
export function calculateVariance(numbers: number[]): number {
  const mean = avg(numbers);
  const squareDiffs = numbers.map((n) => Math.pow(n - mean, 2));
  return avg(squareDiffs);
}

export function calculateDaysOff(raceDate?: string): number {
  if (!raceDate) return 0;
  const raceTime = new Date(raceDate).getTime();
  const now = new Date().getTime();
  return Math.floor((now - raceTime) / (1000 * 60 * 60 * 24));
}

export const horseNameToKey = (horse_name: string) => {
  const input = horse_name.trim();
  const output = input
    .toLowerCase()
    .replace(/[(]*nap[)]*$/gi, "")
    .replace(/'/gi, "")
    .replace(/\s+/g, "")
    .trim();

  return output;
};
export const placeToPlaceKey = (m_place: string) => {
  let place_out = m_place;
  if (m_place) {
    place_out = m_place
      .toLowerCase()
      .trim()
      .replace("_on_dee", "")
      .replace("-on-dee", "")
      .replace(" (aw)", "-aw")
      .replace("-aw", "")
      .replace("_", "-")
      .replace("-city", "")
      .replace(/\s+/g, "-")
      .trim();
  }
  return place_out;
};
