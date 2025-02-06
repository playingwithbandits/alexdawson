import { ScoreComponent, ScoreParams } from "./types";

export function calculateRatingsScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 8;

  // Better than average OR
  if (Number(horse.officialRating) > raceStats.avgOfficialRating) score++;
  // Significantly better OR (>10% above average)
  if (Number(horse.officialRating) > raceStats.avgOfficialRating * 1.1) score++;
  // Better than average RPR
  if (Number(horse.rating) > raceStats.avgRating) score++;
  // Significantly better RPR (>10% above average)
  if (Number(horse.rating) > raceStats.avgRating * 1.1) score++;

  // Within top 25% of field by OR
  if (
    Number(horse.officialRating) >
    raceStats.avgOfficialRating + raceStats.avgOfficialRating * 0.25
  )
    score++;
  // Within top 25% of field by RPR
  if (Number(horse.rating) > raceStats.avgRating + raceStats.avgRating * 0.25)
    score++;

  // Top Speed comparison
  if (Number(horse.topSpeed) > raceStats.avgTopSpeed) score++;
  // Significantly better Top Speed (>10% above average)
  if (Number(horse.topSpeed) > raceStats.avgTopSpeed * 1.1) score++;

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
