"use client";

import { DayPredictions } from "@/components/horse/DayPredictions";
import {
  Meeting,
  RaceResults,
  DayTips,
  GytoTip,
  NapsTableTip,
  NonRunnerMeeting,
  RtWebTip,
  OLBGTip,
} from "@/types/racing";

interface LiveOdds {
  horseName: string;
  odds: number;
  time: string;
  course: string;
}

interface DashboardContentProps {
  meetings: Meeting[];
  date: string;
  results: RaceResults | undefined;
  tips: DayTips | null;
  gytoTips: GytoTip[] | undefined;
  napsTableTips: NapsTableTip[] | undefined;
  nonRunners: NonRunnerMeeting[];
  liveOdds: LiveOdds[];
  rtWebTips: RtWebTip[] | undefined;
  olbgTips: OLBGTip[] | undefined;
}

export function DashboardContent({
  meetings,
  date,
  results,
  tips,
  gytoTips,
  napsTableTips,
  nonRunners,
  liveOdds,
  rtWebTips,
  olbgTips,
}: DashboardContentProps) {
  return (
    <DayPredictions
      meetings={meetings}
      date={date}
      results={results}
      tips={tips}
      gytoTips={gytoTips}
      napsTableTips={napsTableTips}
      nonRunners={nonRunners}
      liveOdds={liveOdds}
      rtWebTips={rtWebTips}
      olbgTips={olbgTips}
    />
  );
}
