"use client";

import { DayPredictions } from "@/components/horse/DayPredictions";
import { Meeting, RaceResults } from "@/types/racing";

interface DashboardContentProps {
  meetings: Meeting[];
  date: string;
  results: RaceResults | undefined;
}

export function DashboardContent({
  meetings,
  date,
  results,
}: DashboardContentProps) {
  return <DayPredictions meetings={meetings} date={date} results={results} />;
}
