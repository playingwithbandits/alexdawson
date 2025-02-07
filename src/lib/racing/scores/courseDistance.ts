import { isWithinTenPercent } from "./funcs";
import { ScoreComponent, ScoreParams } from "./types";

export function calculateCourseDistanceScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 2;

  const cdRuns =
    horse.formObj?.form?.filter(
      (r) =>
        r.courseName?.toLowerCase() === meetingDetails?.venue?.toLowerCase() &&
        isWithinTenPercent(r.distanceFurlong || 0, race.distance)
    ) || [];

  if (cdRuns.length > 0) {
    // C&D wins
    const cdWins = cdRuns.filter((r) => r.raceOutcomeCode === "1").length;
    if (cdWins > 0) score++;

    // C&D place rate
    const cdPlaces = cdRuns.filter(
      (r) => parseInt(r.raceOutcomeCode || "0") <= 3
    ).length;
    if (cdPlaces > 0) score++;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
