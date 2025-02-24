import { ScoreComponent, ScoreParams } from "./types";

export function calculateHeadGearScore({ horse }: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 3;

  if (!horse.headGear) {
    return { score: maxScore, maxScore, percentage: 0 };
  }

  const currentGear = horse.headGear.code;
  const recentRuns = horse.formObj?.form?.slice(0, 12) || [];

  // Check effectiveness of current headgear
  const runsWithCurrentGear = recentRuns.filter(
    (run) => run.horseHeadGear?.toLowerCase() === currentGear.toLowerCase()
  );

  if (runsWithCurrentGear.length > 0) {
    const winsWithGear = runsWithCurrentGear.filter(
      (run) => run.raceOutcomeCode === "1"
    ).length;
    const placesWithGear = runsWithCurrentGear.filter(
      (run) => parseInt(run.raceOutcomeCode || "99") <= 3
    ).length;

    // Score based on success with current headgear
    if (winsWithGear > 0) score++;
    if (placesWithGear > 0) score++;
    if (placesWithGear / runsWithCurrentGear.length > 0.5) score++;
  } else {
    // First time headgear can be positive
    score += 1;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
