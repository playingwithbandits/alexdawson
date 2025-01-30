import { Race, RaceStats, Horse } from "@/types/racing";
import { normalize } from "@/lib/utils";

type Season = "spring" | "summer" | "autumn" | "winter";

const WEIGHTS = {
  recentForm: {
    winRate: 0.04,
    placeRate: 0.03,
    improvingTrend: 0.04,
    avgPositionLastSix: 0.02,
    lastRacePosition: 0.02,
    rprProgression: 0.02,
    topSpeedProgression: 0.02,
    consistencyBonus: 0.02,
    recentWins: 0.02,
  },
  classAndRatings: {
    avgClassLevel: 0.03,
    bestOfficialRating: 0.03,
    latestOR: 0.03,
    bestRPR: 0.03,
    avgRPR: 0.03,
    currentRating: 0.03,
    classProgression: 0.02,
    handicapPerformance: 0.02,
  },
  distanceAptitude: {
    optimalDistanceMatch: 0.03,
    avgDistanceMatch: 0.03,
    distanceRangeWinRate: 0.03,
    middleDistanceBonus: 0.03,
  },
  courseAndTrack: {
    courseWinRate: 0.03,
    coursePlaceRate: 0.02,
    leftHandedWinRate: 0.02,
    rightHandedWinRate: 0.02,
    straightWinRate: 0.02,
    awWinRate: 0.02,
    turfWinRate: 0.02,
  },
  goingAndConditions: {
    currentGoingWinRate: 0.03,
    goodGoingWinRate: 0.02,
    trackConditionWinRate: 0.03,
    seasonalForm: 0.02,
  },
  physicalFactors: {
    weightCarried: 0.02,
    ageProfile: 0.02,
    weightProgression: 0.01,
  },
  prizeMoney: {
    avgEarnings: 0.02,
    totalEarnings: 0.02,
    avgPrize: 0.01,
  },
  freshness: {
    daysOff: 0.03,
    racingFrequency: 0.02,
  },
  predictions: {
    predictedPosition: 0.03,
    predictedScore: 0.03,
    distanceToWinner: 0.02,
  },
} as const;

