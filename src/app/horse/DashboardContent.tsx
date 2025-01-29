"use client";

import { Meeting } from "@/app/rp/utils/parseMeetings";
import { DayPredictions } from "@/components/horse/DayPredictions";

interface DashboardContentProps {
  meetings: Meeting[];
  date: string;
}

export function DashboardContent({ meetings, date }: DashboardContentProps) {
  return <DayPredictions meetings={meetings} date={date} />;
}
