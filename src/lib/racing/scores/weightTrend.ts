import { ScoreComponent, ScoreParams } from "./types";

export function calculateWeightTrendScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 3;

  // Well weighted compared to field average
  if (horse.weight.pounds < raceStats.avgWeight) score++;

  const horseWeight =
    horse.weight.pounds - (parseInt(horse.jockey.allowance || "0") || 0);

  // Proven at this weight
  // Example: If horse carried 130lbs and won, and current weight is 128lbs
  // 130 > 128 so has proven can win at higher weight
  const hasWonAtWeight = horse.formObj?.form?.some(
    (f) =>
      f.raceOutcomeCode === "1" && // Won
      (f.weightCarriedLbs || 0) >= horseWeight // Carried more weight
  );
  if (hasWonAtWeight) score++;

  // Example: If horse carried 132lbs and placed, and current weight is 128lbs
  // 132 > 128 so has proven can place at higher weight
  const hasPlacedAtWeight = horse.formObj?.form?.some(
    (f) =>
      ["1", "2", "3"].includes(f.raceOutcomeCode || "") && // Won or placed
      (f.weightCarriedLbs || 0) >= horseWeight // Carried more weight
  );
  if (hasPlacedAtWeight) score++;

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
