import { ScoreComponent, ScoreParams } from "./types";

export function calculateTimeOfDayScore({
  horse,
  race,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 3;

  const raceTime = parseInt(race.time.replace(":", ""));
  const recentRuns = horse.formObj?.form?.slice(0, 12) || [];

  // Group performance by time of day
  const timePerformance = recentRuns.reduce((acc, run) => {
    const runTime = parseInt(run.raceDatetime?.replace(":", "") || "0");
    const timeSlot =
      runTime < 1300 ? "morning" : runTime < 1700 ? "afternoon" : "evening";

    if (!acc[timeSlot]) {
      acc[timeSlot] = { runs: 0, wins: 0, places: 0 };
    }

    acc[timeSlot].runs++;
    if (run.raceOutcomeCode === "1") acc[timeSlot].wins++;
    if (parseInt(run.raceOutcomeCode || "99") <= 3) acc[timeSlot].places++;

    return acc;
  }, {} as Record<string, { runs: number; wins: number; places: number }>);

  // Determine current race time slot
  const currentTimeSlot =
    raceTime < 1300 ? "morning" : raceTime < 1700 ? "afternoon" : "evening";
  const slotStats = timePerformance[currentTimeSlot];

  if (slotStats?.runs >= 3) {
    score++;
    // Good win rate at this time
    if (slotStats.wins / slotStats.runs > 0.2) score++;
    // Good place rate at this time
    if (slotStats.places / slotStats.runs > 0.5) score++;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
