"use client";

import { oldMeetingsToNewMeetings } from "@/app/rp/utils/Aug25/oldMeetingsToNewMeetings";
import { parseMeetings } from "@/app/rp/utils/parseMeetings";
import { useResults } from "@/hooks/useResults";
import { Meeting } from "@/types/raceday";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Dashboard } from "../Dashboard";
import {
  getFormFetchQueueLength,
  loadFormCache,
  saveFormCache,
} from "@/lib/racing/fetchWithLimit";
import { PressureGauge } from "@/app/PressureGauge";
import {
  getFormRaceDetailsFetchQueueLength,
  loadFormRaceDetailsCache,
  saveFormRaceDetailsCache,
} from "@/lib/racing/fetchFormRaceDetailsWithLimit";
import {
  loadRaceAccordionCache,
  saveRaceAccordionCache,
} from "@/app/rp/utils/fetchRaceAccordion";
import {
  loadPredictionsCache,
  savePredictionsCache,
} from "@/app/rp/utils/fetchPredictions";
import {
  fetchDayMeetingElements,
  loadDayMeetingElementsCache,
  saveDayMeetingElementsCache,
} from "@/app/rp/utils/fetchDayMeetingElements";

export function PageClient({ date }: { date: string }) {
  console.log("🏇 Rendering PageClient with date:", date);
  const searchParams = useSearchParams();
  const courseFilter = searchParams.get("c");
  const timeFilter = searchParams.get("t");
  console.log("🏁 Course name from query string:", courseFilter);
  console.log("🏁 Time from query string:", timeFilter);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: results, isLoading: resultsLoading } = useResults(date);
  const [formObjQueueLength, setFormObjQueueLength] = useState(0);
  const [formRaceDetailsQueueLength, setFormRaceDetailsQueueLength] =
    useState(0);

  useEffect(() => {
    loadFormCache(date);
    loadFormRaceDetailsCache(date);
    loadRaceAccordionCache(date);
    loadPredictionsCache(date);
    loadDayMeetingElementsCache(date);
  }, [date]);

  useEffect(() => {
    console.log("🔄 Effect triggered with date:", date);
    async function loadData() {
      try {
        console.log("📥 Starting data load");
        setLoading(true);

        const resultsResponse = await fetch(`/api/racing/results/${date}`);
        const resultsData = await resultsResponse.json();

        if (
          !resultsData ||
          !resultsData.results ||
          resultsData.results.length === 0
        ) {
          await fetch(`/api/racing/results/fetch?date=${date}`);
        }

        // Fetch racing data
        console.log("🔍 Fetching from API for date:", date);
        const response = await fetch(`/api/racedays?date=${date}`);

        console.log("📡 API Response:", response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(
          "📦 Received data from API:",
          data ? "Cache hit" : "Cache miss",
        );

        if (!data) {
          const meetingElementsArr = await fetchDayMeetingElements(
            date,
            courseFilter || undefined,
          );

          console.log(
            "🎯 Filtered meeting elements:",
            meetingElementsArr.length,
          );

          const parsedMeetingsOld = await parseMeetings(
            Array.from(meetingElementsArr), //.slice(0, 1),
            date,
            timeFilter ? timeFilter : undefined,
          );

          const parsedMeetings: Meeting[] =
            oldMeetingsToNewMeetings(parsedMeetingsOld);
          console.log("✅ Parsed meetings:", parsedMeetings.length);

          // Save to cache file
          console.log("💾 Saving to cache");
          await fetch(`/api/racedays?date=${date}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(parsedMeetings),
          });

          setMeetings(parsedMeetings);
          console.log("📊 Set meetings state with parsed data");
        } else {
          console.log("📦 Using cached data");
          setMeetings(data);
        }
      } catch (err) {
        console.error("❌ Error loading data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
        console.log("✨ Finished loading data");
      }
    }

    loadData();
  }, [courseFilter, date, timeFilter]);

  useEffect(() => {
    if (!loading) {
      setFormObjQueueLength(0);
      setFormRaceDetailsQueueLength(0);
      return;
    }

    const interval = setInterval(() => {
      setFormObjQueueLength(getFormFetchQueueLength());
      setFormRaceDetailsQueueLength(getFormRaceDetailsFetchQueueLength());
    }, 500);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (loading || resultsLoading || meetings.length === 0) {
      return;
    }

    saveFormCache(date);
    saveFormRaceDetailsCache(date);
    saveRaceAccordionCache(date);
    savePredictionsCache(date);
    saveDayMeetingElementsCache(date);
  }, [loading, resultsLoading, date, meetings.length]);

  if (loading || resultsLoading) {
    console.log("⌛ Rendering loading state");
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />

        <PressureGauge
          queueLength={formObjQueueLength}
          title="Form Obj Queue Length"
        />
        <PressureGauge
          queueLength={formRaceDetailsQueueLength}
          title="Form Race Details Queue Length"
        />
      </div>
    );
  }

  if (error) {
    console.log("❌ Rendering error state:", error);
    return <div>Error: {error}</div>;
  }
  if (meetings.length === 0) {
    console.log("⚠️ No meetings found");
    return <div>⚠️ No meetings found</div>;
  }

  console.log("🎉 Rendering dashboard with", meetings.length, "meetings");
  return <Dashboard data={meetings} results={results} date={date} />;
}
