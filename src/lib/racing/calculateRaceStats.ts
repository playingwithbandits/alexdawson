import { avg, sum } from "@/lib/utils";
import { Race, RaceStats } from "@/types/racing";

function parseDistance(distance: string): number {
  const furlongs = distance.match(/(\d+)f/)?.[1] || "0";
  const miles = distance.match(/(\d+)m/)?.[1] || "0";
  return parseInt(miles) * 8 + parseInt(furlongs);
}

function parseClass(classStr: string): number {
  const match = classStr.match(/\d+/);
  return match ? parseInt(match[1]) : 0;
}

export function calculateRaceStats(race: Partial<Race>): RaceStats {
  const horses = race.horses || [];
  const horseStats = horses.map((h) => h.stats).filter(Boolean);

  // Parse distance and class
  const distanceInFurlongs = parseDistance(race.distance || "");
  const classLevel = parseClass(race.class || "");
  const isHandicap = (race.title || "").toLowerCase().includes("handicap");

  // Calculate distance preferences
  const distanceStats = horseStats.map((s) => ({
    min: s?.minDistance || 0,
    max: s?.maxDistance || 0,
    optimal: s?.optimalDistance || 0,
  }));

  // Aggregate going performance
  const goingStats = {
    soft: sum(
      horseStats.map(
        (s) => s?.goingPerformance?.find((g) => g.type === "soft")?.winRate || 0
      )
    ),
    good: sum(
      horseStats.map(
        (s) => s?.goingPerformance?.find((g) => g.type === "good")?.winRate || 0
      )
    ),
    firm: sum(
      horseStats.map(
        (s) => s?.goingPerformance?.find((g) => g.type === "firm")?.winRate || 0
      )
    ),
    heavy: sum(
      horseStats.map(
        (s) =>
          s?.goingPerformance?.find((g) => g.type === "heavy")?.winRate || 0
      )
    ),
  };

  // Aggregate course configuration stats
  const courseStats = {
    leftHanded: sum(
      horseStats.map(
        (s) =>
          s?.trackConfigPerformance?.find((t) => t.style === "left-handed")
            ?.winRate || 0
      )
    ),
    rightHanded: sum(
      horseStats.map(
        (s) =>
          s?.trackConfigPerformance?.find((t) => t.style === "right-handed")
            ?.winRate || 0
      )
    ),
    straight: sum(
      horseStats.map(
        (s) =>
          s?.trackConfigPerformance?.find((t) => t.style === "straight")
            ?.winRate || 0
      )
    ),
  };

  return {
    avgOfficialRating: avg(horses.map((h) => parseInt(h.officialRating) || 0)),
    avgRating: avg(horses.map((h) => parseInt(h.rating) || 0)),
    avgTopSpeed: avg(horses.map((h) => parseInt(h.topSpeed) || 0)),
    avgAge: avg(horses.map((h) => parseInt(h.age) || 0)),
    avgWeight: avg(horses.map((h) => h.weight.pounds || 0)),
    avgLastRunDays: avg(
      horses.map((h) => parseInt(h.lastRun?.split(" ")[0] || "0"))
    ),
    totalPrizeMoney: parseInt(race.prize?.replace(/[£,]/g, "") || "0"),
    avgPrizeMoney:
      parseInt(race.prize?.replace(/[£,]/g, "") || "0") / (horses.length || 1),
    avgWinRate: avg(horseStats.map((s) => s?.winRate || 0)),
    avgPlaceRate: avg(horseStats.map((s) => s?.placeRate || 0)),
    totalCareerWins: sum(horseStats.map((s) => s?.totalWins || 0)),
    avgEarningsPerRace: avg(horseStats.map((s) => s?.avgEarningsPerRace || 0)),
    avgBestRPR: avg(horseStats.map((s) => s?.bestRPR || 0)),
    avgBestTopSpeed: avg(horseStats.map((s) => s?.bestTopSpeed || 0)),
    avgLastSixPosition: avg(horseStats.map((s) => s?.avgPositionLastSix || 0)),
    formTrends: {
      improving: horseStats.filter((s) => s?.recentFormTrend === "improving")
        .length,
      declining: horseStats.filter((s) => s?.recentFormTrend === "declining")
        .length,
      consistent: horseStats.filter((s) => s?.recentFormTrend === "consistent")
        .length,
    },
    classLevel,
    avgClassLevel: avg(horseStats.map((s) => s?.avgClassLevel || 0)),
    isHandicap,
    distanceInFurlongs,
    avgDistancePreference: avg(distanceStats.map((d) => d.optimal)),
    distanceRange: {
      min: Math.min(...distanceStats.map((d) => d.min)),
      max: Math.max(...distanceStats.map((d) => d.max)),
      avg: avg(distanceStats.map((d) => (d.min + d.max) / 2)),
    },
    goingStats,
    courseStats,
  };
}
