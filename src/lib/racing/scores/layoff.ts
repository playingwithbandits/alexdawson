import { calculateDaysOff } from "./funcs";
import { ScoreComponent, ScoreParams } from "./types";

export function calculateLayoffScore({ horse }: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 7;

  const daysOff = horse.stats?.daysOffTrack || 0;
  const form = horse.formObj?.form || [];

  // Good fresh record
  const freshRuns = form.filter((r) => {
    const runDaysOff = calculateDaysOff(r.raceDatetime);
    return runDaysOff > 60 && r.raceOutcomeCode === "1";
  });

  if (freshRuns.length >= 1) {
    score++;
  }

  // Current layoff suitability
  if (daysOff < 10) score++;
  if (daysOff < 20) score++;
  if (daysOff < 30) score++;
  if (daysOff < 60) score++;
  if (daysOff < 90) score++;
  if (daysOff < 120) score++;

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
