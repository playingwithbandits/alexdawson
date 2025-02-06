import { ScoreComponent, ScoreParams } from "./types";

export function calculateCourseDistanceScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  const cdRuns =
    horse.formObj?.form?.filter(
      (r) =>
        r.courseName?.toLowerCase() === meetingDetails?.venue?.toLowerCase() &&
        Math.abs((r.distanceFurlong || 0) - raceStats.distanceInFurlongs) <= 1
    ) || [];

  if (cdRuns.length > 0) {
    // C&D wins
    const cdWins = cdRuns.filter((r) => r.raceOutcomeCode === "1").length;
    if (cdWins > 0) score += 4;
    if (cdWins > 1) score += 2;

    // C&D place rate
    const cdPlaces = cdRuns.filter(
      (r) => parseInt(r.raceOutcomeCode || "0") <= 3
    ).length;
    const cdPlaceRate = (cdPlaces / cdRuns.length) * 100;
    if (cdPlaceRate > 50) score += 4;
  }

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
