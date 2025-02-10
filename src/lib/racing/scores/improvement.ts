import { ScoreComponent, ScoreParams } from "./types";

export function calculateImprovementScore({
  horse,
  race,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 5;

  const recentRuns = horse.formObj?.form?.slice(0, 4) || [];

  // Check for progressive form pattern
  const ratings = recentRuns
    .map((run) => parseInt(run.rpPostmark || "0"))
    .filter((r) => r > 0);

  if (ratings.length >= 2) {
    // Improving ratings pattern
    const isProgressive = ratings.every(
      (rating, i) => i === 0 || rating >= ratings[i - 1]
    );
    if (isProgressive) score += 2;

    // Significant recent improvement
    const latestRating = ratings[0];
    const previousBest = Math.max(...ratings.slice(1));
    if (latestRating > previousBest) score += 2;
  }

  // Young horse with scope for improvement
  const age = parseInt(horse.age);
  if (age <= 4) score += 1;

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
