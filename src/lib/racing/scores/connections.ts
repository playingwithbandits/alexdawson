import { horseNameToKey } from "./funcs";
import { ScoreComponent, ScoreParams } from "./types";

export function calculateConnectionsScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 6;

  const jockeyStats = race.raceExtraInfo?.jockeyStats?.find(
    (j) =>
      horseNameToKey(j.name.toLowerCase().trim()) ===
      horseNameToKey(horse.jockey.name.toLowerCase().trim())
  );
  const trainerStats = race.raceExtraInfo?.trainerStats?.find(
    (t) =>
      horseNameToKey(t.name.toLowerCase().trim()) ===
      horseNameToKey(horse.trainer.name.toLowerCase().trim())
  );

  // Jockey in form (14 day strike rate > 15%)
  if ((jockeyStats?.last14Days?.winRate || 0) > 15) score++;

  // Jockey profitable to follow
  if ((jockeyStats?.last14Days?.profit || 0) > 0) score++;

  // Jockey above average strike rate
  const avgJockeyRate =
    race.raceExtraInfo?.jockeyStats
      ?.map((x) => x.last14Days.winRate)
      ?.reduce((sum, t) => sum + (t || 0), 0) ||
    0 / (race.raceExtraInfo?.jockeyStats?.length || 1);

  if ((jockeyStats?.last14Days?.winRate || 0) > avgJockeyRate) score++;

  // Trainer in form (14 day strike rate > 15%)
  if ((trainerStats?.last14Days?.winRate || 0) > 15) score++;

  // Trainer profitable to follow
  if ((trainerStats?.last14Days?.profit || 0) > 0) score++;

  // Trainer above average strike rate
  const avgTrainerRate =
    race.raceExtraInfo?.trainerStats
      ?.map((x) => x.last14Days.winRate)
      ?.reduce((sum, t) => sum + (t || 0), 0) ||
    0 / (race.raceExtraInfo?.trainerStats?.length || 1);
  if ((trainerStats?.last14Days?.winRate || 0) > avgTrainerRate) score++;

  console.log("connextions", {
    horse,
    race,
    stats: {
      jockeyObj: race.raceExtraInfo?.jockeyStats,
      trainerObj: race.raceExtraInfo?.trainerStats,
      name: horseNameToKey(horse.jockey.name.toLowerCase().trim()),
      trainer: horseNameToKey(horse.trainer.name.toLowerCase().trim()),
      jockeyStats,
      trainerStats,
    },
    jockey: {
      avgJockeyRate,
      winRate: jockeyStats?.last14Days?.winRate,
    },

    trainer: {
      avgTrainerRate,
      winRate: trainerStats?.last14Days?.winRate,
    },
    score: {
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
    },
  });
  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
