import { mapGoingCodeToType } from "../goingUtils";
import { ScoreComponent, ScoreParams } from "./types";

export function calculateWeatherScore({
  horse,
  race,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 3;

  const currentGoing = race.going?.toLowerCase() || "";
  const recentRuns = horse.formObj?.form?.slice(0, 6) || [];

  // Group performance by weather conditions
  const goingPerformance = recentRuns.reduce((acc, run) => {
    const goingCode = run.goingTypeCode?.toLowerCase() || "unknown";

    const going = mapGoingCodeToType(goingCode);
    const isWet = going.includes("soft") || going.includes("heavy");
    const isDry = going.includes("firm") || going.includes("good");
    const condition = isWet ? "wet" : isDry ? "dry" : "standard";

    if (!acc[condition]) {
      acc[condition] = { runs: 0, wins: 0, places: 0 };
    }

    acc[condition].runs++;
    if (run.raceOutcomeCode === "1") acc[condition].wins++;
    if (parseInt(run.raceOutcomeCode || "99") <= 3) acc[condition].places++;

    return acc;
  }, {} as Record<string, { runs: number; wins: number; places: number }>);

  // Determine current conditions
  const isWetTrack =
    currentGoing.includes("soft") || currentGoing.includes("heavy");
  const isDryTrack =
    currentGoing.includes("firm") || currentGoing.includes("good");
  const currentCondition = isWetTrack ? "wet" : isDryTrack ? "dry" : "standard";

  const conditionStats = goingPerformance[currentCondition];

  if (conditionStats?.runs >= 2) {
    score++;
    // Good win rate in these conditions
    if (conditionStats.wins / conditionStats.runs > 0.2) score++;
    // Good place rate in these conditions
    if (conditionStats.places / conditionStats.runs > 0.5) score++;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
