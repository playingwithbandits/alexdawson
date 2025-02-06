import { ScoreComponent, ScoreParams } from "./types";

export function calculateFormProgressionScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  const progression = horse.stats?.formProgression;
  if (progression) {
    // Improving form trend
    if (progression.positionTrend === "improving") score += 4;
    if (progression.positionTrend === "steady") score += 2;

    // Good average position
    if (progression.averagePosition <= 3) score += 3;
    else if (progression.averagePosition <= 4) score += 2;

    // Recent good positions
    const goodPositions = progression.lastSixPositions.filter(
      (p) => p <= 3
    ).length;
    if (goodPositions >= 3) score += 3;
  }

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
