import { ScoreComponent, ScoreParams } from "./types";

export function calculateMarginsScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  const margins = horse.stats?.margins;

  // Reward horses that win decisively
  if (margins?.avgWinningDistance && margins?.avgWinningDistance > 2)
    score += 3;
  if (margins?.avgWinningDistance && margins?.avgWinningDistance > 4)
    score += 2;

  // Reward horses that stay close when beaten
  if (margins?.avgBeatenDistance && margins?.avgBeatenDistance < 3) score += 3;
  if (margins?.avgBeatenDistance && margins?.avgBeatenDistance < 5) score += 2;

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
