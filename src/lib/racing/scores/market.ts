import { ScoreComponent, ScoreParams } from "./types";

export function calculateMarketScore({ horse }: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 3;

  const lastSixRuns = horse.formObj?.form?.slice(0, 12) || [];

  // Well backed when winning
  const wellBacked = lastSixRuns.filter(
    (run) => run.oddsDesc && parseFloat(run.oddsDesc) < 6.0
  ).length;

  if (wellBacked > 0) score++;
  if (wellBacked > 1) score++;

  // Performs well when fancied
  const fanciedRuns = lastSixRuns.filter(
    (run) => run.oddsDesc && parseFloat(run.oddsDesc) < 4.0
  );

  if (fanciedRuns.length) {
    const goodRuns = fanciedRuns.filter(
      (r) => parseInt(r.raceOutcomeCode || "99") <= 3
    ).length;

    if (goodRuns / fanciedRuns.length > 0.5) score++;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
