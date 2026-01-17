"use client";

import {
  Meeting,
  DayTips,
  GytoTips,
  NapsTableTips,
  NonRunnerMeeting,
  RtWebData,
  OLBGTips,
  SharpData,
} from "@/types/racing";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardContent } from "../DashboardContent";
import { parseMeetings } from "@/app/rp/utils/parseMeetings";
import { useResults } from "@/hooks/useResults";
import { placeToPlaceKey } from "@/lib/racing/scores/funcs";

// Add types for the-odds-api response
// interface OddsApiOutcome {
//   name: string;
//   price: number;
// }

// interface OddsApiMarket {
//   key: string;
//   outcomes: OddsApiOutcome[];
// }

// interface OddsApiBookmaker {
//   key: string;
//   markets: OddsApiMarket[];
// }

// interface OddsApiEvent {
//   home_team: string;
//   commence_time: string;
//   bookmakers: OddsApiBookmaker[];
// }

// Add new type for live odds
interface LiveOdds {
  horseName: string;
  odds: number;
  time: string;
  course: string;
}

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
  "hereford",
  "towcester",
  "aintree",
  "folkestone",
  "great leighs",
  "rothwell",
  "southport",
];

export const IRISH_COURSES = [
  "ballinrobe",
  "bellewstown",
  "clare",
  "clonmel",
  "cork",
  "curragh",
  "down royal",
  "dundalk",
  "fairyhouse",
  "galway",
  "gowran park",
  "kilbeggan",
  "killarney",
  "laytown",
  "leopardstown",
  "limerick",
  "listowel",
  "naas",
  "navan",
  "punchestown",
  "roscommon",
  "sligo",
  "thurles",
  "tipperary",
  "tralee",
  "tramore",
  "wexford",
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
  const [nonRunners, setNonRunners] = useState<NonRunnerMeeting[]>([]);
  const [liveOdds] = useState<LiveOdds[]>([]);
  const [rtWebTips, setRtWebTips] = useState<RtWebData | undefined>(undefined);
  const [olbgTips, setOLBGTips] = useState<OLBGTips | undefined>(undefined);
  const [sharpTips, setSharpTips] = useState<SharpData | undefined>(undefined);
  const { data: results, isLoading: resultsLoading } = useResults(date);

  // Add function to fetch live odds
  // const fetchLiveOdds = async () => {
  //   try {
  //     const apiKey = "9c1dc8286707901c807fadd6adac738d";
  //     const sport = "racing";
  //     const region = "uk";
  //     const oddsFormat = "decimal";

  //     const response = await fetch(
  //       `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=${region}&oddsFormat=${oddsFormat}&apiKey=${apiKey}`
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch live odds");
  //     }

  //     const data: OddsApiEvent[] = await response.json();

  //     console.log("fetchLiveOdds data", data);
  //     // Transform the data into our LiveOdds format
  //     const transformedOdds: LiveOdds[] = data.flatMap((event) => {
  //       const course = event.home_team;
  //       const time = event.commence_time;

  //       return event.bookmakers.flatMap((bookmaker) => {
  //         const market = bookmaker.markets.find((m) => m.key === "h2h");
  //         if (!market) return [];

  //         return market.outcomes.map((outcome) => ({
  //           horseName: outcome.name,
  //           odds: outcome.price,
  //           time,
  //           course,
  //         }));
  //       });
  //     });

  //     setLiveOdds(transformedOdds);
  //   } catch (error) {
  //     console.error("Error fetching live odds:", error);
  //   }
  // };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Check if results file exists and has content
        const resultsResponse = await fetch(`/api/racing/results/${date}`);
        const resultsData = await resultsResponse.json();

        if (
          !resultsData ||
          !resultsData.results ||
          resultsData.results.length === 0
        ) {
          await fetch(`/api/racing/results/fetch?date=${date}`);
        }

        // Fetch non-runners data
        const nonRunnersResponse = await fetch(
          `/api/racing/nonrunners/fetch?date=${date}`
        );
        const nonRunnersData = await nonRunnersResponse.json();
        setNonRunners(nonRunnersData);

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

        // Fetch RT Web tips
        const rtWebResponse = await fetch(`/api/racing/rtWeb/${date}`);
        const rtWebData = await rtWebResponse.json();
        setRtWebTips(rtWebData);

        // Fetch sharp tips
        const sharpResponse = await fetch(`/api/racing/sharp/${date}`);
        const sharpData = await sharpResponse.json();
        setSharpTips(sharpData);

        // Fetch OLBG tips
        const olbgResponse = await fetch(`/api/racing/olbg/${date}`);
        const olbgData = await olbgResponse.json();
        setOLBGTips(olbgData);

        // Fetch live odds
        //await fetchLiveOdds();

        // // Set up interval to refresh live odds every 30 seconds
        // const oddsInterval = setInterval(fetchLiveOdds, 30000);

        // // Cleanup interval on unmount
        // return () => clearInterval(oddsInterval);

        if (!data) {
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
            //console.log("Cache hit for:", date);
            setMeetings(cachedData);

            return;
          }

          console.log("❌ No cache found, fetching fresh data");

          const response = await fetch(
            `/api/racing/proxy?url=${encodeURIComponent(
              `https://alexdawson.co.uk/getP.php?q=${encodeURIComponent(
                getPageUrl(date)
              )}`
            )}`
          );

          console.log("🔍 Fetching from URL:", getPageUrl(date));
          console.log("🌐 Response status:", response.status);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          console.log("🔍 Parsed HTML data", response, doc, html);
          const meetingElements = doc.querySelectorAll(
            ".ui-accordion__row:not(:has(.ui-accordion__header.RC-accordion__header_abandoned))"
          );

          console.log(
            `Found ${meetingElements.length} total courses`,
            meetingElements
          );
          const ukElements = Array.from(meetingElements).filter((element) => {
            const courseName = placeToPlaceKey(
              element
                .querySelector(".RC-accordion__courseName")
                ?.textContent?.toLowerCase()
                .replace(/\s*\([^)]*\)\s*/g, "") // Remove anything in parentheses
                .trim() || ""
            );

            console.log(`Processing course: ${courseName}`);
            const ukCourseKeys = UK_COURSES.map((course) =>
              placeToPlaceKey(course)
            );
            const irishCourseKeys = IRISH_COURSES.map((course) =>
              placeToPlaceKey(course)
            );
            const isUkCourse = courseName && ukCourseKeys.includes(courseName);
            const isIrishCourse =
              courseName && irishCourseKeys.includes(courseName);
            console.log(`Is UK course: ${isUkCourse}`);
            console.log(`Is Irish course: ${isIrishCourse}`);
            console.log(
              `Course: ${courseName}, UK: ${isUkCourse}, Irish: ${isIrishCourse}`
            );
            return isUkCourse; //|| isIrishCourse; // TODO: Uncomment this when we have Irish courses back
          });
          console.log(
            `Filtered to ${ukElements.length} UK courses`,
            ukElements
          );

          console.log("🔍 Meeting elements:", ukElements);

          const parsedMeetings = await parseMeetings(
            Array.from(ukElements), //.slice(0, 1)
            date
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
        } else {
          console.log("📦 Using cached data");
          setMeetings(data);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [date]);

  if (loading || resultsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;
  if (meetings.length === 0) return <div>Loading...</div>;

  console.log("nonRunners", nonRunners);
  return (
    <DashboardContent
      meetings={meetings}
      date={date}
      results={results}
      tips={tips}
      gytoTips={gytoTips?.tips}
      napsTableTips={napsTableTips?.tips}
      nonRunners={nonRunners}
      liveOdds={liveOdds}
      rtWebTips={rtWebTips?.tips}
      olbgTips={olbgTips?.tips}
      olbgRaceInfoArr={olbgTips?.olbgRaceInfoArr}
      sharpTips={sharpTips?.tips}
    />
  );
}
