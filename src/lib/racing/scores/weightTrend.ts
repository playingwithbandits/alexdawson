import { ScoreComponent, ScoreParams } from "./types";

export function calculateWeightTrendScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  // Well weighted compared to field average
  if (horse.weight.pounds < raceStats.avgWeight) score++;

  // Weight allowance advantage
  if (horse.jockey.allowance) score++;

  // Progressive with this weight
  if (
    horse.stats?.weightProgression
      ?.slice(0, 3)
      .every((w, i, arr) => i === 0 || w >= arr[i - 1])
  )
    score++;

  // Proven at this weight
  const weightRange = 5; // 5lb tolerance
  const hasWonAtWeight = horse.formObj?.form?.some(
    (f) =>
      f.raceOutcomeCode === "1" &&
      Math.abs(f.weightCarriedLbs || 0 - horse.weight.pounds) <= weightRange
  );
  if (hasWonAtWeight) score++;

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
