import { ScoreComponent, ScoreParams } from "./types";

export function calculateMarginsScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 8;

  const margins = horse.stats?.margins;

  // Reward horses that win decisively
  if (margins?.avgWinningDistance && margins?.avgWinningDistance > 1) score++;
  if (margins?.avgWinningDistance && margins?.avgWinningDistance > 2) score++;
  if (margins?.avgWinningDistance && margins?.avgWinningDistance > 3) score++;
  if (margins?.avgWinningDistance && margins?.avgWinningDistance > 4) score++;

  // Reward horses that stay close when beaten
  if (margins?.avgBeatenDistance && margins?.avgBeatenDistance < 1) score++;
  if (margins?.avgBeatenDistance && margins?.avgBeatenDistance < 2) score++;
  if (margins?.avgBeatenDistance && margins?.avgBeatenDistance < 3) score++;
  if (margins?.avgBeatenDistance && margins?.avgBeatenDistance < 4) score++;

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
