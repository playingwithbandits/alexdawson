import { ScoreComponent, ScoreParams } from "./types";

export function calculateClassScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 4;

  // Class winner
  const hasWonInClass =
    horse.formObj?.form?.some(
      (f) =>
        parseInt(f.raceOutcomeCode || "0") === 1 &&
        f.raceClass &&
        f.raceClass <= race.class
    ) || false;
  if (hasWonInClass) score++;

  // Class experience
  const hasClassExperience =
    horse.formObj?.form?.some(
      (f) => f.raceClass && f.raceClass <= race.class
    ) || false;
  if (hasClassExperience) score++;

  // Proven at higher class
  if (
    horse.formObj?.form?.some(
      (f) =>
        f.raceOutcomeCode === "1" && f.raceClass && f.raceClass < race.class
    )
  )
    score++;

  // Consistent at this level
  const classPerformance = horse.formObj?.form
    ?.filter((f) => f.raceClass && f.raceClass === race.class)
    .filter((f) => parseInt(f.raceOutcomeCode || "99") <= 4).length;

  if (classPerformance && classPerformance >= 3) score++;

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
