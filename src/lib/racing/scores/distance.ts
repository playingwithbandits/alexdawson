import { avg } from "@/lib/utils";
import { distanceToWinnerStrToFloat } from "../calculateHorseStats";
import { ScoreComponent, ScoreParams } from "./types";

export function calculateDistanceScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  // Get distance stats for this range
  const rangeStats = horse.stats?.distanceStats?.performanceByType;

  // Score based on performance in distance category
  if (rangeStats) {
    const category =
      raceStats.distanceInFurlongs <= 7
        ? rangeStats.sprint
        : raceStats.distanceInFurlongs <= 9
        ? rangeStats.mile
        : raceStats.distanceInFurlongs <= 12
        ? rangeStats.middle
        : rangeStats.staying;

    if (category.winRate > 20) score += 2;
    if (category.runs >= 5) score += 1;
  }

  // Has won at this distance range
  const distanceWins =
    horse.formObj?.form?.filter(
      (r) =>
        r.raceOutcomeCode === "1" &&
        Math.abs((r.distanceFurlong || 0) - raceStats.distanceInFurlongs) <= 1
    ).length || 0;
  if (distanceWins > 0) score += 3;
  if (distanceWins > 1) score += 2;

  // Strong win rate at this distance
  const distanceRuns =
    horse.formObj?.form?.filter(
      (r) =>
        Math.abs((r.distanceFurlong || 0) - raceStats.distanceInFurlongs) <= 1
    ) || [];
  if (distanceRuns?.length >= 3) {
    const winRate = (distanceWins / distanceRuns.length) * 100;
    if (winRate > 25) score += 2;
    if (winRate > 40) score += 2;
  }

  // Distance within horse's proven range
  const minDistance = horse.stats?.minDistance || 0;
  const maxDistance = horse.stats?.maxDistance || 0;
  if (
    raceStats.distanceInFurlongs >= minDistance &&
    raceStats.distanceInFurlongs <= maxDistance
  ) {
    score += 1;
    // Comfortably within range (not at extremes)
    if (
      raceStats.distanceInFurlongs >= minDistance + 1 &&
      raceStats.distanceInFurlongs <= maxDistance - 1
    ) {
      score += 2;
    }
  }

  // Good margins at this distance
  const distanceMargins = horse.formObj?.form
    ?.filter(
      (r) =>
        Math.abs((r.distanceFurlong || 0) - raceStats.distanceInFurlongs) <= 1
    )
    .map((r) => {
      if (r.raceOutcomeCode === "1") {
        return distanceToWinnerStrToFloat(r.winningDistance || "");
      }
      return -distanceToWinnerStrToFloat(r.distanceToWinner || "");
    });

  if (distanceMargins?.length && distanceMargins.length >= 3) {
    const avgMargin = avg(distanceMargins);
    if (avgMargin > 0) score += 2; // Net positive margins
    if (avgMargin > 1) score += 2; // Strong positive margins
  }

  const scoreComponent: ScoreComponent = {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };

  return scoreComponent;
}
