import { ScoreComponent, ScoreParams } from "../types";

export function calculateRacedAgainstScore({
  horse,
  raceStats,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 12;

  const { lastRaceStatsRaceInfo } = raceStats;

  const {
    runners_beaten,
    averages_all,
    maxes_all,
    averages_beaten,
    maxes_beaten,
  } = horse.lastRaceStats || {};

  if ((averages_beaten?.or || 0) >= (lastRaceStatsRaceInfo.beatenAvg.or || 0)) {
    score += 1;
  }
  if (
    (averages_beaten?.rpr || 0) >= (lastRaceStatsRaceInfo.beatenAvg.rpr || 0)
  ) {
    score += 1;
  }
  if ((averages_beaten?.ts || 0) >= (lastRaceStatsRaceInfo.beatenAvg.ts || 0)) {
    score += 1;
  }
  if ((maxes_beaten?.or || 0) >= (lastRaceStatsRaceInfo.beatenMax.or || 0)) {
    score += 1;
  }
  if ((maxes_beaten?.rpr || 0) >= (lastRaceStatsRaceInfo.beatenMax.rpr || 0)) {
    score += 1;
  }
  if ((maxes_beaten?.ts || 0) >= (lastRaceStatsRaceInfo.beatenMax.ts || 0)) {
    score += 1;
  }

  if ((averages_all?.or || 0) >= (lastRaceStatsRaceInfo.avg.or || 0)) {
    score += 1;
  }
  if ((averages_all?.rpr || 0) >= (lastRaceStatsRaceInfo.avg.rpr || 0)) {
    score += 1;
  }
  if ((averages_all?.ts || 0) >= (lastRaceStatsRaceInfo.avg.ts || 0)) {
    score += 1;
  }
  if ((maxes_all?.or || 0) >= (lastRaceStatsRaceInfo.max.or || 0)) {
    score += 1;
  }
  if ((maxes_all?.rpr || 0) >= (lastRaceStatsRaceInfo.max.rpr || 0)) {
    score += 1;
  }
  if ((maxes_all?.ts || 0) >= (lastRaceStatsRaceInfo.max.ts || 0)) {
    score += 1;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
