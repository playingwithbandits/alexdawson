import type { FormObj, HorseStats } from "@/types/racing";
import { avg } from "@/lib/utils";

function getSeasonFromDate(dateStr?: string): string {
  if (!dateStr) return "unknown";
  const month = new Date(dateStr).getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

function calculateDistancePreference(
  avgDistance: number
): "sprinter" | "middle" | "stayer" {
  if (avgDistance <= 7) return "sprinter";
  if (avgDistance <= 12) return "middle";
  return "stayer";
}

export function calculateHorseStats(formObj?: FormObj): HorseStats {
  if (!formObj?.form?.length) return {} as HorseStats;

  const form = formObj.form;
  const lastRun = form[0]?.raceDatetime;
  const daysOffTrack = lastRun
    ? Math.floor(
        (Date.now() - new Date(lastRun).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  // Calculate seasonal performance
  const seasonalRuns = form.reduce((acc, run) => {
    const season = getSeasonFromDate(run.raceDatetime);
    if (run.raceOutcomeCode === "1") {
      acc[season] = (acc[season] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate class progression
  const classProgression = form
    .map((r) => Number(r.raceClass) || 0)
    .filter(Boolean)
    .reverse();

  // Calculate course form
  const courseForm = form.reduce(
    (acc, run) => {
      acc.runs++;
      if (run.raceOutcomeCode === "1") acc.wins++;
      if (["1", "2", "3"].includes(run.raceOutcomeCode || "")) acc.places++;
      return acc;
    },
    { runs: 0, wins: 0, places: 0, winRate: 0, placeRate: 0 }
  );
  courseForm.winRate = (courseForm.wins / courseForm.runs) * 100;
  courseForm.placeRate = (courseForm.places / courseForm.runs) * 100;

  // Calculate distance stats
  const distanceStats = form.reduce((acc, run) => {
    const distance = run.distanceFurlong || 0;
    const range = `${Math.floor(distance / 2) * 2}-${
      Math.floor(distance / 2) * 2 + 2
    }f`;
    if (!acc[range]) acc[range] = { runs: 0, wins: 0, winRate: 0 };
    acc[range].runs++;
    if (run.raceOutcomeCode === "1") acc[range].wins++;
    acc[range].winRate = (acc[range].wins / acc[range].runs) * 100;
    return acc;
  }, {} as Record<string, { runs: number; wins: number; winRate: number }>);

  // Calculate track configuration performance
  const trackConfigs = form.reduce((acc, run) => {
    // Determine track style from course configuration
    let style = "unknown";
    const config = (run.courseComments || "").toLowerCase();
    if (config.includes("left-handed") || config.includes("left handed")) {
      style = "left-handed";
    } else if (
      config.includes("right-handed") ||
      config.includes("right handed")
    ) {
      style = "right-handed";
    } else if (config.includes("straight")) {
      style = "straight";
    }

    // Fallback to course name patterns if no explicit configuration
    if (style === "unknown") {
      // Clean up course name - remove (A.W) and other suffixes
      const courseName = (run.courseName || "")
        .toLowerCase()
        .replace(/\s*\([^)]*\)/g, "") // Remove anything in parentheses
        .trim();

      if (
        [
          "ascot",
          "doncaster",
          "york",
          "newmarket july",
          "newmarket rowley",
          "thirsk",
        ].includes(courseName)
      ) {
        style = "straight";
      } else if (
        [
          "kempton",
          "lingfield",
          "wolverhampton",
          "chelmsford",
          "dundalk",
          "southwell",
          "ayr",
          "hamilton",
          "newcastle",
          "pontefract",
          "musselburgh",
        ].includes(courseName)
      ) {
        style = "left-handed";
      } else if (
        [
          "windsor",
          "brighton",
          "bath",
          "beverley",
          "chester",
          "chepstow",
          "epsom",
          "goodwood",
          "yarmouth",
        ].includes(courseName)
      ) {
        style = "right-handed";
      }
    }

    if (!acc[style]) {
      acc[style] = { style, runs: 0, wins: 0, winRate: 0 };
    }
    acc[style].runs++;
    if (run.raceOutcomeCode === "1") {
      acc[style].wins++;
    }
    acc[style].winRate = (acc[style].wins / acc[style].runs) * 100;
    return acc;
  }, {} as Record<string, { style: string; runs: number; wins: number; winRate: number }>);

  const trackConfigPerformance = Object.values(trackConfigs);

  return {
    // ... existing stats ...
    trackConfigPerformance,
    daysOffTrack,
    racingFrequency: (form.length / (daysOffTrack || 1)) * 30, // races per month
    seasonalForm: {
      spring: seasonalRuns.spring || 0,
      summer: seasonalRuns.summer || 0,
      autumn: seasonalRuns.autumn || 0,
      winter: seasonalRuns.winter || 0,
    },
    classProgression,
    avgClassLevel: avg(classProgression),
    preferredClass: Math.round(avg(classProgression)).toString(),
    courseForm,
    optimalDistance: avg(form.map((r) => r.distanceFurlong || 0)),
    distancePreference: calculateDistancePreference(
      avg(form.map((r) => r.distanceFurlong || 0))
    ),
    distanceStats,
  };
}
