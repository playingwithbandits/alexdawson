import { ScoreComponent, ScoreParams } from "./types";

export function calculateFormScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

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

  // Progressive form
  const rprs = horse.formObj?.form
    ?.slice(0, 4)
    .map((f) => f.rpPostmark)
    .filter((r): r is number => r !== undefined);
  if (
    rprs &&
    rprs?.length >= 3 &&
    rprs?.every((rpr, i) => i === 0 || rpr >= (rprs[i - 1] || 0))
  )
    score++;

  // Recent class win
  const recentClassWin = horse.formObj?.form
    ?.slice(0, 4)
    .some(
      (f) =>
        f.raceOutcomeCode === "1" &&
        f.raceClass &&
        f.raceClass <= parseInt(race.class.replace(/\D/g, ""))
    );
  if (recentClassWin) score++;

  // Recent course win
  const recentCourseWin = horse.formObj?.form
    ?.slice(0, 6)
    .some(
      (f) =>
        f.raceOutcomeCode === "1" &&
        f.courseName?.toLowerCase() === meetingDetails.venue?.toLowerCase()
    );
  if (recentCourseWin) score++;

  // Recent distance win
  const recentDistanceWin = horse.formObj?.form
    ?.slice(0, 6)
    .some(
      (f) =>
        f.raceOutcomeCode === "1" &&
        Math.abs(
          f.distanceFurlong || 0 - (raceStats.distanceInFurlongs || 0)
        ) <= 1
    );
  if (recentDistanceWin) score++;

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
