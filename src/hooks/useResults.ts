import { useState, useEffect } from "react";
import { RaceResults } from "@/types/racing";

export function useResults(date: string) {
  const [data, setData] = useState<RaceResults | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`/api/racing/results/${date}`);
        if (!response.ok) throw new Error("Failed to fetch results");
        const resultsData = await response.json();
        setData(resultsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [date]);

  return { data, isLoading, error };
}
