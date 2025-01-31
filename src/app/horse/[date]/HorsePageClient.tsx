"use client";

import { Meeting } from "@/types/racing";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardContent } from "../DashboardContent";
import { parseMeetings } from "@/app/rp/utils/parseMeetings";

export function HorsePageClient({ date }: { date: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPageUrl = (date: string) =>
    `https://www.racingpost.com/racecards/${date}/`;

  useEffect(() => {
    async function loadData() {
      try {
        if (!getPageUrl(date) || getPageUrl(date).trim() === "") {
          console.error("❌ No URL provided");
          setError("No URL provided");
          return;
        }

        console.log("🔍 Checking cache for date:", date);

        // Try to get cached data from file
        const cacheResponse = await fetch(`/api/racing?date=${date}`);
        const cachedData = await cacheResponse.json();

        if (cachedData) {
          console.log("Cache hit for:", date);
          setMeetings(cachedData);
          return;
        }

        console.log("❌ No cache found, fetching fresh data");

        const response = await fetch(
          `/getP.php?q=${encodeURIComponent(getPageUrl(date))}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const meetingElements = doc.querySelectorAll(
          ".ui-accordion__row:not(:has(.ui-accordion__header.RC-accordion__header_abandoned))"
        );

        const parsedMeetings = await parseMeetings(Array.from(meetingElements));
        console.log("✨ Successfully parsed meetings data");
        console.log("📝 Saving to cache for date:", date);

        // Save to cache file
        await fetch(`/api/racing?date=${date}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsedMeetings),
        });
        console.log("💾 Cache saved successfully");

        setMeetings(parsedMeetings);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [date]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;
  if (meetings.length === 0) return <div>Loading...</div>;

  return <DashboardContent meetings={meetings} date={date} />;
}
