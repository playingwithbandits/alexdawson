"use client";

import { Meeting, DayTips, GytoTips, NapsTableTips } from "@/types/racing";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardContent } from "../DashboardContent";
import { parseMeetings } from "@/app/rp/utils/parseMeetings";
import { useResults } from "@/hooks/useResults";
import { placeToPlaceKey } from "@/lib/racing/scores/funcs";

export const UK_COURSES = [
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
  "ffos-las",
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
  "hereford",
  "towcester",
  "aintree",
  "folkestone",
  "great leighs",
  "rothwell",
  "southport",
  "great yarmouth",
  "thurles"
];

function getPageUrl(date: string) {
  return `https://www.racingpost.com/racecards/${date}/`;
}

export function HorsePageClient({ date }: { date: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tips, setTips] = useState<DayTips | null>(null);
  const [gytoTips, setGytoTips] = useState<GytoTips | undefined>(undefined);
  const [napsTableTips, setNapsTableTips] = useState<NapsTableTips | undefined>(
    undefined
  );
  const { data: results, isLoading: resultsLoading } = useResults(date);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Check if results file exists and has content
        const resultsResponse = await fetch(`/api/racing/results/${date}`);
        const resultsData = await resultsResponse.json();

        //console.log("Results data:", resultsData);
        if (
          !resultsData ||
          !resultsData.results ||
          resultsData.results.length === 0
        ) {
          //console.log("No results found, fetching from Racing Post...");
          // Fetch and save results HTML
          await fetch(`/api/racing/results/fetch?date=${date}`);
        }

        // Fetch racing data
        const response = await fetch(`/api/racing?date=${date}`);
        const data = await response.json();

        // Fetch ATR tips
        const tipsResponse = await fetch(`/api/racing/atr/${date}`);
        const tipsData = await tipsResponse.json();
        setTips(tipsData);

        // Fetch GYTO tips
        const gytoResponse = await fetch(`/api/racing/gyto/${date}`);
        const gytoData = await gytoResponse.json();
        setGytoTips(gytoData);

        // Fetch naps table tips
        const napsResponse = await fetch(`/api/racing/naps/${date}`);
        const napsData = await napsResponse.json();
        setNapsTableTips(napsData);

        if (!data) {
          if (!getPageUrl(date) || getPageUrl(date).trim() === "") {
            console.error("❌ No URL provided");
            setError("No URL provided");
            return;
          }

          //console.log("🔍 Checking cache for date:", date);

          // Try to get cached data from file
          const cacheResponse = await fetch(`/api/racing?date=${date}`);
          const cachedData = await cacheResponse.json();

          if (cachedData) {
            //console.log("Cache hit for:", date);
            setMeetings(cachedData);

            return;
          }

          //console.log("❌ No cache found, fetching fresh data");

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

          //console.log(`Found ${meetingElements.length} total courses`);
          const ukElements = Array.from(meetingElements).filter((element) => {
            const courseName = placeToPlaceKey(
              element
                .querySelector(".RC-accordion__courseName")
                ?.textContent?.toLowerCase()
                .replace(/\s*\([^)]*\)\s*/g, "") // Remove anything in parentheses
                .trim() || ""
            );

            //console.log(`Processing course: ${courseName}`);
            const isUkCourse = courseName && UK_COURSES.includes(courseName);
            //console.log(`