import { avg, max, min, sum } from "@/lib/utils";
import {
  Race,
  RaceStats,
  Horse,
  LastRaceStatsRaceInfo,
  AllValidFormsAllHorsesRaceStatsRaceInfoType,
} from "@/types/racing";
import { LastRaceStats } from "./scores/types";

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
  const distanceInFurlongs = raceData.distance || 0;
  const classLevel = raceData.class || 0;
  const isHandicap = (raceData.title || "").toLowerCase().includes("handicap");

  const lastRaceStatsArr: LastRaceStats[] = horses
    .map((h) => h.lastRaceStats)
    .filter((x) => x !== undefined);

  // console.log(
  //   "🏁 Last Race Stats Arr timePerFurlong",
  //   lastRaceStatsArr.map((l) => l.info?.timePerFurlong)
  // );

  const lastRaceStatsRaceInfo: LastRaceStatsRaceInfo = {
    avgTimePerFurlong:
      avg(
        lastRaceStatsArr.map((l) => l.info?.timePerFurlong)?.filter(Boolean)
      ) || 0,
    minTimePerFurlong:
      min(
        lastRaceStatsArr.map((l) => l.info?.timePerFurlong)?.filter(Boolean)
      ) || 0,
    maxTimePerFurlong:
      max(
        lastRaceStatsArr.map((l) => l.info?.timePerFurlong)?.filter(Boolean)
      ) || 0,

    avg: {
      or:
        avg(lastRaceStatsArr.map((l) => l.averages_all.or)?.filter(Boolean)) ||
        0,
      rpr:
        avg(lastRaceStatsArr.map((l) => l.averages_all.rpr)?.filter(Boolean)) ||
        0,
      ts:
        avg(lastRaceStatsArr.map((l) => l.averages_all.ts)?.filter(Boolean)) ||
        0,
      draw:
        avg(
          lastRaceStatsArr.map((l) => l.averages_all.draw)?.filter(Boolean)
        ) || 0,
      age:
        avg(lastRaceStatsArr.map((l) => l.averages_all.age)?.filter(Boolean)) ||
        0,
    },
    maxOfAvgs: {
      or:
        max(lastRaceStatsArr.map((l) => l.averages_all.or)?.filter(Boolean)) ||
        0,
      rpr:
        max(lastRaceStatsArr.map((l) => l.averages_all.rpr)?.filter(Boolean)) ||
        0,
      ts:
        max(lastRaceStatsArr.map((l) => l.averages_all.ts)?.filter(Boolean)) ||
        0,
      draw:
        max(
          lastRaceStatsArr.map((l) => l.averages_all.draw)?.filter(Boolean)
        ) || 0,
      age:
        max(lastRaceStatsArr.map((l) => l.averages_all.age)?.filter(Boolean)) ||
        0,
    },

    max: {
      or:
        max(lastRaceStatsArr.map((l) => l.maxes_all.or)?.filter(Boolean)) || 0,
      rpr:
        max(lastRaceStatsArr.map((l) => l.maxes_all.rpr)?.filter(Boolean)) || 0,
      ts:
        max(lastRaceStatsArr.map((l) => l.maxes_all.ts)?.filter(Boolean)) || 0,
      draw:
        max(lastRaceStatsArr.map((l) => l.maxes_all.draw)?.filter(Boolean)) ||
        0,
      age:
        max(lastRaceStatsArr.map((l) => l.maxes_all.age)?.filter(Boolean)) || 0,
    },
    beatenAvg: {
      or:
        avg(
          lastRaceStatsArr.map((l) => l.averages_beaten.or)?.filter(Boolean)
        ) || 0,
      rpr:
        avg(
          lastRaceStatsArr.map((l) => l.averages_beaten.rpr)?.filter(Boolean)
        ) || 0,
      ts:
        avg(
          lastRaceStatsArr.map((l) => l.averages_beaten.ts)?.filter(Boolean)
        ) || 0,
      draw:
        avg(
          lastRaceStatsArr.map((l) => l.averages_beaten.draw)?.filter(Boolean)
        ) || 0,
      age:
        avg(
          lastRaceStatsArr.map((l) => l.averages_beaten.age)?.filter(Boolean)
        ) || 0,
    },

    beatenMaxOfAvgs: {
      or:
        max(
          lastRaceStatsArr.map((l) => l.averages_beaten.or)?.filter(Boolean)
        ) || 0,
      rpr:
        max(
          lastRaceStatsArr.map((l) => l.averages_beaten.rpr)?.filter(Boolean)
        ) || 0,
      ts:
        max(
          lastRaceStatsArr.map((l) => l.averages_beaten.ts)?.filter(Boolean)
        ) || 0,
      draw:
        max(
          lastRaceStatsArr.map((l) => l.averages_beaten.draw)?.filter(Boolean)
        ) || 0,
      age:
        max(
          lastRaceStatsArr.map((l) => l.averages_beaten.age)?.filter(Boolean)
        ) || 0,
    },
    beatenMax: {
      or:
        max(lastRaceStatsArr.map((l) => l.maxes_beaten.or)?.filter(Boolean)) ||
        0,
      rpr:
        max(lastRaceStatsArr.map((l) => l.maxes_beaten.rpr)?.filter(Boolean)) ||
        0,
      ts:
        max(lastRaceStatsArr.map((l) => l.maxes_beaten.ts)?.filter(Boolean)) ||
        0,
      draw:
        max(
          lastRaceStatsArr.map((l) => l.maxes_beaten.draw)?.filter(Boolean)
        ) || 0,
      age:
        max(lastRaceStatsArr.map((l) => l.maxes_beaten.age)?.filter(Boolean)) ||
        0,
    },
  };

  const allValidFormsAllHorsesRaceStatsRaceInfo: AllValidFormsAllHorsesRaceStatsRaceInfoType =
    {
      maxBeatenAvgsRpr:
        max(
          horses
            .map((h) => h.allValidFormRowsStatsDataStats?.maxBeatenAvgsRpr || 0)
            ?.filter(Boolean)
        ) || 0,
      maxBeatenMaxesRpr:
        max(
          horses
            .map(
              (h) => h.allValidFormRowsStatsDataStats?.maxBeatenMaxesRpr || 0
            )
            ?.filter(Boolean)
        ) || 0,
      minTimePerFurlong:
        min(
          horses
            .map(
              (h) => h.allValidFormRowsStatsDataStats?.minTimePerFurlong || 0
            )
            ?.filter(Boolean)
        ) || 0,
    };

  // Calculate aggregate stats
  const stats: RaceStats = {
    lastRaceStatsRaceInfo,
    allValidFormsAllHorsesRaceStatsRaceInfo,
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
      min: min(horseStats.map((s) => s?.minDistance || 0)),
      max: max(horseStats.map((s) => s?.maxDistance || 0)),
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
