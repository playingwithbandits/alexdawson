import { ScoreComponent, ScoreParams } from "./types";

export function calculateClassMovementScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  const classStats = horse.stats?.classStats;
  if (classStats) {
    // Proven at this level or higher
    if (classStats.highestClass <= parseInt(race.class)) score += 3;

    // Progressive through classes
    const isProgressive = classStats.classProgression.every(
      (c, i, arr) => i === 0 || c <= arr[i - 1]
    );
    if (isProgressive) score += 4;

    // Well handicapped compared to best
    if (classStats.currentClass > classStats.highestClass + 2) score += 3;
  }

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
