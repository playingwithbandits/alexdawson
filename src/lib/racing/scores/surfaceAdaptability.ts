import { ScoreComponent, ScoreParams } from "./types";

export function calculateSurfaceAdaptabilityScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  const surfaceStats = meetingDetails?.surface
    ? horse.stats?.surfaceStats?.[meetingDetails?.surface?.toLowerCase()]
    : undefined;
  if (surfaceStats) {
    // Strong win rate on surface
    if (surfaceStats.winRate > 25) score += 4;
    if (surfaceStats.winRate > 15) score += 2;

    // Proven on surface
    if (surfaceStats.runs >= 5) score += 2;
    if (surfaceStats.wins >= 2) score += 2;
  }

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
