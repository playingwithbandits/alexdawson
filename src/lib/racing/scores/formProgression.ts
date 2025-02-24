import { ScoreComponent, ScoreParams } from "./types";

export function calculateFormProgressionScore({
  horse,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 2;

  const progression = horse.stats?.formProgression;
  if (progression) {
    // Improving form trend
    if (
      progression.positionTrend === "steady" ||
      progression.positionTrend === "improving"
    )
      score++;

    // Good average position
    if (progression.averagePosition <= 3) score++;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
