import { ScoreComponent, ScoreParams } from "./types";

export function calculateCompetitivenessScore({
  horse,
  race,
  raceStats,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 3;

  // Analyze race competitiveness
  const ratingSpread = raceStats.avgRating * 0.1; // 10% of average rating
  const horseRating = parseInt(horse.rating);

  // Within competitive rating range
  if (Math.abs(horseRating - raceStats.avgRating) <= ratingSpread) {
    score++;
  }

  // Recent competitive races
  const recentRuns = horse.formObj?.form?.slice(0, 6) || [];
  const competitiveRaces = recentRuns.filter((run) => {
    const finishPos = parseInt(run.raceOutcomeCode || "99");
    const totalRunners = run.noOfRunners || 0;

    // Finished in top half of field
    if (totalRunners > 0) {
      return finishPos <= totalRunners / 2;
    }
    return false;
  });

  if (competitiveRaces.length >= 2) score++;
  if (competitiveRaces.length >= 3) score++;

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
