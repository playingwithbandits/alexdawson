import { ScoreComponent, ScoreParams } from "./types";

export function calculateTrackConfigScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  const trackConfig = horse.stats?.trackConfigPerformance?.find(
    (t) => t.style === race?.trackConfig || "unknown"
  );

  if (trackConfig) {
    // Good win rate on this configuration
    if (trackConfig.winRate > 25) score += 4;
    if (trackConfig.winRate > 15) score += 2;

    // Experience on this configuration
    if (trackConfig.runs >= 5) score += 3;
    if (trackConfig.runs >= 3) score += 1;
  }

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
