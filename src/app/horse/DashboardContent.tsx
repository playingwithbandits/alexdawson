"use client";

import { DayPredictions } from "@/components/horse/DayPredictions";
import { Meeting } from "@/types/racing";

interface DashboardContentProps {
  meetings: Meeting[];
  date: string;
}

export function DashboardContent({ meetings, date }: DashboardContentProps) {
  return <DayPredictions meetings={meetings} date={date} />;
}
