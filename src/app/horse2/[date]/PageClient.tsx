"use client";

import { oldMeetingsToNewMeetings } from "@/app/rp/utils/Aug25/oldMeetingsToNewMeetings";
import { parseMeetings } from "@/app/rp/utils/parseMeetings";
import { useResults } from "@/hooks/useResults";
import { placeToPlaceKey } from "@/lib/racing/scores/funcs";
import { IRISH_COURSES, UK_COURSES } from "@/types/courses";
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

function getPageUrl(date: string) {
  return `https://www.racingpost.com/racecards/${date}/`;
}

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
          const pageUrl = getPageUrl(date);
          console.log("🌐 Generated page URL:", pageUrl);

          if (!pageUrl || pageUrl.trim() === "") {
            console.error("❌ No URL provided");
            setError("No URL provided");
            return;
          }

          let html = "";
          let tryCount = 0;
          let retryDoc: Document | null = null;
          while (tryCount < 20) {
            tryCount++;

            if (pageUrl) {
              await new Promise((resolve) =>
                setTimeout(resolve, Math.floor(Math.random() * 5000)),
              );
              const response = await fetch(
                `/api/racedays/proxy?url=${encodeURIComponent(
                  `https://alexdawson.co.uk/getP.php?q=${encodeURIComponent(
                    pageUrl,
                  )}`,
                )}`,
              );
              const html_res = await response.text();
              const retryParser = new DOMParser();
              retryDoc = retryParser.parseFromString(
                html_res || "",
                "text/html",
              );
              if (retryDoc.querySelector(".ui-accordion__row")) {
                // Successfully loaded the correct page
                html = html_res;
                break;
              } else {
                console.log(`🏁 PageClient -  attempt ${tryCount}`, pageUrl);
              }
            } else {
              // No link to retry
              break;
            }
          }

          if (!response.ok) {
            console.error("❌ Proxy request failed:", response.status);
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          console.log("📄 Received HTML response");
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          const meetingElements = doc.querySelectorAll(
            ".ui-accordion__row:not(:has(.ui-accordion__header.RC-accordion__header_abandoned))",
          );
          console.log("🏁 Found meeting elements:", meetingElements.length);

          const meetingElementsArr = Array.from(meetingElements).filter(
            (element) => {
              const courseName = placeToPlaceKey(
                element
                  .querySelector(".RC-accordion__courseName")
                  ?.textContent?.toLowerCase()
                  .replace(/\s*\([^)]*\)\s*/g, "") // Remove anything in parentheses
                  .trim() || "",
              );

              const ukCourseKeys = UK_COURSES.map((course) =>
                placeToPlaceKey(course),
              );
              const irishCourseKeys = IRISH_COURSES.map((course) =>
                placeToPlaceKey(course),
              );
              const isUkCourse =
                courseName && ukCourseKeys.includes(courseName);
              const isIrishCourse =
                courseName && irishCourseKeys.includes(courseName);

              if (courseFilter) {
                return (
                  placeToPlaceKey(courseName) === placeToPlaceKey(courseFilter)
                );
              }

              return isUkCourse; //|| isIrishCourse; // TODO: Uncomment this when we have Irish courses back
            },
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
  }, [date]);

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
