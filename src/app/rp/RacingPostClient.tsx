"use client";

import { useEffect, useState } from "react";
import { Meeting, parseMeetings } from "./utils/parseMeetings";

interface RacingPostClientProps {
  date: string; // YYYY-MM-DD format
}

export function RacingPostClient({ date }: RacingPostClientProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [error, setError] = useState<string | null>(null);
  const getPageUrl = (date: string) =>
    `https://www.racingpost.com/racecards/${date}/`;

  useEffect(() => {
    async function fetchData() {
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

        const parsedMeetings = await parseMeetings(
          Array.from(meetingElements).slice(0, 1)
        );
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
        console.error("❌ Error fetching/parsing data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      }
    }

    fetchData();
  }, [date]);

  if (error) return <div>Error: {error}</div>;
  if (meetings.length === 0) return <div>Loading...</div>;

  return (
    <div>
      <h1>Racing Post Data</h1>
      <div>
        {meetings.map((meeting, i) => (
          <div key={i}>
            <h2>{meeting.venue}</h2>
            <p>Going: {meeting.going}</p>
            <p>Surface: {meeting.surface}</p>
            <p>Races: {meeting.raceCount}</p>
            <p>
              Times: {meeting.firstRace} - {meeting.lastRace}
            </p>
            <p>Type: {meeting.type}</p>
            <ul>
              {meeting.races.map((race, j) => (
                <li key={j}>
                  <a href={race.url} target="_blank" rel="noopener noreferrer">
                    {race.time} - {race.title} ({race.runners} runners)
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
