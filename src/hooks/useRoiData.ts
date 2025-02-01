import { useEffect, useState } from "react";

export interface RoiEntry {
  date: string;
  roi: number;
  wins: number;
  total: number;
  totalReturns: number;
  totalBets: number;
}

export function useRoiData() {
  const [data, setData] = useState<RoiEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/racing/roi");
        if (!response.ok) throw new Error("Failed to fetch ROI data");
        const { entries } = await response.json();
        setData(entries);
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
