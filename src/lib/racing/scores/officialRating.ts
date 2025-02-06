import { ScoreComponent, ScoreParams } from "./types";

export function calculateOfficialRatingScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  if (horse.stats?.officialRatingProgression) {
    const progression = horse.stats.officialRatingProgression;

    // Currently well rated vs best
    if (progression[0] >= Math.max(...progression) - 5) score += 3;

    // Progressive pattern
    const isProgressive = progression.every(
      (r, i, arr) => i === 0 || r >= arr[i - 1] - 3
    );
    if (isProgressive) score += 4;

    // Well handicapped vs peak
    const dropFromBest = Math.max(...progression) - progression[0];
    if (dropFromBest > 5 && dropFromBest < 10) score += 3;
  }

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
