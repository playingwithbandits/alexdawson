import { ScoreComponent, ScoreParams } from "./types";

export function calculateOfficialRatingScore({
  horse,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 2;

  if (horse.stats?.officialRatingProgression) {
    const progression = horse.stats.officialRatingProgression;

    const maxRating = Math.max(...progression);

    // Currently well rated vs best
    if (progression[0] >= maxRating - 5) score++;

    // Well handicapped vs peak
    const dropFromBest = maxRating - progression[0];
    if (dropFromBest > 0 && dropFromBest < 10) score++;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
