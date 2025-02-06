import { GOING_REMAP } from "../goingUtils";
import { mapGoingCodeToType } from "../goingUtils";
import { ScoreComponent, ScoreParams } from "./types";

export function calculateGoingScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  const raceGoingMap = race.going ? GOING_REMAP[race.going?.toLowerCase()] : [];

  const goingStats = horse.stats?.goingPerformance;

  const goingWins = goingStats
    ?.flatMap((x) => (raceGoingMap.includes(x.goingCode) ? x.wins : 0))
    .reduce((a, b) => a + b, 0);

  const goingRuns = goingStats
    ?.flatMap((x) => (raceGoingMap.includes(x.goingCode) ? x.runs : 0))
    .reduce((a, b) => a + b, 0);

  // Get normalized going for comparison
  const raceGoing = mapGoingCodeToType(meetingDetails.going || "");

  const isAW =
    raceGoing.includes("standard") ||
    meetingDetails.type?.toLowerCase().includes("all-weather") ||
    meetingDetails.surface?.toLowerCase().includes("polytrack") ||
    meetingDetails.surface?.toLowerCase().includes("tapeta");

  // Has won on this going
  if (goingWins && goingWins > 0) score++;

  // Multiple wins on this going
  if (goingWins && goingWins > 1) score++;

  // Strong place record on this going
  if (goingRuns && goingRuns >= 3) score++;

  // Recent good run on this going
  const recentGoingForm = horse.formObj?.form
    ?.slice(0, 4)
    .some(
      (f) =>
        parseInt(f.raceOutcomeCode || "99") <= 4 &&
        f.goingTypeCode
          ?.split("/")
          .some((code) => raceGoingMap?.includes(code?.toLowerCase()))
    );
  if (recentGoingForm) score++;

  // AW/Turf specialist check
  if (isAW) {
    const awStats = horse.stats?.raceTypeStats?.aw;
    if (awStats?.runs && awStats.runs > 0) {
      // Strong win record on AW
      if (awStats.winRate > 20) score++;
      if (awStats.winRate > raceStats.avgWinRate * 1.2) score++; // 20% better than avg

      // Strong place record on AW
      if (awStats.placeRate > 50) score++;
      if (awStats.placeRate > raceStats.avgPlaceRate * 1.2) score++;

      // Experience and consistency
      if (awStats.runs >= 5) score++; // Good experience
      if (awStats.runs >= 10 && awStats.winRate > 15) score++; // Proven specialist

      // Recent form in code
      const recentAWForm = horse.formObj?.form
        ?.slice(0, 4)
        .filter((f) => f.raceTypeCode === "W" || f.raceTypeCode === "X")
        .some((f) => parseInt(f.raceOutcomeCode || "99") <= 3);
      if (recentAWForm) score++;
    }
  } else {
    const flatStats = horse.stats?.raceTypeStats?.flat;
    if (flatStats?.runs && flatStats.runs > 0) {
      // Strong win record on turf
      if (flatStats.winRate > 20) score++;
      if (flatStats.winRate > raceStats.avgWinRate * 1.2) score++;

      // Strong place record on turf
      if (flatStats.placeRate > 50) score++;
      if (flatStats.placeRate > raceStats.avgPlaceRate * 1.2) score++;

      // Experience and consistency
      if (flatStats.runs >= 5) score++;
      if (flatStats.runs >= 10 && flatStats.winRate > 15) score++;

      // Recent form in code
      const recentFlatForm = horse.formObj?.form
        ?.slice(0, 4)
        .filter((f) => f.raceTypeCode === "F" || f.raceTypeCode === "B")
        .some((f) => parseInt(f.raceOutcomeCode || "99") <= 3);
      if (recentFlatForm) score++;
    }
  }

  // Check for hurdle/chase specialists if applicable
  const hurdleStats = horse.stats?.raceTypeStats?.hurdle;
  const chaseStats = horse.stats?.raceTypeStats?.chase;

  // For hurdle races
  if (
    meetingDetails.type?.toLowerCase().includes("jumps") &&
    hurdleStats?.runs &&
    hurdleStats.runs > 0
  ) {
    if (hurdleStats.winRate > 20) score++;
    if (hurdleStats.placeRate > 50) score++;
    if (hurdleStats.runs >= 5) score++;

    const recentHurdleForm = horse.formObj?.form
      ?.slice(0, 4)
      .filter((f) => f.raceTypeCode === "H" || f.raceTypeCode === "P")
      .some((f) => parseInt(f.raceOutcomeCode || "99") <= 3);
    if (recentHurdleForm) score++;
  }

  // For chase races
  if (
    meetingDetails.type?.toLowerCase().includes("jumps") &&
    chaseStats?.runs &&
    chaseStats.runs > 0
  ) {
    if (chaseStats.winRate > 20) score++;
    if (chaseStats.placeRate > 50) score++;
    if (chaseStats.runs >= 5) score++;

    const recentChaseForm = horse.formObj?.form
      ?.slice(0, 4)
      .filter((f) => f.raceTypeCode === "C" || f.raceTypeCode === "U")
      .some((f) => parseInt(f.raceOutcomeCode || "99") <= 3);
    if (recentChaseForm) score++;
  }

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