export function calculateHorseScore(
  horse: Horse,
  race: Partial<Race>,
  raceStats?: RaceStats
): number {
  if (!horse.stats || !raceStats) return 0;
  const stats = horse.stats;
  const w = WEIGHTS;

  // Get current season once
  const currentSeason = getCurrentSeason();

  // Get max seasonal form value once
  const maxSeasonalForm = Math.max(
    ...(stats.seasonalForm ? Object.values(stats.seasonalForm) : [0])
  );

  // Recent Form (25%)
  const recentFormScore =
    normalize(stats.winRate || 0, 0, 100) * w.recentForm.winRate +
    normalize(stats.placeRate || 0, 0, 100) * w.recentForm.placeRate +
    (stats.recentFormTrend === "improving" ? w.recentForm.improvingTrend : 0) +
    normalize(stats.avgPositionLastSix || 0, 6, 1) *
      w.recentForm.avgPositionLastSix +
    normalize(stats.finishingPositions?.[0] || 0, 20, 1) *
      w.recentForm.lastRacePosition +
    normalize(
      stats.rprProgression?.[0] || 0,
      stats.rprProgression?.[5] || 0,
      stats.bestRPR || 0
    ) *
      w.recentForm.rprProgression +
    normalize(
      stats.topSpeedProgression?.[0] || 0,
      stats.topSpeedProgression?.[5] || 0,
      stats.bestTopSpeed || 0
    ) *
      w.recentForm.topSpeedProgression;

  // Class & Ratings (20%)
  const classScore =
    normalize(stats.avgClassLevel || 0, 7, 1) *
      w.classAndRatings.avgClassLevel +
    normalize(
      stats.bestOfficialRating || 0,
      raceStats.avgOfficialRating - 20,
      raceStats.avgOfficialRating + 20
    ) *
      w.classAndRatings.bestOfficialRating +
    normalize(
      stats.latestOR || 0,
      stats.bestOfficialRating || 0,
      stats.avgOfficialRating || 0
    ) *
      w.classAndRatings.latestOR +
    normalize(
      stats.bestRPR || 0,
      raceStats.avgBestRPR - 20,
      raceStats.avgBestRPR + 20
    ) *
      w.classAndRatings.bestRPR +
    normalize(
      stats.avgRPR || 0,
      raceStats.avgBestRPR - 30,
      raceStats.avgBestRPR
    ) *
      w.classAndRatings.avgRPR +
    normalize(
      parseInt(horse.rating) || 0,
      raceStats.avgRating - 10,
      raceStats.avgRating + 10
    ) *
      w.classAndRatings.currentRating;

  // Distance Aptitude (15%)
  const distanceScore =
    normalize(
      Math.abs(stats.optimalDistance - (raceStats.distanceInFurlongs || 0)),
      4,
      0
    ) *
      w.distanceAptitude.optimalDistanceMatch +
    normalize(
      stats.avgDistance || 0,
      raceStats.distanceRange.min,
      raceStats.distanceRange.max
    ) *
      w.distanceAptitude.avgDistanceMatch +
    normalize(
      stats.distanceStats?.[
        `${Math.floor(raceStats.distanceInFurlongs || 0)}-${Math.ceil(
          raceStats.distanceInFurlongs || 0
        )}f`
      ]?.winRate || 0,
      0,
      100
    ) *
      w.distanceAptitude.distanceRangeWinRate +
    (stats.distancePreference === "middle"
      ? w.distanceAptitude.middleDistanceBonus
      : 0);

  // Course & Track Configuration (15%)
  const courseScore =
    normalize(stats.courseForm?.winRate || 0, 0, 100) *
      w.courseAndTrack.courseWinRate +
    normalize(stats.courseForm?.placeRate || 0, 0, 100) *
      w.courseAndTrack.coursePlaceRate +
    normalize(
      stats.trackConfigPerformance?.find((t) => t.style === "left-handed")
        ?.winRate || 0,
      0,
      100
    ) *
      w.courseAndTrack.leftHandedWinRate +
    normalize(
      stats.trackConfigPerformance?.find((t) => t.style === "right-handed")
        ?.winRate || 0,
      0,
      100
    ) *
      w.courseAndTrack.rightHandedWinRate +
    normalize(
      stats.trackConfigPerformance?.find((t) => t.style === "straight")
        ?.winRate || 0,
      0,
      100
    ) *
      w.courseAndTrack.straightWinRate +
    normalize(stats.surfaceStats?.["aw"]?.winRate || 0, 0, 100) *
      w.courseAndTrack.awWinRate +
    normalize(stats.surfaceStats?.["turf"]?.winRate || 0, 0, 100) *
      w.courseAndTrack.turfWinRate;

  // Going & Conditions (10%)
  const goingScore =
    normalize(
      stats.goingPerformance?.find(
        (g) => g.type === race.going?.toLowerCase() || ""
      )?.winRate || 0,
      0,
      100
    ) *
      w.goingAndConditions.currentGoingWinRate +
    normalize(
      stats.goingPerformance?.find((g) => g.type === "good")?.winRate || 0,
      0,
      100
    ) *
      w.goingAndConditions.goodGoingWinRate +
    normalize(
      stats.goingPerformance?.find(
        (g) => g.type === race.trackCondition?.toLowerCase()
      )?.winRate || 0,
      0,
      100
    ) *
      w.goingAndConditions.trackConditionWinRate +
    normalize(stats.seasonalForm?.[currentSeason] || 0, 0, maxSeasonalForm) *
      w.goingAndConditions.seasonalForm;

  // Weight & Age (5%)
  const physicalScore =
    normalize(
      horse.weight.pounds,
      raceStats.avgWeight - 10,
      raceStats.avgWeight + 10
    ) *
      w.physicalFactors.weightCarried +
    normalize(parseInt(horse.age), raceStats.avgAge - 2, raceStats.avgAge + 2) *
      w.physicalFactors.ageProfile +
    normalize(
      stats.weightProgression?.[0] || 0,
      stats.minWeight || 0,
      stats.maxWeight || 0
    ) *
      w.physicalFactors.weightProgression;

  // Prize Money & Class Level (5%)
  const prizeScore =
    normalize(stats.avgEarningsPerRace || 0, 0, stats.highestPrize || 1) *
      w.prizeMoney.avgEarnings +
    normalize(stats.totalEarnings || 0, 0, raceStats.totalPrizeMoney * 2) *
      w.prizeMoney.totalEarnings +
    normalize(stats.avgPrize || 0, 0, raceStats.avgPrizeMoney * 1.5) *
      w.prizeMoney.avgPrize;

  // Days Since Last Run (5%)
  const freshnessScore =
    normalize(stats.daysOffTrack, 7, 60) * w.freshness.daysOff +
    normalize(stats.racingFrequency, 0.5, 4) * w.freshness.racingFrequency;

  // Prediction Factors (10%)
  const predictionScore = race.predictions
    ? (() => {
        const prediction = race.predictions.find(
          (p) => p.id === parseInt(horse.number)
        );
        if (!prediction) return 0;

        return (
          normalize(prediction.score, 0, 100) * w.predictions.predictedScore +
          normalize(prediction.saddle_cloth_number || 0, race.runners || 0, 1) *
            w.predictions.predictedPosition +
          (prediction.dist_to_winner ? 0 : w.predictions.distanceToWinner)
        );
      })()
    : 0;

  const totalScore =
    (recentFormScore +
      classScore +
      distanceScore +
      courseScore +
      goingScore +
      physicalScore +
      prizeScore +
      freshnessScore +
      predictionScore) *
    100;

  return Math.max(0, Math.min(100, totalScore));
}

function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}
