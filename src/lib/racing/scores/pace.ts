import { ScoreComponent, ScoreParams } from "./types";

export function calculatePaceScore({
  horse,
  race,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 4;

  // Analyze running style from recent form
  const recentRuns = horse.formObj?.form?.slice(0, 12) || [];
  const runningStyles = recentRuns.map((run) => {
    const comment = run.rpCloseUpComment?.toLowerCase() || "";

    // Determine if front-runner
    if (comment.includes("made all") || comment.includes("led")) return "front";
    // Determine if held up
    if (comment.includes("held up") || comment.includes("in rear"))
      return "held up";
    // Determine if prominent
    if (comment.includes("prominent") || comment.includes("tracked leader"))
      return "prominent";
    // Default to midfield
    return "midfield";
  });

  // Calculate preferred running style
  const styleCounts = runningStyles.reduce((acc, style) => {
    acc[style] = (acc[style] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const preferredStyle = Object.entries(styleCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];

  // Score based on field size and likely pace scenario
  if (race.runners) {
    // Small field advantage for front runners
    if (race.runners <= 8 && preferredStyle === "front") score += 2;
    // Large field advantage for held up horses
    if (race.runners >= 12 && preferredStyle === "held up") score += 2;
  }

  // Score based on consistency of running style
  const mostFrequentCount = Math.max(...Object.values(styleCounts));
  if (mostFrequentCount >= 3) score += 2;

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
