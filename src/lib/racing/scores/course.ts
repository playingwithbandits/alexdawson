import { ScoreComponent, ScoreParams } from "./types";

export function calculateCourseScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  // Course winner
  if ((horse.stats?.courseForm?.wins || 0) > 0) score++;

  // Multiple course wins
  if ((horse.stats?.courseForm?.wins || 0) > 1) score++;

  // Strong course place rate
  if ((horse.stats?.courseForm?.placeRate || 0) > 50) score++;

  // Course experience
  if ((horse.stats?.courseForm?.runs || 0) > 3) score++;

  // Recent course form
  const recentCourseForm = horse.formObj?.form
    ?.slice(0, 4)
    .some(
      (f) =>
        f.courseName?.toLowerCase() === meetingDetails.venue?.toLowerCase() &&
        parseInt(f.raceOutcomeCode || "99") <= 4
    );
  if (recentCourseForm) score++;

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
