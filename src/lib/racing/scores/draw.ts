import { ScoreComponent, ScoreParams } from "./types";

export function calculateDrawScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  const drawPerf = horse.stats?.drawPerformance;
  if (drawPerf?.runsFromBadDraw && drawPerf.runsFromBadDraw >= 3) {
    if (drawPerf.winRateFromBadDraw && drawPerf.winRateFromBadDraw > 25)
      score += 5;
    if (drawPerf.winRateFromBadDraw && drawPerf.winRateFromBadDraw > 15)
      score += 3;
    if (drawPerf.avgPositionFromBadDraw && drawPerf.avgPositionFromBadDraw < 4)
      score += 2;
  }

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
