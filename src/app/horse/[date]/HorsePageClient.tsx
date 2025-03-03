"use client";

import {
  Meeting,
  DayTips,
  GytoTips,
  NapsTableTips,
  NonRunnerMeeting,
} from "@/types/racing";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardContent } from "../DashboardContent";
import { useResults } from "@/hooks/useResults";

export const UK_COURSES = [
  "ascot",
  "ayr",
  "bangor",
  "bath",
  "beverley",
  "brighton",
  "carlisle",
  "cartmel",
  "catterick",
  "chelmsford",
  "cheltenham",
  "chepstow",
  "chester",
  "doncaster",
  "epsom",
  "exeter",
  "fakenham",
  "ffos las",
  "fontwell",
  "goodwood",
  "hamilton",
  "haydock",
  "hexham",
  "huntingdon",
  "kelso",
  "kempton",
  "leicester",
  "lingfield",
  "ludlow",
  "market rasen",
  "musselburgh",
  "newbury",
  "newcastle",
  "newmarket",
  "newton abbot",
  "nottingham",
  "perth",
  "plumpton",
  "pontefract",
  "redcar",
  "ripon",
  "salisbury",
  "sandown",
  "sedgefield",
  "southwell",
  "stratford",
  "taunton",
  "thirsk",
  "uttoxeter",
  "warwick",
  "wetherby",
  "wincanton",
  "windsor",
  "wolverhampton",
  "worcester",
  "yarmouth",
  "york",
  "hereford",
  "towcester",
  "aintree",
  "folkestone",
  "great leighs",
  "rothwell",
  "southport",
  "thurles",
];

export function HorsePageClient({ date }: { date: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tips, setTips] = useState<DayTips | null>(null);
  const [gytoTips, setGytoTips] = useState<GytoTips | undefined>(undefined);
  const [napsTableTips, setNapsTableTips] = useState<NapsTableTips | undefined>(
    undefined
  );
  const [nonRunners, setNonRunners] = useState<NonRunnerMeeting[]>([]);
  const { data: results, isLoading: resultsLoading } = useResults(date);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Check if results file exists and has content
        const resultsResponse = await fetch(`/api/racing/results/${date}`);
        const resultsData = await resultsResponse.json();

        if (
          !resultsData ||
          !resultsData.results ||
          resultsData.results.length === 0
        ) {
          await fetch(`/api/racing/results/fetch?date=${date}`);
        }

        // Fetch non-runners data
        const nonRunnersResponse = await fetch(
          `/api/racing/nonrunners/fetch?date=${date}`
        );
        const nonRunnersData = await nonRunnersResponse.json();
        setNonRunners(nonRunnersData);

        // Fetch racing data
        const response = await fetch(`/api/racing?date=${date}`);
        const data = await response.json();

        // Fetch ATR tips
        const tipsResponse = await fetch(`/api/racing/atr/${date}`);
        const tipsData = await tipsResponse.json();
        setTips(tipsData);

        // Fetch GYTO tips
        const gytoResponse = await fetch(`/api/racing/gyto/${date}`);
        const gytoData = await gytoResponse.json();
        setGytoTips(gytoData);

        // Fetch naps table tips
        const napsResponse = await fetch(`/api/racing/naps/${date}`);
        const napsData = await napsResponse.json();
        setNapsTableTips(napsData);

        if (data) {
          setMeetings(data);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [date]);

  if (loading || resultsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;
  if (meetings.length === 0) return <div>Loading...</div>;

  console.log("nonRunners", nonRunners);
  return (
    <DashboardContent
      meetings={meetings}
      date={date}
      results={results}
      tips={tips}
      gytoTips={gytoTips?.tips}
      napsTableTips={napsTableTips?.tips}
      nonRunners={nonRunners}
    />
  );
}
