import { ScoreComponent, ScoreParams } from "./types";

export function calculateMarketScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  const lastSixRuns = horse.formObj?.form?.slice(0, 6) || [];

  // Well backed when winning
  const wellBackedWins = lastSixRuns.filter(
    (run) =>
      run.raceOutcomeCode === "1" &&
      run.oddsDesc &&
      parseFloat(run.oddsDesc) < 6.0
  ).length;

  if (wellBackedWins > 0) score++;
  if (wellBackedWins > 1) score++;

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
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
