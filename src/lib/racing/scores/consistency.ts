import { calculateVariance } from "./funcs";
import { ScoreComponent, ScoreParams } from "./types";

export function calculateConsistencyScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 3;

  const validRuns = horse.formObj?.form?.slice(0, 6) || [];
  if (validRuns.length >= 3) {
    // Finishing positions consistency
    const positions = validRuns
      .map((r) => parseInt(r.raceOutcomeCode || "0"))
      .filter((p) => p > 0);
    // Calculate how much the finishing positions vary from their average
    // Lower variance means more consistent finishes
    const positionVariance = calculateVariance(positions);
    if (positionVariance < 2) score++;
    if (positionVariance < 4) score++;

    // Performance level consistency
    const ratings = validRuns
      .map((r) => r.rpPostmark || 0)
      .filter((r) => r > 0);
    const ratingVariance = calculateVariance(ratings);
    if (ratingVariance < 5) score++;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
