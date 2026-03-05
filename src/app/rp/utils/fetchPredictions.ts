import type { PredictionRunner } from "@/types/racing";

const predictionsCache = new Map<string, PredictionRunner[]>();

function cacheKey(raceId: string): string {
  return raceId;
}

export function getPredictionsCacheSnapshot(): Record<
  string,
  PredictionRunner[]
> {
  return Object.fromEntries(predictionsCache.entries());
}

export function hydratePredictionsCache(
  data: Record<string, PredictionRunner[]> | null | undefined,
): void {
  if (!data || typeof data !== "object") return;
  for (const [key, value] of Object.entries(data)) {
    predictionsCache.set(key, value);
  }
}

export async function loadPredictionsCache(date: string): Promise<void> {
  try {
    console.log("🔍 Loading predictions cache for date:", date);
    const res = await fetch(`/api/predictions?date=${date}`);

    if (!res.ok) {
      console.log(
        "❌ Failed to load predictions cache:",
        res.status,
        res.statusText,
      );
      return;
    }

    const data = (await res.json()) as
      | Record<string, PredictionRunner[]>
      | null;

    if (data) {
      console.log(
        "✅ Hydrating predictionsCache from dated cache",
        Object.keys(data).length,
      );
      hydratePredictionsCache(data);
    } else {
      console.log(
        "ℹ️ No existing predictions cache file for date:",
        date,
      );
    }
  } catch (error) {
    console.error("❌ Error loading predictions cache:", error);
  }
}

export async function savePredictionsCache(date: string): Promise<void> {
  try {
    const cacheSnapshot = getPredictionsCacheSnapshot();
    const keys = Object.keys(cacheSnapshot || {});

    if (!keys.length) {
      console.log("ℹ️ No predictions cache to save for date:", date);
      return;
    }

    console.log(
      `💾 Saving predictionsCache with ${keys.length} entries for date: ${date}`,
    );

    await fetch(`/api/predictions?date=${date}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cacheSnapshot),
    });
  } catch (error) {
    console.error("❌ Failed to save predictions cache:", error);
  }
}

export async function fetchPredictions(
  raceId: string,
): Promise<PredictionRunner[]> {
  const key = cacheKey(raceId);
  const cached = predictionsCache.get(key);
  if (cached) {
    console.log(
      `✅ fetchPredictions resolved from cache for raceId=${raceId}`,
    );
    return cached;
  }

  try {
    const response = await fetch(
      `/getP.php?q=${encodeURIComponent(
        `https://alexdawson.co.uk/getP.php?q=https://www.racingpost.com/horses/predictor/proxy/${raceId}`,
      )}`,
    );
    const data = await response.json();

    if (!data?.data?.runners) return [] as PredictionRunner[];

    const runners = data.data.runners as PredictionRunner[];
    predictionsCache.set(key, runners);

    return runners;
  } catch (error) {
    console.error("Failed to fetch predictions:", error);
    return [];
  }
}
