import { calculateDaysOff } from "./funcs";
import { ScoreComponent, ScoreParams } from "./types";

export function calculateLayoffScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  const daysOff = horse.stats?.daysOffTrack || 0;
  const form = horse.formObj?.form || [];

  // Good fresh record
  const freshRuns = form.filter((r) => {
    const runDaysOff = calculateDaysOff(r.raceDatetime);
    return runDaysOff > 60 && r.raceOutcomeCode === "1";
  });

  if (freshRuns.length >= 2) score += 3;
  if (freshRuns.length >= 1) score += 2;

  // Current layoff suitability
  if (daysOff < 30) score += 3;
  else if (daysOff < 60 && freshRuns.length > 0) score += 2;

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
