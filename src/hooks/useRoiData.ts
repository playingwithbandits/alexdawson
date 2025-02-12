import { useEffect, useState } from "react";

interface RoiSource {
  roi: number;
  wins: number;
  total: number;
  totalReturns: number;
  totalBets: number;
}

export interface RoiEntry {
  date: string;
  sources: {
    ai: RoiSource;
    predictions: RoiSource;
    atr: RoiSource;
    timeform: RoiSource;
    gyto: RoiSource;
    naps: RoiSource;
    rp: RoiSource;
  };
}

interface RoiData {
  entries: RoiEntry[];
}

export function useRoiData() {
  const [data, setData] = useState<RoiData>({ entries: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/racing/roi");
        if (!response.ok) throw new Error("Failed to fetch ROI data");
        const roiData = await response.json();
        setData(roiData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load ROI data"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, isLoading, error };
}
