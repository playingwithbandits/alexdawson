import { Race, RaceStats, Horse } from "@/types/racing";
import { normalize } from "@/lib/utils";

export function calculateHorseScore(
  horse: Horse,
  race: Partial<Race>,
  stats: RaceStats
): number {
  const weights = {
    rating: 0.3,
    officialRating: 0.25,
    topSpeed: 0.2,
    age: 0.1,
    weight: 0.1,
    lastRun: 0.05,
  };

  const scores = {
    rating: normalize(parseInt(horse.rating) || 0, stats.avgRating),
    officialRating: normalize(
      parseInt(horse.officialRating) || 0,
      stats.avgOfficialRating
    ),
    topSpeed: normalize(parseInt(horse.topSpeed) || 0, stats.avgTopSpeed),
    age: normalize(parseInt(horse.age) || 0, stats.avgAge),
    weight: normalize(horse.weight.pounds, stats.avgWeight),
    lastRun: normalize(
      parseInt(horse.lastRun?.split(" ")[0] || "0"),
      stats.avgLastRunDays
    ),
  };

  const weightedScore = Object.entries(weights).reduce(
    (sum, [key, weight]) => sum + scores[key as keyof typeof scores] * weight,
    0
  );

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  );

  console.log("totalScore", {
    weightedScore,
    totalScore,
    scores,
    horse,
    stats,
  });

  return normalize(weightedScore, totalScore);
}
