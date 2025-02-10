import { ScoreComponent, ScoreParams } from "./types";

export function calculateTimeOfDayScore({
  horse,
  race,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 3;

  // Parse race time
  const raceTime = race.time ? new Date(race.time) : null;
  if (!raceTime) {
    return { score: maxScore, maxScore, percentage: 100 };
  }

  const hour = raceTime.getHours();
  const recentRuns = horse.formObj?.form?.slice(0, 6) || [];

  // Group performance by time of day
  const timePerformance = recentRuns.reduce(
    (acc, run) => {
      if (!run.raceDatetime) return acc;
      const runTime = new Date(run.raceDatetime);
      const runHour = runTime.getHours();

      // Group into time slots (morning/afternoon/evening)
      const isNearbyTime = Math.abs(runHour - hour) <= 2;
      if (isNearbyTime) {
        acc.similarTimeRuns++;
        if (run.raceOutcomeCode === "1") acc.wins++;
        if (parseInt(run.raceOutcomeCode || "99") <= 3) acc.places++;
      }

      return acc;
    },
    { similarTimeRuns: 0, wins: 0, places: 0 }
  );

  // Score based on time performance
  if (timePerformance.similarTimeRuns > 0) {
    // Experience at this time
    score++;
    // Success at this time
    if (timePerformance.places / timePerformance.similarTimeRuns > 0.3) {
      score++;
    }
  }

  // Bonus for consistent time preference
  if (timePerformance.similarTimeRuns >= 3) {
    score++;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
