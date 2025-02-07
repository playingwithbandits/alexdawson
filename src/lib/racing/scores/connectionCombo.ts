import { ScoreComponent, ScoreParams } from "./types";

export function calculateConnectionComboScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 4;

  // Find previous runs with same jockey combo
  const comboRuns = horse.formObj?.form?.filter(
    (run) =>
      run.jockeyShortName?.toLowerCase() === horse.jockey.name.toLowerCase()
  );

  if (comboRuns?.length) {
    // Successful partnership
    const comboWins = comboRuns.filter(
      (r) => parseInt(r.raceOutcomeCode || "0") === 1
    ).length;
    const comboPlaces = comboRuns.filter(
      (r) => parseInt(r.raceOutcomeCode || "99") <= 3
    ).length;

    if (comboWins > 0) score++;
    if (comboWins > 1) score++;
    if (comboPlaces / comboRuns.length > 0.5) score++;

    // Recent success with combo
    const recentComboSuccess = comboRuns
      .slice(0, 3)
      .some((r) => parseInt(r.raceOutcomeCode || "99") <= 3);
    if (recentComboSuccess) score++;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
