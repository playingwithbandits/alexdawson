"use client";

import { Meeting } from "@/types/raceday";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { placeToPlaceKey } from "@/lib/racing/scores/funcs";
import { Dashboard } from "../Dashboard";
import { IRISH_COURSES, UK_COURSES } from "@/types/courses";
import { parseMeetings } from "@/app/rp/utils/Aug25/parseMeetings";

function getPageUrl(date: string) {
  return `https://www.racingpost.com/racecards/${date}/`;
}

export function PageClient({ date }: { date: string }) {
  console.log("🏇 Rendering PageClient with date:", date);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🔄 Effect triggered with date:", date);
    async function loadData() {
      try {
        console.log("📥 Starting data load");
        setLoading(true);

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
          data ? "Cache hit" : "Cache miss"
        );

        if (!data) {
          const pageUrl = getPageUrl(date);
          console.log("🌐 Generated page URL:", pageUrl);

          if (!pageUrl || pageUrl.trim() === "") {
            console.error("❌ No URL provided");
            setError("No URL provided");
            return;
          }

          console.log("🔄 Fetching from proxy");
          const response = await fetch(
            `/api/racedays/proxy?url=${encodeURIComponent(
              `https://alexdawson.co.uk/getP.php?q=${encodeURIComponent(
                pageUrl
              )}`
            )}`
          );

          if (!response.ok) {
            console.error("❌ Proxy request failed:", response.status);
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const html = await response.text();
          console.log("📄 Received HTML response");
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          const meetingElements = doc.querySelectorAll(
            ".ui-accordion__row:not(:has(.ui-accordion__header.RC-accordion__header_abandoned))"
          );
          console.log("🏁 Found meeting elements:", meetingElements.length);

          const meetingElementsArr = Array.from(meetingElements).filter(
            (element) => {
              const courseName = placeToPlaceKey(
                element
                  .querySelector(".RC-accordion__courseName")
                  ?.textContent?.toLowerCase()
                  .replace(/\s*\([^)]*\)\s*/g, "") // Remove anything in parentheses
                  .trim() || ""
              );

              const ukCourseKeys = UK_COURSES.map((course) =>
                placeToPlaceKey(course)
              );
              const irishCourseKeys = IRISH_COURSES.map((course) =>
                placeToPlaceKey(course)
              );
              const isUkCourse =
                courseName && ukCourseKeys.includes(courseName);
              const isIrishCourse =
                courseName && irishCourseKeys.includes(courseName);

              return isUkCourse || isIrishCourse;
            }
          );

          console.log(
            "🎯 Filtered meeting elements:",
            meetingElementsArr.length
          );

          const parsedMeetings = await parseMeetings(
            Array.from(meetingElementsArr) //.slice(0, 1)
          );
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
  }, [date]);

  if (loading) {
    console.log("⌛ Rendering loading state");
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    console.log("❌ Rendering error state:", error);
    return <div>Error: {error}</div>;
  }
  if (meetings.length === 0) {
    console.log("⚠️ No meetings found");
    return <div>Loading...</div>;
  }

  console.log("🎉 Rendering dashboard with", meetings.length, "meetings");
  return <Dashboard data={meetings} />;
}
