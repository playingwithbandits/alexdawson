import { ScoreComponent, ScoreParams } from "./types";

export function calculatePrizeScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  // Above average earnings per race
  if ((horse.stats?.avgEarningsPerRace || 0) > raceStats.avgEarningsPerRace)
    score++;

  // Has won more valuable races
  const racePrize = parseInt(race.prize?.replace(/[£,]/g, "") || "0");
  if ((horse.stats?.highestPrize || 0) > racePrize) score++;

  // Consistent prize money earner
  if ((horse.stats?.totalEarnings || 0) > raceStats.totalPrizeMoney) score++;

  // Above average prize money performance
  if ((horse.stats?.avgPrize || 0) > raceStats.avgPrizeMoney) score++;

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
