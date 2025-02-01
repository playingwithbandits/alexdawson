"use client";

import { Meeting, RaceResults } from "@/types/racing";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardContent } from "../DashboardContent";
import { parseMeetings } from "@/app/rp/utils/parseMeetings";

const UK_COURSES = [
  "ascot",
  "ayr",
  "bangor",
  "bath",
  "beverley",
  "brighton",
  "carlisle",
  "cartmel",
  "catterick",
  "chelmsford",
  "cheltenham",
  "chepstow",
  "chester",
  "doncaster",
  "epsom",
  "exeter",
  "fakenham",
  "ffos las",
  "fontwell",
  "goodwood",
  "hamilton",
  "haydock",
  "hexham",
  "huntingdon",
  "kelso",
  "kempton",
  "leicester",
  "lingfield",
  "ludlow",
  "market rasen",
  "musselburgh",
  "newbury",
  "newcastle",
  "newmarket",
  "newton abbot",
  "nottingham",
  "perth",
  "plumpton",
  "pontefract",
  "redcar",
  "ripon",
  "salisbury",
  "sandown",
  "sedgefield",
  "southwell",
  "stratford",
  "taunton",
  "thirsk",
  "uttoxeter",
  "warwick",
  "wetherby",
  "wincanton",
  "windsor",
  "wolverhampton",
  "worcester",
  "yarmouth",
  "york",
];

function getPageUrl(date: string) {
  return `https://www.racingpost.com/racecards/${date}/`;
}

export function HorsePageClient({ date }: { date: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [results, setResults] = useState<RaceResults | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        if (!getPageUrl(date) || getPageUrl(date).trim() === "") {
          console.error("❌ No URL provided");
          setError("No URL provided");
          return;
        }

        // Try to load results first
        try {
          const resultsResponse = await fetch(`/api/racing/results/${date}`);
          if (resultsResponse.ok) {
            const resultsData = await resultsResponse.json();
            setResults(resultsData);
          }
        } catch (err) {
          console.log("No results file found for date:", date);
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

        console.log(`Found ${meetingElements.length} total courses`);
        const ukElements = Array.from(meetingElements).filter((element) => {
          const courseName = element
            .querySelector(".RC-accordion__courseName")
            ?.textContent?.toLowerCase()
            .replace(/\s*\([^)]*\)\s*/g, "") // Remove anything in parentheses
            .trim();
          console.log(`Processing course: ${courseName}`);
          const isUkCourse = courseName && UK_COURSES.includes(courseName);
          console.log(`Is UK course: ${isUkCourse}`);
          return isUkCourse;
        });
        console.log(`Filtered to ${ukElements.length} UK courses`);

        console.log("🔍 Meeting elements:", ukElements);

        const parsedMeetings = await parseMeetings(Array.from(ukElements));
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
        setError(err instanceof Error ? err.message : "Failed to load data");
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

  return <DashboardContent meetings={meetings} date={date} results={results} />;
}
