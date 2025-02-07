import { isWithinTenPercent } from "./funcs";
import { ScoreComponent, ScoreParams } from "./types";

export function calculateFormScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 10;

  // Last time out winner
  if (horse.formObj?.form?.[0]?.raceOutcomeCode === "1") score++;

  // Placed last time out
  if (parseInt(horse.formObj?.form?.[0]?.raceOutcomeCode || "99") <= 3) score++;

  // Multiple recent wins
  const recentWins = horse.formObj?.form
    ?.slice(0, 6)
    .filter((f) => f.raceOutcomeCode === "1").length;
  if (recentWins && recentWins > 1) score++;

  // Consistent placements
  const recentPlacements = horse.formObj?.form
    ?.slice(0, 6)
    .filter((f) => parseInt(f.raceOutcomeCode || "99") <= 3).length;
  if (recentPlacements && recentPlacements >= 3) score++;

  // Recent class win
  const recentClassWin = horse.formObj?.form
    ?.slice(0, 4)
    .some(
      (f) =>
        f.raceOutcomeCode === "1" && f.raceClass && f.raceClass <= race.class
    );
  if (recentClassWin) score++;

  // Recent class placement
  const recentClassPlace = horse.formObj?.form
    ?.slice(0, 4)
    .some(
      (f) =>
        parseInt(f.raceOutcomeCode || "99") <= 3 &&
        f.raceClass &&
        f.raceClass <= race.class
    );
  if (recentClassPlace) score++;

  // Recent course win
  const recentCourseWin = horse.formObj?.form
    ?.slice(0, 6)
    .some(
      (f) =>
        f.raceOutcomeCode === "1" &&
        f.courseName?.toLowerCase() === meetingDetails.venue?.toLowerCase()
    );
  if (recentCourseWin) score++;

  const recentCoursePlace = horse.formObj?.form
    ?.slice(0, 6)
    .some(
      (f) =>
        parseInt(f.raceOutcomeCode || "99") <= 3 &&
        f.courseName?.toLowerCase() === meetingDetails.venue?.toLowerCase()
    );
  if (recentCoursePlace) score++;
  // Recent distance win
  const recentDistanceWin = horse.formObj?.form
    ?.slice(0, 6)
    .some(
      (f) =>
        f.raceOutcomeCode === "1" &&
        isWithinTenPercent(f.distanceFurlong || 0, race.distance || 0)
    );
  if (recentDistanceWin) score++;

  // Recent distance placement
  const recentDistancePlace = horse.formObj?.form
    ?.slice(0, 6)
    .some(
      (f) =>
        parseInt(f.raceOutcomeCode || "99") <= 3 &&
        isWithinTenPercent(f.distanceFurlong || 0, race.distance || 0)
    );
  if (recentDistancePlace) score++;

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
