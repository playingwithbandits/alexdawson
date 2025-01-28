"use client";

import { DashboardLayout } from "@/components/horse/DashboardLayout";
import { DayPredictions } from "@/components/horse/DayPredictions";
import { Overview } from "@/components/horse/Overview";
import { RaceDayMenu } from "@/components/horse/RaceDayMenu";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useState } from "react";

export function HorsePageClient() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { toggle } = useSidebarStore();

  return (
    <main className="horse-dashboard p-0">
      <DashboardLayout
        sidebar={
          <RaceDayMenu
            selectedDate={selectedDate}
            onDateSelect={(date: string | null) => {
              setSelectedDate(date);
              toggle();
            }}
          />
        }
        content={
          selectedDate ? <DayPredictions date={selectedDate} /> : <Overview />
        }
      />
    </main>
  );
}
