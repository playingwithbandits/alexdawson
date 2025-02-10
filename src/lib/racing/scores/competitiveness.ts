import { ScoreComponent, ScoreParams } from "./types";

export function calculateCompetitivenessScore({
  horse,
  race,
  raceStats,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 5;

  // Analyze race competitiveness
  const ratingSpread = raceStats.avgRating * 0.1; // 10% of average rating
  const horseRating = parseInt(horse.rating);

  // Within competitive rating range
  if (Math.abs(horseRating - raceStats.avgRating) <= ratingSpread) {
    score += 2;
  }

  // Recent competitive races
  const recentRuns = horse.formObj?.form?.slice(0, 4) || [];
  const competitiveRaces = recentRuns.filter((run) => {
    const finishPos = parseInt(run.raceOutcomeCode || "99");
    const totalRunners = run.numberOfRunners || 0;

    // Finished in top half of field
    if (totalRunners > 0) {
      return finishPos <= totalRunners / 2;
    }
    return false;
  });

  if (competitiveRaces.length >= 2) score += 2;
  if (competitiveRaces.length >= 3) score += 1;

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
