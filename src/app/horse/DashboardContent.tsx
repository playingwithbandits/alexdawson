"use client";

import { DayPredictions } from "@/components/horse/DayPredictions";
import { Meeting, RaceResults, DayTips } from "@/types/racing";

interface DashboardContentProps {
  meetings: Meeting[];
  date: string;
  results: RaceResults | undefined;
  tips: DayTips | null;
}

export function DashboardContent({
  meetings,
  date,
  results,
  tips,
}: DashboardContentProps) {
  return (
    <DayPredictions
      meetings={meetings}
      date={date}
      results={results}
      tips={tips}
    />
  );
}
