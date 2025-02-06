import { ScoreComponent, ScoreParams } from "./types";

export function calculateRaceTypeScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  // Map race type to stats categories
  const raceType =
    meetingDetails?.type?.toLowerCase() === "jumps"
      ? ["hurdle", "chase"]
      : ["flat", "aw"];

  // Combine stats for relevant categories
  const relevantStats = raceType
    .map(
      (type) =>
        horse.stats?.raceTypeStats?.[
          type as keyof typeof horse.stats.raceTypeStats
        ]
    )
    .filter(Boolean);

  if (relevantStats.length > 0) {
    // Calculate combined stats
    const totalRuns = relevantStats.reduce(
      (sum, stat) => sum + (stat?.runs || 0),
      0
    );
    const totalWins = relevantStats.reduce(
      (sum, stat) => sum + (stat?.wins || 0),
      0
    );
    const avgWinRate = totalRuns > 0 ? (totalWins / totalRuns) * 100 : 0;

    // Score based on combined performance
    if (avgWinRate > 20) score += 3;
    if (avgWinRate > 15) score += 2;
    if (totalRuns >= 5) score += 2;

    // Good place rate
    const totalPlaces = relevantStats.reduce(
      (sum, stat) => sum + (stat?.places || 0),
      0
    );
    const placeRate = totalRuns > 0 ? (totalPlaces / totalRuns) * 100 : 0;
    if (placeRate > 50) score += 3;
  }

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
