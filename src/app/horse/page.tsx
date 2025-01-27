"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/horse/DashboardLayout";
import { Overview } from "@/components/horse/Overview";
import { DayPredictions } from "@/components/horse/DayPredictions";
import { RaceDayMenu } from "@/components/horse/RaceDayMenu";
import { useSidebarStore } from "@/store/useSidebarStore";

export default function HorsePage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { toggle } = useSidebarStore();

  return (
    <main className="horse-dashboard">
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
