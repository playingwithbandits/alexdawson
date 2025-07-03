import { ScoreComponent, ScoreParams } from "../types";

export function calculateRacedAgainstScore({
  horse,
  raceStats,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 10;

  const { lastRaceStatsRaceInfo } = raceStats;

  const {
    runners_beaten,
    averages_all,
    maxes_all,
    averages_beaten,
    maxes_beaten,
    info,
  } = horse.lastRaceStats || {};

  if (
    (info?.timePerFurlong || 0) <=
    (lastRaceStatsRaceInfo.avgTimePerFurlong || 0)
  ) {
    console.log("🏁 Raced Against Score - Check time 1" + horse.name, {
      "info?.timePerFurlong": info?.timePerFurlong,
      "lastRaceStatsRaceInfo.avgTimePerFurlong":
        lastRaceStatsRaceInfo.avgTimePerFurlong,
      check:
        (info?.timePerFurlong || 0) <=
        (lastRaceStatsRaceInfo.avgTimePerFurlong || 0),
    });
    score += 3;
  }

  if (
    info?.timePerFurlong &&
    info?.timePerFurlong <= lastRaceStatsRaceInfo.minTimePerFurlong * 1.01
  ) {
    console.log("🏁 Raced Against Score - Check time 2" + horse.name, {
      "info?.timePerFurlong": info?.timePerFurlong,
      "lastRaceStatsRaceInfo.minTimePerFurlong":
        lastRaceStatsRaceInfo.minTimePerFurlong,
      "lastRaceStatsRaceInfo.minTimePerFurlong *1.01":
        lastRaceStatsRaceInfo.minTimePerFurlong * 1.01,
      check:
        info?.timePerFurlong &&
        info?.timePerFurlong <= lastRaceStatsRaceInfo.minTimePerFurlong * 1.01,
    });
    score += 1;
  }

  if ((averages_beaten?.or || 0) >= (lastRaceStatsRaceInfo.beatenAvg.or || 0)) {
    console.log("🏁 Raced Against Score - Check 1" + horse.name, {
      "averages_beaten?.or": averages_beaten?.or,
      "lastRaceStatsRaceInfo.beatenAvg.or": lastRaceStatsRaceInfo.beatenAvg.or,
      check:
        (averages_beaten?.or || 0) >= (lastRaceStatsRaceInfo.beatenAvg.or || 0),
    });
    score += 1;
  }
  if (
    (averages_beaten?.rpr || 0) >= (lastRaceStatsRaceInfo.beatenAvg.rpr || 0)
  ) {
    console.log("🏁 Raced Against Score - Check 2" + horse.name, {
      "averages_beaten?.rpr": averages_beaten?.rpr,
      "lastRaceStatsRaceInfo.beatenAvg.rpr":
        lastRaceStatsRaceInfo.beatenAvg.rpr,
      check:
        (averages_beaten?.rpr || 0) >=
        (lastRaceStatsRaceInfo.beatenAvg.rpr || 0),
    });
    score += 1;
  }
  if ((averages_beaten?.ts || 0) >= (lastRaceStatsRaceInfo.beatenAvg.ts || 0)) {
    console.log("🏁 Raced Against Score - Check 3" + horse.name, {
      "averages_beaten?.ts": averages_beaten?.ts,
      "lastRaceStatsRaceInfo.beatenAvg.ts": lastRaceStatsRaceInfo.beatenAvg.ts,
      check:
        (averages_beaten?.ts || 0) >= (lastRaceStatsRaceInfo.beatenAvg.ts || 0),
    });
    score += 1;
  }
  // if ((maxes_beaten?.or || 0) >= (lastRaceStatsRaceInfo.beatenMax.or || 0)) {
  //   console.log("🏁 Raced Against Score - Check 4" + horse.name, {
  //     "maxes_beaten?.or": maxes_beaten?.or,
  //     "lastRaceStatsRaceInfo.beatenMax.or": lastRaceStatsRaceInfo.beatenMax.or,
  //     check:
  //       (maxes_beaten?.or || 0) >= (lastRaceStatsRaceInfo.beatenMax.or || 0),
  //   });
  //   score += 1;
  // }
  // if ((maxes_beaten?.rpr || 0) >= (lastRaceStatsRaceInfo.beatenMax.rpr || 0)) {
  //   console.log("🏁 Raced Against Score - Check 5" + horse.name, {
  //     "maxes_beaten?.rpr": maxes_beaten?.rpr,
  //     "lastRaceStatsRaceInfo.beatenMax.rpr":
  //       lastRaceStatsRaceInfo.beatenMax.rpr,
  //     check:
  //       (maxes_beaten?.rpr || 0) >= (lastRaceStatsRaceInfo.beatenMax.rpr || 0),
  //   });
  //   score += 1;
  // }
  // if ((maxes_beaten?.ts || 0) >= (lastRaceStatsRaceInfo.beatenMax.ts || 0)) {
  //   console.log("🏁 Raced Against Score - Check 6" + horse.name, {
  //     "maxes_beaten?.ts": maxes_beaten?.ts,
  //     "lastRaceStatsRaceInfo.beatenMax.ts": lastRaceStatsRaceInfo.beatenMax.ts,
  //     check:
  //       (maxes_beaten?.ts || 0) >= (lastRaceStatsRaceInfo.beatenMax.ts || 0),
  //   });
  //   score += 1;
  // }

  if ((averages_all?.or || 0) >= (lastRaceStatsRaceInfo.avg.or || 0)) {
    console.log("🏁 Raced Against Score - Check 7" + horse.name, {
      "averages_all?.or": averages_all?.or,
      "lastRaceStatsRaceInfo.avg.or": lastRaceStatsRaceInfo.avg.or,
      check: (averages_all?.or || 0) >= (lastRaceStatsRaceInfo.avg.or || 0),
    });
    score += 1;
  }
  if ((averages_all?.rpr || 0) >= (lastRaceStatsRaceInfo.avg.rpr || 0)) {
    console.log("🏁 Raced Against Score - Check 8" + horse.name, {
      "averages_all?.rpr": averages_all?.rpr,
      "lastRaceStatsRaceInfo.avg.rpr": lastRaceStatsRaceInfo.avg.rpr,
      check: (averages_all?.rpr || 0) >= (lastRaceStatsRaceInfo.avg.rpr || 0),
    });
    score += 1;
  }
  if ((averages_all?.ts || 0) >= (lastRaceStatsRaceInfo.avg.ts || 0)) {
    console.log("🏁 Raced Against Score - Check 9" + horse.name, {
      "averages_all?.ts": averages_all?.ts,
      "lastRaceStatsRaceInfo.avg.ts": lastRaceStatsRaceInfo.avg.ts,
      check: (averages_all?.ts || 0) >= (lastRaceStatsRaceInfo.avg.ts || 0),
    });
    score += 1;
  }
  // if ((maxes_all?.or || 0) >= (lastRaceStatsRaceInfo.max.or || 0)) {
  //   console.log("🏁 Raced Against Score - Check 10" + horse.name, {
  //     "maxes_all?.or": maxes_all?.or,
  //     "lastRaceStatsRaceInfo.max.or": lastRaceStatsRaceInfo.max.or,
  //     check: (maxes_all?.or || 0) >= (lastRaceStatsRaceInfo.max.or || 0),
  //   });
  //   score += 1;
  // }
  // if ((maxes_all?.rpr || 0) >= (lastRaceStatsRaceInfo.max.rpr || 0)) {
  //   console.log("🏁 Raced Against Score - Check 11" + horse.name, {
  //     "maxes_all?.rpr": maxes_all?.rpr,
  //     "lastRaceStatsRaceInfo.max.rpr": lastRaceStatsRaceInfo.max.rpr,
  //     check: (maxes_all?.rpr || 0) >= (lastRaceStatsRaceInfo.max.rpr || 0),
  //   });
  //   score += 1;
  // }
  // if ((maxes_all?.ts || 0) >= (lastRaceStatsRaceInfo.max.ts || 0)) {
  //   console.log("🏁 Raced Against Score - Check 12" + horse.name, {
  //     "maxes_all?.ts": maxes_all?.ts,
  //     "lastRaceStatsRaceInfo.max.ts": lastRaceStatsRaceInfo.max.ts,
  //     check: (maxes_all?.ts || 0) >= (lastRaceStatsRaceInfo.max.ts || 0),
  //   });
  //   score += 1;
  // }

  console.log(
    "🏁 Raced Against Score" + horse.name,
    {
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
    },
    {
      averages_beaten,
      maxes_beaten,
      averages_all,
      maxes_all,
      lastRaceStatsRaceInfo,
      lastRaceStats: horse.lastRaceStats,
    }
  );

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
