import { calculateVariance } from "./funcs";
import { ScoreComponent, ScoreParams } from "./types";

export function calculateConsistencyScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  const validRuns = horse.formObj?.form?.slice(0, 6) || [];
  if (validRuns.length >= 3) {
    // Finishing positions consistency
    const positions = validRuns
      .map((r) => parseInt(r.raceOutcomeCode || "0"))
      .filter((p) => p > 0);
    const positionVariance = calculateVariance(positions);
    if (positionVariance < 2) score += 4;
    if (positionVariance < 4) score += 2;

    // Performance level consistency
    const ratings = validRuns
      .map((r) => r.rpPostmark || 0)
      .filter((r) => r > 0);
    const ratingVariance = calculateVariance(ratings);
    if (ratingVariance < 5) score += 4;
  }

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
