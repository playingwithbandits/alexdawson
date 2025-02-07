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
      j.jockey.toLowerCase().trim() === horse.jockey.name.toLowerCase().trim()
  );
  const trainerStats = race.raceExtraInfo?.trainerStats?.find(
    (t) =>
      t.trainer.toLowerCase().trim() === horse.trainer.name.toLowerCase().trim()
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

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
