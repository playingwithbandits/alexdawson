import { normalizeTime } from "@/components/horse/DayPredictions";
import { ScoreComponent, ScoreParams } from "./types";

export function calculateTimeOfDayScore({
  horse,
  race,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 3;

  const normalizedRaceTime = normalizeTime(race.time);
  // Parse race time - create a full date string for today
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const raceTime = normalizedRaceTime
    ? new Date(`${today}T${normalizedRaceTime}:00`)
    : null;

  if (!raceTime) {
    //console.log("[TimeOfDay] No race time found, returning default score");
    return { score: maxScore, maxScore, percentage: 100 };
  }

  //console.log(`[TimeOfDay] Normalized race time: ${normalizedRaceTime}`);
  const hour = raceTime.getHours();
  const recentRuns = horse.formObj?.form?.slice(0, 6) || [];

  //console.log(`[TimeOfDay] Analyzing ${horse.name} for race at ${hour}:00`);
  //console.log(`[TimeOfDay] Found ${recentRuns.length} recent runs to analyze`);

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

  //console.log("[TimeOfDay] Performance at similar times:", timePerformance);

  // Score based on time performance
  if (timePerformance.similarTimeRuns > 0) {
    // Experience at this time
    score++;
    //console.log("[TimeOfDay] +1 point for having runs at similar times");

    // Success at this time
    const placeRate = timePerformance.places / timePerformance.similarTimeRuns;
    if (placeRate > 0.3) {
      score++;
      //console.log(
      //  "[TimeOfDay] +1 point for good place rate:",
      //  placeRate.toFixed(2)
      //);
    }
  }

  // Bonus for consistent time preference
  if (timePerformance.similarTimeRuns >= 3) {
    score++;
    //console.log("[TimeOfDay] +1 point for consistent time preference");
  }

  //console.log(
  //  `[TimeOfDay] Final score: ${score}/${maxScore} (${(
  //    (score / maxScore) *
  //    100
  //  ).toFixed(1)}%)`
  //);

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
