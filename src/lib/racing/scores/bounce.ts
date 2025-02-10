import { ScoreComponent, ScoreParams } from "./types";

export function calculateBounceScore({
  horse,
  race,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 5;

  const recentRuns = horse.formObj?.form?.slice(0, 4) || [];
  if (recentRuns.length === 0) {
    return { score: 0, maxScore, percentage: 0 };
  }

  const lastRun = recentRuns[0];
  const daysOff = horse.stats?.daysOffTrack || 0;

  // Check if last run was a big effort
  const wasBigEffort =
    lastRun.raceOutcomeCode === "1" || // Won
    parseInt(lastRun.rpPostmark || "0") >= 100 || // High rating
    lastRun.rpCloseUpComment?.toLowerCase().includes("hard race");

  if (wasBigEffort) {
    // Score based on recovery time
    if (daysOff >= 28) score += 3; // Good recovery
    else if (daysOff >= 21) score += 2; // Adequate recovery
    else if (daysOff >= 14) score += 1; // Minimal recovery

    // Check pattern after previous big efforts
    const previousBouncePattern = recentRuns.slice(1).some((run, index) => {
      const prevRun = recentRuns[index];
      return (
        (run.raceOutcomeCode === "1" ||
          parseInt(run.rpPostmark || "0") >= 100) &&
        parseInt(prevRun.raceOutcomeCode || "99") > 4
      );
    });

    if (!previousBouncePattern) score += 2; // No history of bouncing
  } else {
    // No bounce risk if last run wasn't a big effort
    score = maxScore;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
