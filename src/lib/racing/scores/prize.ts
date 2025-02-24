import { ScoreComponent, ScoreParams } from "./types";

export function calculatePrizeScore({
  horse,
  race,
  raceStats,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 3;

  // Above average earnings per race
  if ((horse.stats?.avgEarningsPerRace || 0) >= raceStats.avgEarningsPerRace)
    score++;
  // Has won more valuable races
  const racePrize = parseInt(race.prize?.replace(/[£,]/g, "") || "0");
  if ((horse.stats?.highestPrize || 0) > racePrize) score++;

  // Above average prize money performance
  if ((horse.stats?.avgPrize || 0) > raceStats.avgPrizeMoney) score++;

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
