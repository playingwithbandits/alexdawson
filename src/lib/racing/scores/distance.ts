import { isWithinTenPercent } from "./funcs";
import { ScoreComponent, ScoreParams } from "./types";

export function calculateDistanceScore({
  horse,
  race,
  raceStats,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 7;

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

    if (category.winRate > 20) score++;
    if (category.runs >= 2) score++;
  }

  // Has won at this distance range
  const distanceWins =
    horse.formObj?.form?.filter(
      (r) =>
        r.raceOutcomeCode === "1" &&
        isWithinTenPercent(r.distanceFurlong || 0, race.distance)
    ).length || 0;
  if (distanceWins > 0) score++;
  if (distanceWins > 1) score++;

  // Strong win rate at this distance
  const distanceRuns =
    horse.formObj?.form?.filter((r) =>
      isWithinTenPercent(r.distanceFurlong || 0, race.distance)
    ) || [];

  if (distanceRuns?.length) {
    score++;
  }

  // Distance within horse's proven range
  const minDistance = horse.stats?.minDistance || 0;
  const maxDistance = horse.stats?.maxDistance || 0;
  if (race.distance >= minDistance && race.distance <= maxDistance) {
    score++;
    // Comfortably within range (not at extremes)
    if (race.distance >= minDistance + 1 && race.distance <= maxDistance - 1) {
      score++;
    }
  }

  const scoreComponent: ScoreComponent = {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };

  return scoreComponent;
}
