import { ScoreComponent, ScoreParams } from "./types";

export function calculateImprovementScore({
  horse,
  race,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 3;

  const recentRuns = horse.formObj?.form?.slice(0, 6) || [];

  // Check for progressive form pattern
  const ratings = recentRuns
    .map((run) => run.rpPostmark || 0)
    .filter((r) => r && r > 0);

  if (ratings.length >= 2) {
    // Improving ratings pattern
    const isProgressive = ratings.every(
      (rating, i) => i === 0 || rating! >= ratings[i - 1]!
    );
    if (isProgressive) score++;

    // Significant recent improvement
    const latestRating = ratings[0];
    const previousBest = Math.max(...ratings.slice(1)) || 0;
    if (latestRating! > previousBest!) score++;
  }

  // Young horse with scope for improvement
  const age = parseInt(horse.age);
  if (age <= 4) score++;

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
