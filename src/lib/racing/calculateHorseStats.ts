import type { FormObj, GoingRecord, HorseStats } from "@/types/racing";
import { avg, sum } from "@/lib/utils";
import { mapGoingCodeToType } from "./goingUtils";

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

function getRaceType(formRaceCode: string | undefined) {
  if (!formRaceCode) return null;
  switch (formRaceCode) {
    case "P":
    case "H":
      return "hurdle";
    case "C":
    case "U":
      return "chase";
    case "F":
    case "B":
      return "flat";
    case "W":
    case "X":
      return "aw";
    default:
      return null;
  }
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

  // Calculate going performance
  const goingPerf = form.reduce((acc, run) => {
    const goingCode = (run.goingTypeServicesDesc || "").toLowerCase();
    const type = mapGoingCodeToType(goingCode);

    if (!acc[goingCode]) {
      acc[goingCode] = { goingCode, type, runs: 0, wins: 0, winRate: 0 };
    }

    acc[goingCode].runs++;
    if (run.raceOutcomeCode === "1") {
      acc[goingCode].wins++;
    }
    acc[goingCode].winRate = (acc[goingCode].wins / acc[goingCode].runs) * 100;

    return acc;
  }, {} as Record<string, GoingRecord>);

  const goingPerformance = Object.values(goingPerf);

  // Calculate recent form trend
  const recentResults = form
    .slice(0, 6)
    .map((r) => parseInt(r.raceOutcomeCode || "0"))
    .filter((pos) => pos > 0);

  let recentFormTrend: "improving" | "declining" | "consistent" = "consistent";

  if (recentResults.length >= 3) {
    const firstHalf = recentResults.slice(
      0,
      Math.ceil(recentResults.length / 2)
    );
    const secondHalf = recentResults.slice(Math.ceil(recentResults.length / 2));

    const firstHalfAvg = avg(firstHalf);
    const secondHalfAvg = avg(secondHalf);

    // Lower position numbers are better
    if (secondHalfAvg < firstHalfAvg - 1) {
      recentFormTrend = "improving";
    } else if (secondHalfAvg > firstHalfAvg + 1) {
      recentFormTrend = "declining";
    }
  }

  // Calculate race type stats
  const raceTypeStats = {
    flat: { runs: 0, wins: 0, places: 0, winRate: 0, placeRate: 0 },
    aw: { runs: 0, wins: 0, places: 0, winRate: 0, placeRate: 0 },
    hurdle: { runs: 0, wins: 0, places: 0, winRate: 0, placeRate: 0 },
    chase: { runs: 0, wins: 0, places: 0, winRate: 0, placeRate: 0 },
  };

  form.forEach((race) => {
    const raceType = getRaceType(race.raceTypeCode);
    if (raceType) {
      raceTypeStats[raceType].runs++;
      if (race.raceOutcomeCode === "1") raceTypeStats[raceType].wins++;
      if (parseInt(race.raceOutcomeCode || "99") <= 3)
        raceTypeStats[raceType].places++;
    }
  });

  // Calculate rates
  Object.values(raceTypeStats).forEach((stats) => {
    if (stats.runs > 0) {
      stats.winRate = (stats.wins / stats.runs) * 100;
      stats.placeRate = (stats.places / stats.runs) * 100;
    }
  });

  return {
    // Basic stats
    totalStarts: form.length,
    totalWins: form.filter((r) => r.raceOutcomeCode === "1").length,
    winRate:
      (form.filter((r) => r.raceOutcomeCode === "1").length / form.length) *
      100,
    placeRate:
      (form.filter((r) => ["1", "2", "3"].includes(r.raceOutcomeCode || ""))
        .length /
        form.length) *
      100,
    avgEarningsPerRace: avg(form.map((r) => r.prizeSterling || 0)),
    totalEarnings: sum(form.map((r) => r.prizeSterling || 0)),

    // Form trends
    recentFormTrend,
    avgPositionLastSix: avg(recentResults),
    finishingPositions: form
      .slice(0, 6)
      .map((r) => parseInt(r.raceOutcomeCode || "0"))
      .filter(Boolean),

    // Ratings
    bestRPR: Math.max(...form.map((r) => r.rpPostmark || 0)),
    avgRPR: avg(form.map((r) => r.rpPostmark || 0)),
    rprProgression: form
      .slice(0, 6)
      .map((r) => r.rpPostmark || 0)
      .reverse(),
    bestTopSpeed: Math.max(...form.map((r) => r.rpTopspeed || 0)),
    avgTopSpeed: avg(form.map((r) => r.rpTopspeed || 0)),
    topSpeedProgression: form
      .slice(0, 6)
      .map((r) => r.rpTopspeed || 0)
      .reverse(),

    // Distance
    minDistance: Math.min(...form.map((r) => r.distanceFurlong || Infinity)),
    maxDistance: Math.max(...form.map((r) => r.distanceFurlong || 0)),
    avgDistance: avg(form.map((r) => r.distanceFurlong || 0)),
    distanceProgression: form
      .slice(0, 6)
      .map((r) => r.distanceFurlong || 0)
      .reverse(),

    // Weight
    minWeight: Math.min(...form.map((r) => r.weightCarriedLbs || Infinity)),
    maxWeight: Math.max(...form.map((r) => r.weightCarriedLbs || 0)),
    avgWeight: avg(form.map((r) => r.weightCarriedLbs || 0)),
    weightProgression: form
      .slice(0, 6)
      .map((r) => r.weightCarriedLbs || 0)
      .reverse(),

    // Prize money
    highestPrize: Math.max(...form.map((r) => r.prizeSterling || 0)),
    avgPrize: avg(form.map((r) => r.prizeSterling || 0)),
    totalPrizeMoney: sum(form.map((r) => r.prizeSterling || 0)),

    // Surface stats
    surfaceStats: form.reduce((acc, run) => {
      const surface = (run.courseTypeCode || "unknown").toLowerCase();
      if (!acc[surface]) {
        acc[surface] = { runs: 0, wins: 0, winRate: 0 };
      }
      acc[surface].runs++;
      if (run.raceOutcomeCode === "1") acc[surface].wins++;
      acc[surface].winRate = (acc[surface].wins / acc[surface].runs) * 100;
      return acc;
    }, {} as Record<string, { runs: number; wins: number; winRate: number }>),

    // Official ratings
    latestOR: form[0]?.officialRatingRanOff || 0,
    bestOfficialRating: Math.max(
      ...form.map((r) => r.officialRatingRanOff || 0)
    ),
    avgOfficialRating: avg(form.map((r) => r.officialRatingRanOff || 0)),
    officialRatingProgression: form
      .slice(0, 6)
      .map((r) => r.officialRatingRanOff || 0)
      .reverse(),

    // ... existing stats ...
    goingPerformance,
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
    raceTypeStats,
  };
}
