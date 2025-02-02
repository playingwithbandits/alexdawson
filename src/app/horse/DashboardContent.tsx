"use client";

import { DayPredictions } from "@/components/horse/DayPredictions";
import {
  Meeting,
  RaceResults,
  DayTips,
  GytoTip,
  NapsTableTip,
} from "@/types/racing";

interface DashboardContentProps {
  meetings: Meeting[];
  date: string;
  results: RaceResults | undefined;
  tips: DayTips | null;
  gytoTips: GytoTip[] | undefined;
  napsTableTips: NapsTableTip[] | undefined;
}

export function DashboardContent({
  meetings,
  date,
  results,
  tips,
  gytoTips,
  napsTableTips,
}: DashboardContentProps) {
  return (
    <DayPredictions
      meetings={meetings}
      date={date}
      results={results}
      tips={tips}
      gytoTips={gytoTips}
      napsTableTips={napsTableTips}
    />
  );
}
