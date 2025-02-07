import type { FormObj, GoingRecord, HorseStats } from "@/types/racing";
import { avg, sum } from "@/lib/utils";
import { mapGoingCodeToType } from "./goingUtils";
import { analyzeSentiment } from "./analyzeSentiment";
import { TrackConfiguration } from "./calculateDrawBias";
import {
  calculateDistancePreference,
  determineRunStyle,
  distanceToWinnerStrToFloat,
  getRaceType,
  getSeasonFromDate,
  isBadDraw,
} from "./scores/funcs";
import { isValidOutcome } from "./scores/funcs";

export function calculateHorseStats(formObj?: FormObj): HorseStats {
  if (!formObj?.form?.length) return {} as HorseStats;

  const form = formObj.form;
  const lastRun = form[0]?.raceDatetime;
  const daysOffTrack = lastRun
    ? Math.floor(
        (Date.now() - new Date(lastRun).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  // Filter to only valid runs when calculating stats
  const validRuns = form.filter((r) => isValidOutcome(r.raceOutcomeCode));

  // Calculate seasonal performance
  const seasonalRuns = validRuns.reduce((acc, run) => {
    const season = getSeasonFromDate(run.raceDatetime);
    if (run.raceOutcomeCode === "1") {
      acc[season] = (acc[season] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate class progression
  const classProgression = validRuns
    .map((r) => Number(r.raceClass) || 0)
    .filter(Boolean)
    .reverse();

  // Calculate course form
  const courseForm = validRuns.reduce(
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

  // Calculate track configuration performance
  const trackConfigs = validRuns.reduce((acc, run) => {
    // Determine track style from course configuration
    let style: TrackConfiguration = "straight"; // default value
    const config = (run.courseComments || "").toLowerCase();

    if (config.includes("left")) {
      style = "left-handed";
    } else if (config.includes("right")) {
      style = "right-handed";
    } else if (config.includes("straight")) {
      style = "straight";
    }

    // Add to accumulator
    if (!acc[style]) {
      acc[style] = { style, runs: 0, wins: 0, winRate: 0 };
    }
    acc[style].runs++;
    if (run.raceOutcomeCode === "1") {
      acc[style].wins++;
    }
    acc[style].winRate = (acc[style].wins / acc[style].runs) * 100;

    return acc;
  }, {} as Record<TrackConfiguration, { style: TrackConfiguration; runs: number; wins: number; winRate: number }>);

  const trackConfigPerformance = Object.values(trackConfigs);

  // Calculate going performance
  const goingPerf = validRuns.reduce((acc, run) => {
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
  const recentResults = validRuns
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

  validRuns.forEach((race) => {
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

  // Calculate form progression
  const lastSixPositions = validRuns
    .slice(0, 6)
    .map((r) => parseInt(r.raceOutcomeCode || "0"))
    .filter((p) => p > 0);

  const positionTrend = calculatePositionTrend(lastSixPositions);
  const averagePosition = avg(lastSixPositions);

  // Calculate distance stats
  const distances = validRuns
    .map((r) => r.distanceFurlong || 0)
    .filter((d) => d > 0);
  const distancePerformance = calculateDistancePerformance(validRuns);

  // Calculate class stats
  const classes = validRuns.map((r) => r.raceClass || 0).filter((c) => c > 0);

  // Calculate winning/beaten distances
  const winningMargins = validRuns
    .filter((r) => r.raceOutcomeCode === "1")
    .map((r) => distanceToWinnerStrToFloat(r.winningDistance || ""));

  const beatenDistances = validRuns
    .filter((r) => r.raceOutcomeCode !== "1")
    .map((r) => distanceToWinnerStrToFloat(r.distanceToWinner || ""));

  // Calculate draw performance
  const runsFromBadDraw = validRuns.filter((r) =>
    isBadDraw(
      r.draw || 0,
      r.noOfRunners || 0,
      r.distanceFurlong || 0,
      r.courseComments || ""
    )
  );

  const winsFromBadDraw = runsFromBadDraw.filter(
    (r) => r.raceOutcomeCode === "1"
  );
  const positionsFromBadDraw = runsFromBadDraw
    .map((r) => parseInt(r.raceOutcomeCode || "0"))
    .filter((p) => p > 0);

  // Calculate sentiment stats
  const sentiment = (() => {
    const comments =
      formObj?.form
        ?.map((r) => r.rpCloseUpComment)
        .filter((c): c is string => Boolean(c)) || [];
    const sentiments = comments.map(analyzeSentiment);

    const recentCommentScore = sentiments[0]?.score || 0;
    const avgCommentScore = avg(sentiments.map((s) => s.score));
    const positiveComments = sentiments.filter((s) => s.isPositive).length;
    const negativeComments = sentiments.filter((s) => !s.isPositive).length;

    // Determine trend from last 3 comments
    const recentScores = sentiments.slice(0, 3).map((s) => s.score);
    const trend =
      recentScores.length >= 2
        ? recentScores[0] > avg(recentScores.slice(1))
          ? "positive"
          : recentScores[0] < avg(recentScores.slice(1))
          ? "negative"
          : "neutral"
        : ("neutral" as "positive" | "negative" | "neutral");

    return {
      recentCommentScore,
      avgCommentScore,
      positiveComments,
      negativeComments,
      trend,
    };
  })();

  const runStyle = determineRunStyle(formObj?.form);

  return {
    // Basic stats
    totalStarts: validRuns.length,
    totalWins: validRuns.filter((r) => r.raceOutcomeCode === "1").length,
    winRate:
      (validRuns.filter((r) => r.raceOutcomeCode === "1").length /
        validRuns.length) *
      100,
    placeRate:
      (validRuns.filter((r) =>
        ["1", "2", "3"].includes(r.raceOutcomeCode || "")
      ).length /
        validRuns.length) *
      100,
    avgEarningsPerRace: avg(validRuns.map((r) => r.prizeSterling || 0)),
    totalEarnings: sum(validRuns.map((r) => r.prizeSterling || 0)),

    // Form trends
    recentFormTrend,
    avgPositionLastSix: avg(recentResults),
    finishingPositions: validRuns
      .slice(0, 6)
      .map((r) => parseInt(r.raceOutcomeCode || "0"))
      .filter(Boolean),

    // Ratings
    bestRPR: Math.max(...validRuns.map((r) => r.rpPostmark || 0)),
    avgRPR: avg(validRuns.map((r) => r.rpPostmark || 0)),
    rprProgression: validRuns
      .slice(0, 6)
      .map((r) => r.rpPostmark || 0)
      .reverse(),
    bestTopSpeed: Math.max(...validRuns.map((r) => r.rpTopspeed || 0)),
    avgTopSpeed: avg(validRuns.map((r) => r.rpTopspeed || 0)),
    topSpeedProgression: validRuns
      .slice(0, 6)
      .map((r) => r.rpTopspeed || 0)
      .reverse(),

    // Distance
    minDistance: Math.min(
      ...validRuns.map((r) => r.distanceFurlong || Infinity)
    ),
    maxDistance: Math.max(...validRuns.map((r) => r.distanceFurlong || 0)),
    avgDistance: avg(validRuns.map((r) => r.distanceFurlong || 0)),
    distanceProgression: validRuns
      .slice(0, 6)
      .map((r) => r.distanceFurlong || 0)
      .reverse(),

    // Weight
    minWeight: Math.min(
      ...validRuns.map((r) => r.weightCarriedLbs || Infinity)
    ),
    maxWeight: Math.max(...validRuns.map((r) => r.weightCarriedLbs || 0)),
    avgWeight: avg(validRuns.map((r) => r.weightCarriedLbs || 0)),
    weightProgression: validRuns
      .slice(0, 6)
      .map((r) => r.weightCarriedLbs || 0)
      .reverse(),

    // Prize money
    highestPrize: Math.max(...validRuns.map((r) => r.prizeSterling || 0)),
    avgPrize: avg(validRuns.map((r) => r.prizeSterling || 0)),
    totalPrizeMoney: sum(validRuns.map((r) => r.prizeSterling || 0)),

    // Surface stats
    surfaceStats: validRuns.reduce((acc, run) => {
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
    latestOR: validRuns[0]?.officialRatingRanOff || 0,
    bestOfficialRating: Math.max(
      ...validRuns.map((r) => r.officialRatingRanOff || 0)
    ),
    avgOfficialRating: avg(validRuns.map((r) => r.officialRatingRanOff || 0)),
    officialRatingProgression: validRuns
      .slice(0, 6)
      .map((r) => r.officialRatingRanOff || 0)
      .reverse(),

    // ... existing stats ...
    goingPerformance,
    trackConfigPerformance,
    daysOffTrack,
    racingFrequency: (validRuns.length / (daysOffTrack || 1)) * 30, // races per month
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
    optimalDistance: avg(validRuns.map((r) => r.distanceFurlong || 0)),
    distancePreference: calculateDistancePreference(
      avg(validRuns.map((r) => r.distanceFurlong || 0))
    ),
    distanceStats: {
      optimal: findOptimalDistance(validRuns),
      range: {
        min: Math.min(...distances),
        max: Math.max(...distances),
        avg: avg(distances),
      },
      performanceByType: distancePerformance,
    },
    raceTypeStats,
    formProgression: {
      lastSixPositions,
      positionTrend,
      averagePosition,
      last3: lastSixPositions.slice(0, 3),
      last6: lastSixPositions,
      trend: positionTrend,
    },
    classStats: {
      highestClass: Math.min(...classes), // Lower number = higher class

      lowestClass: Math.max(...classes),
      currentClass: validRuns[0]?.raceClass || 0,
      classProgression: classes.slice(0, 6),
    },
    margins: {
      avgWinningDistance: avg(winningMargins),
      avgBeatenDistance: avg(beatenDistances),
      totalWinningDistance: sum(winningMargins),
      totalBeatenDistance: sum(beatenDistances),
      maxWinningMargin: Math.max(...winningMargins, 0),
      maxBeatenDistance: Math.max(...beatenDistances, 0),
    },
    drawPerformance: {
      winsFromBadDraw: winsFromBadDraw.length,
      runsFromBadDraw: runsFromBadDraw.length,
      winRateFromBadDraw:
        (winsFromBadDraw.length / runsFromBadDraw.length) * 100 || 0,
      avgPositionFromBadDraw: avg(positionsFromBadDraw) || 0,
      bestPositionFromBadDraw: Math.min(...positionsFromBadDraw, Infinity),
    },
    sentiment,
    runStyle,
  };
}

function calculatePositionTrend(
  positions: number[]
): "improving" | "declining" | "steady" {
  if (positions.length < 3) return "steady";

  const firstHalf = positions.slice(0, Math.ceil(positions.length / 2));
  const secondHalf = positions.slice(Math.ceil(positions.length / 2));

  const firstAvg = avg(firstHalf);
  const secondAvg = avg(secondHalf);

  if (secondAvg < firstAvg - 1) return "improving";
  if (secondAvg > firstAvg + 1) return "declining";
  return "steady";
}

function findOptimalDistance(form: FormObj["form"]): number {
  const distancePerformances = form?.reduce((acc, race) => {
    const distance = race.distanceFurlong || 0;
    if (!acc[distance]) acc[distance] = { wins: 0, runs: 0 };
    acc[distance].runs++;
    if (race.raceOutcomeCode === "1") acc[distance].wins++;
    return acc;
  }, {} as Record<number, { wins: number; runs: number }>);

  let bestDistance = 0;
  let bestWinRate = 0;

  Object.entries(distancePerformances || []).forEach(([distance, stats]) => {
    const winRate = (stats.wins / stats.runs) * 100;
    if (winRate > bestWinRate && stats.runs >= 2) {
      bestWinRate = winRate;
      bestDistance = Number(distance);
    }
  });

  return bestDistance;
}

function calculateDistancePerformance(form: FormObj["form"]) {
  const categories = {
    sprint: { min: 0, max: 7, runs: 0, wins: 0, winRate: 0 },
    mile: { min: 7, max: 9, runs: 0, wins: 0, winRate: 0 },
    middle: { min: 9, max: 12, runs: 0, wins: 0, winRate: 0 },
    staying: { min: 12, max: Infinity, runs: 0, wins: 0, winRate: 0 },
  };

  form?.forEach((race) => {
    const distance = race.distanceFurlong || 0;
    for (const [key, range] of Object.entries(categories)) {
      if (distance > range.min && distance <= range.max) {
        range.runs++;
        if (race.raceOutcomeCode === "1") range.wins++;
        range.winRate = (range.wins / range.runs) * 100;
      }
    }
  });

  return categories;
}
