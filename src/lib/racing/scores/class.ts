import { ScoreComponent, ScoreParams } from "./types";

export function calculateClassScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  // Class winner
  const hasWonInClass =
    horse.formObj?.form?.some(
      (f) =>
        f.raceOutcomeCode === "1" &&
        f.raceClass &&
        f.raceClass <= parseInt(race.class.replace(/\D/g, ""))
    ) || false;
  if (hasWonInClass) score++;

  // Class experience
  const hasClassExperience =
    horse.formObj?.form?.some(
      (f) =>
        f.raceClass && f.raceClass <= parseInt(race.class.replace(/\D/g, ""))
    ) || false;
  if (hasClassExperience) score++;

  // Progressive in class
  const classProgression = horse.stats?.classProgression || [];
  if (
    classProgression.length >= 3 &&
    classProgression.every((c, i) => i === 0 || c <= classProgression[i - 1])
  )
    score++;

  // Proven at higher class
  if (
    horse.formObj?.form?.some(
      (f) =>
        f.raceOutcomeCode === "1" &&
        f.raceClass &&
        f.raceClass < parseInt(race.class.replace(/\D/g, ""))
    )
  )
    score++;

  // Consistent at this level
  const classPerformance = horse.formObj?.form
    ?.filter(
      (f) =>
        f.raceClass && f.raceClass === parseInt(race.class.replace(/\D/g, ""))
    )
    .filter((f) => parseInt(f.raceOutcomeCode || "99") <= 4).length;
  if (classPerformance && classPerformance >= 3) score++;

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
