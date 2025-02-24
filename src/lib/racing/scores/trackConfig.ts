import { ScoreComponent, ScoreParams } from "./types";

export function calculateTrackConfigScore({
  horse,
  race,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 4;

  const trackConfig = horse.stats?.trackConfigPerformance?.find(
    (t) => t.style === race?.trackConfig || "unknown"
  );

  if (trackConfig) {
    // Good win rate on this configuration
    if (trackConfig.winRate > 25) score++;
    if (trackConfig.winRate > 15) score++;

    // Experience on this configuration
    if (trackConfig.runs >= 5) score++;
    if (trackConfig.runs >= 3) score++;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
