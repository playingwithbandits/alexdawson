import { ScoreComponent, ScoreParams } from "./types";

export function calculateFieldSizeScore({
  horse,
  race,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 3;

  const currentFieldSize = race.runners || 0;
  const recentRuns = horse.formObj?.form?.slice(0, 12) || [];

  // Calculate average field size from recent runs
  const fieldSizes = recentRuns
    .map((run) => run.noOfRunners || 0)
    .filter(Boolean);
  const avgFieldSize = fieldSizes.length
    ? fieldSizes.reduce((a, b) => a + b, 0) / fieldSizes.length
    : 0;

  // Score based on field size experience
  if (avgFieldSize > 0) {
    // Experienced at this field size
    if (Math.abs(avgFieldSize - currentFieldSize) <= 2) score++;

    // Success in similar sized fields
    const similarSizeRuns = recentRuns.filter(
      (run) => Math.abs((run.noOfRunners || 0) - currentFieldSize) <= 2
    );

    const wins = similarSizeRuns.filter(
      (run) => run.raceOutcomeCode === "1"
    ).length;
    const places = similarSizeRuns.filter(
      (run) => parseInt(run.raceOutcomeCode || "99") <= 3
    ).length;

    if (wins > 0) score++;
    if (places / similarSizeRuns.length > 0.5) score++;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
