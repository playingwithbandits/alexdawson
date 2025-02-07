import { ScoreComponent, ScoreParams } from "./types";

export function calculateSeasonalScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 5;

  const currentMonth = new Date().getMonth();
  const isSpring = currentMonth >= 2 && currentMonth <= 4;
  const isSummer = currentMonth >= 5 && currentMonth <= 7;
  const isAutumn = currentMonth >= 8 && currentMonth <= 10;
  const isWinter = currentMonth >= 11 || currentMonth <= 1;

  // Strong record in current season
  if ((isSpring && horse.stats?.seasonalForm?.spring) || 0 > 3) score++;
  if ((isSummer && horse.stats?.seasonalForm?.summer) || 0 > 3) score++;
  if ((isAutumn && horse.stats?.seasonalForm?.autumn) || 0 > 3) score++;
  if ((isWinter && horse.stats?.seasonalForm?.winter) || 0 > 3) score++;

  // Recent runs in similar conditions
  const lastSixRuns = horse.formObj?.form?.slice(0, 6) || [];
  const similarConditionsRuns = lastSixRuns.filter((run) => {
    const similarClass = Math.abs((run.raceClass || 0) - race.class) <= 1;
    const similarDistance =
      Math.abs(
        (run.distanceFurlong || 0) - (raceStats.distanceInFurlongs || 0)
      ) <= 1;
    return similarClass && similarDistance;
  }).length;

  if (similarConditionsRuns >= 1) score++;

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
