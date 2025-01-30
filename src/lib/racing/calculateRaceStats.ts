import { avg, sum } from "@/lib/utils";
import { Race, RaceStats, Horse } from "@/types/racing";

function parseDistance(distance: string): number {
  const furlongs = distance.match(/(\d+)f/)?.[1] || "0";
  const miles = distance.match(/(\d+)m/)?.[1] || "0";
  return parseInt(miles) * 8 + parseInt(furlongs);
}

function parseClass(classStr: string): number {
  const match = classStr.match(/Class\s*(\d+)/i);
  return match ? parseInt(match[1]) : 0;
}

interface RaceStatsInput {
  raceData: Partial<Race>;
  horses: Horse[];
}

export function calculateRaceStats({
  raceData,
  horses,
}: RaceStatsInput): RaceStats {
  // Get valid horse stats
  const horseStats = horses.map((h) => h.stats).filter(Boolean);

  // Parse basic race info
  const distanceInFurlongs = parseDistance(raceData.distance || "");
  const classLevel = parseClass(raceData.class || "");
  const isHandicap = (raceData.title || "").toLowerCase().includes("handicap");

  // Calculate aggregate stats
  const stats: RaceStats = {
    // Basic averages
    avgOfficialRating: avg(horses.map((h) => parseInt(h.officialRating) || 0)),
    avgRating: avg(horses.map((h) => parseInt(h.rating) || 0)),
    avgTopSpeed: avg(horses.map((h) => parseInt(h.topSpeed) || 0)),
    avgAge: avg(horses.map((h) => parseInt(h.age) || 0)),
    avgWeight: avg(horses.map((h) => h.weight.pounds || 0)),
    avgLastRunDays: avg(
      horses.map((h) => parseInt(h.lastRun?.split(" ")[0] || "0"))
    ),

    // Prize money
    totalPrizeMoney: parseInt(raceData.prize?.replace(/[£,]/g, "") || "0"),
    avgPrizeMoney:
      parseInt(raceData.prize?.replace(/[£,]/g, "") || "0") /
      (horses.length || 1),

    // Form stats
    avgWinRate: avg(horseStats.map((s) => s?.winRate || 0)),
    avgPlaceRate: avg(horseStats.map((s) => s?.placeRate || 0)),
    totalCareerWins: sum(horseStats.map((s) => s?.totalWins || 0)),
    avgEarningsPerRace: avg(horseStats.map((s) => s?.avgEarningsPerRace || 0)),
    avgBestRPR: avg(horseStats.map((s) => s?.bestRPR || 0)),
    avgBestTopSpeed: avg(horseStats.map((s) => s?.bestTopSpeed || 0)),
    avgLastSixPosition: avg(horseStats.map((s) => s?.avgPositionLastSix || 0)),

    // Form trends
    formTrends: {
      improving: horseStats.filter((s) => s?.recentFormTrend === "improving")
        .length,
      declining: horseStats.filter((s) => s?.recentFormTrend === "declining")
        .length,
      consistent: horseStats.filter((s) => s?.recentFormTrend === "consistent")
        .length,
    },

    // Class analysis
    classLevel,
    avgClassLevel: avg(horseStats.map((s) => s?.avgClassLevel || 0)),
    isHandicap,

    // Distance analysis
    distanceInFurlongs,
    avgDistancePreference: avg(horseStats.map((s) => s?.optimalDistance || 0)),
    distanceRange: {
      min: Math.min(...horseStats.map((s) => s?.minDistance || Infinity)),
      max: Math.max(...horseStats.map((s) => s?.maxDistance || 0)),
      avg: avg(horseStats.map((s) => s?.avgDistance || 0)),
    },

    // Going stats
    goingStats: {
      soft: sum(
        horseStats.map(
          (s) =>
            s?.goingPerformance?.find((g) => g.type === "soft")?.winRate || 0
        )
      ),
      good: sum(
        horseStats.map(
          (s) =>
            s?.goingPerformance?.find((g) => g.type === "good")?.winRate || 0
        )
      ),
      firm: sum(
        horseStats.map(
          (s) =>
            s?.goingPerformance?.find((g) => g.type === "firm")?.winRate || 0
        )
      ),
      heavy: sum(
        horseStats.map(
          (s) =>
            s?.goingPerformance?.find((g) => g.type === "heavy")?.winRate || 0
        )
      ),
    },

    // Course configuration stats
    courseStats: {
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
    },
  };

  return stats;
}
