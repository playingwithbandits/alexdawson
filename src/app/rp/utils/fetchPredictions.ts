import type { PredictionRunner } from "@/types/racing";

export async function fetchPredictions(raceId: string) {
  try {
    const response = await fetch(
      `/getP.php?q=${encodeURIComponent(
        `https://www.racingpost.com/horses/predictor/proxy/${raceId}?time=${new Date().getMilliseconds()}`
      )}`
    );
    const data = await response.json();

    if (!data?.data?.runners) return [] as PredictionRunner[];

    return data.data.runners as PredictionRunner[];
  } catch (error) {
    console.error("Failed to fetch predictions:", error);
    return [];
  }
}
