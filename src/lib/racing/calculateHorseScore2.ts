import { Horse, Race, RaceStats } from "@/types/racing";

interface ScoreComponent {
  score: number;
  maxScore: number;
  percentage: number;
}

export interface HorseScore {
  total: ScoreComponent;
  components: {
    ratings: ScoreComponent;
    distance: ScoreComponent;
    going: ScoreComponent;
    form: ScoreComponent;
    course: ScoreComponent;
    class: ScoreComponent;
    connections: ScoreComponent;
    prize: ScoreComponent;
    weight: ScoreComponent;
    draw: ScoreComponent;
  };
}

export function calculateHorseScore2(
  horse: Horse,
  race: Race,
  raceStats: RaceStats
): HorseScore {
  const weights = {
    ratings: 1, // Compare ratings to race average and other horses
    distance: 1, // How well distance matches horse's optimal
    going: 1, // Performance on this going
    form: 1, // Recent form and trends
    course: 1, // Course form and configuration
    class: 1, // Class level suitability
    connections: 1, // Jockey and trainer performance
    prize: 1, // Prize money performance
    weight: 1, // Weight carried and allowances
    draw: 1, // Draw bias and stall position
  };

  // Ratings Score (vs race average and field)
  const ratingsScore = (() => {
    let score = 0;
    const maxScore = 8;

    // Better than average OR
    if (Number(horse.officialRating) > raceStats.avgOfficialRating) score++;
    // Significantly better OR (>10% above average)
    if (Number(horse.officialRating) > raceStats.avgOfficialRating * 1.1)
      score++;
    // Better than average RPR
    if (Number(horse.rating) > raceStats.avgRating) score++;
    // Significantly better RPR (>10% above average)
    if (Number(horse.rating) > raceStats.avgRating * 1.1) score++;

    // Within top 25% of field by OR
    if (
      Number(horse.officialRating) >
      raceStats.avgOfficialRating + raceStats.avgOfficialRating * 0.25
    )
      score++;
    // Within top 25% of field by RPR
    if (Number(horse.rating) > raceStats.avgRating + raceStats.avgRating * 0.25)
      score++;

    // Top Speed comparison
    if (Number(horse.topSpeed) > raceStats.avgTopSpeed) score++;
    // Significantly better Top Speed (>10% above average)
    if (Number(horse.topSpeed) > raceStats.avgTopSpeed * 1.1) score++;

    return {
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
    };
  })();

  // Distance Suitability
  const distanceScore = (() => {
    let score = 0;
    const maxScore = 5;

    // Perfect distance match
    if (
      Math.abs(
        (horse.stats?.optimalDistance || 0) -
          (raceStats.distanceInFurlongs || 0)
      ) < 1
    )
      score += 2;
    // Close distance match
    else if (
      Math.abs(
        (horse.stats?.optimalDistance || 0) -
          (raceStats.distanceInFurlongs || 0)
      ) /
        raceStats.distanceInFurlongs <
      0.1
    )
      score++;

    // Has won at this distance range
    if (
      horse.stats?.distanceStats?.[
        `${Math.floor(raceStats.distanceInFurlongs || 0)}-${Math.ceil(
          raceStats.distanceInFurlongs || 0
        )}f`
      ]?.winRate ||
      0 > 0
    )
      score++;

    // Strong win rate at this distance
    if (
      (horse.stats?.distanceStats?.[
        `${Math.floor(raceStats.distanceInFurlongs || 0)}-${Math.ceil(
          raceStats.distanceInFurlongs || 0
        )}f`
      ]?.winRate || 0) > 25
    )
      score++;

    // Distance within horse's proven range
    if (
      raceStats.distanceInFurlongs >= raceStats.distanceRange.min &&
      raceStats.distanceInFurlongs <= raceStats.distanceRange.max
    )
      score++;

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Going Suitability
  const goingScore = (() => {
    let score = 0;
    const maxScore = 3;

    // Has won on this going
    const goingPerf = horse.stats?.goingPerformance?.find(
      (g) => g.type === race.going?.toLowerCase()
    );
    if (goingPerf?.winRate || 0 > 0) score++;

    // Above average win rate on this going
    if (goingPerf?.winRate || 0 > 20) score++;

    // Multiple runs on this going (experience)
    if (goingPerf?.runs || 0 > 3) score++;

    return {
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
    };
  })();

  // Recent Form
  const formScore = (() => {
    let score = 0;
    const maxScore = 8;

    // Last time out winner
    if (horse.formObj?.form?.[0]?.raceOutcomeCode === "1") score++;

    // Placed last time out
    if (parseInt(horse.formObj?.form?.[0]?.raceOutcomeCode || "99") <= 3)
      score++;

    // Multiple recent wins
    const recentWins =
      horse.formObj?.form?.slice(0, 4).filter((f) => f.raceOutcomeCode === "1")
        .length || 0;
    if (recentWins >= 2) score++;

    // Progressive RPRs
    const rprTrend = horse.formObj?.form
      ?.slice(0, 3)
      .map((f) => f.rpPostmark || 0);
    if (rprTrend && rprTrend[0] > rprTrend[1] && rprTrend[1] > rprTrend[2])
      score++;

    // Improving form trend
    if (horse.stats?.recentFormTrend === "improving") score++;

    // Better than average last 6 runs position
    if ((horse.stats?.avgPositionLastSix || 99) < raceStats.avgLastSixPosition)
      score++;

    // Recent run (freshness)
    const daysSinceRun = parseInt(horse.lastRun?.split(" ")[0] || "999");
    if (daysSinceRun < 30) score++;

    // In form this season
    type SeasonalForm = {
      spring: number;
      summer: number;
      autumn: number;
      winter: number;
    };
    const season = ["winter", "spring", "summer", "autumn"][
      Math.floor(new Date().getMonth() / 3)
    ] as keyof SeasonalForm;
    if ((horse.stats?.seasonalForm?.[season] || 0) > 0.5) score++;

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Course Form
  const courseScore = (() => {
    let score = 0;
    const maxScore = 3;

    // Course winner
    if ((horse.stats?.courseForm?.wins || 0) > 0) score++;

    // Above average course win rate
    if ((horse.stats?.courseForm?.winRate || 0) > raceStats.avgWinRate) score++;

    // Multiple course runs (experience)
    if ((horse.stats?.courseForm?.runs || 0) > 2) score++;

    return {
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
    };
  })();

  // Class Level
  const classScore = (() => {
    let score = 0;
    const maxScore = 3;

    // Has won at this class or higher
    if (
      horse.stats?.preferredClass &&
      Number(horse.stats.preferredClass.replace("Class ", "")) <=
        Number(race.class.replace("Class ", ""))
    )
      score++;

    // Average class level suitable
    if (
      (horse.stats?.avgClassLevel || 99) <=
      Number(race.class.replace("Class ", ""))
    )
      score++;

    // Class progression positive
    if ((horse.stats?.classProgression?.[0] || 0) > 0) score++;

    return {
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
    };
  })();

  // Connections Score (Jockey & Trainer form)
  const connectionsScore = (() => {
    let score = 0;
    const maxScore = 6;

    const jockeyStats = race.raceExtraInfo?.jockeyStats?.find(
      (j) =>
        j.jockey.toLowerCase().trim() === horse.jockey.name.toLowerCase().trim()
    );
    const trainerStats = race.raceExtraInfo?.trainerStats?.find(
      (t) =>
        t.trainer.toLowerCase().trim() ===
        horse.trainer.name.toLowerCase().trim()
    );

    // Jockey in form (14 day strike rate > 15%)
    if ((jockeyStats?.last14Days?.winRate || 0) > 15) score++;

    // Jockey profitable to follow
    if ((jockeyStats?.last14Days?.profit || 0) > 0) score++;

    // Jockey above average strike rate
    const avgJockeyRate =
      race.raceExtraInfo?.jockeyStats
        ?.map((x) => x.last14Days.winRate)
        ?.reduce((sum, t) => sum + (t || 0), 0) ||
      0 / (race.raceExtraInfo?.jockeyStats?.length || 1);
    if ((jockeyStats?.last14Days?.winRate || 0) > avgJockeyRate) score++;

    // Trainer in form (14 day strike rate > 15%)
    if ((trainerStats?.last14Days?.winRate || 0) > 15) score++;

    // Trainer profitable to follow
    if ((trainerStats?.last14Days?.profit || 0) > 0) score++;

    // Trainer above average strike rate
    const avgTrainerRate =
      race.raceExtraInfo?.trainerStats
        ?.map((x) => x.last14Days.winRate)
        ?.reduce((sum, t) => sum + (t || 0), 0) ||
      0 / (race.raceExtraInfo?.trainerStats?.length || 1);
    if ((trainerStats?.last14Days?.winRate || 0) > avgTrainerRate) score++;

    return {
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
    };
  })();

  // Prize Money Performance
  const prizeScore = (() => {
    let score = 0;
    const maxScore = 4;

    // Above average earnings per race
    if ((horse.stats?.avgEarningsPerRace || 0) > raceStats.avgEarningsPerRace)
      score++;

    // Has won more valuable races
    const racePrize = parseInt(race.prize?.replace(/[£,]/g, "") || "0");
    if ((horse.stats?.highestPrize || 0) > racePrize) score++;

    // Consistent prize money earner
    if ((horse.stats?.totalEarnings || 0) > raceStats.totalPrizeMoney) score++;

    // Above average prize money performance
    if ((horse.stats?.avgPrize || 0) > raceStats.avgPrizeMoney) score++;

    return {
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
    };
  })();

  // Weight Analysis
  const weightScore = (() => {
    let score = 0;
    const maxScore = 4;

    // Well weighted compared to field average
    if (horse.weight.pounds < raceStats.avgWeight) score++;

    // Weight allowance advantage
    if (horse.jockey.allowance) score++;

    // Progressive with this weight
    if (
      horse.stats?.weightProgression
        ?.slice(0, 3)
        .every((w, i, arr) => i === 0 || w >= arr[i - 1])
    )
      score++;

    // Proven at this weight
    const weightRange = 5; // 5lb tolerance
    const hasWonAtWeight = horse.formObj?.form?.some(
      (f) =>
        f.raceOutcomeCode === "1" &&
        Math.abs(f.weightCarriedLbs || 0 - horse.weight.pounds) <= weightRange
    );
    if (hasWonAtWeight) score++;

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Draw Analysis
  const drawScore = (() => {
    let score = 0;
    const maxScore = 3;

    if (horse.draw && race.drawBias) {
      // Favorable draw based on track bias
      const drawNum = parseInt(horse.draw);
      const isLowDraw = drawNum <= race.runners / 3;
      const isMiddleDraw =
        drawNum > race.runners / 3 && drawNum <= (2 * race.runners) / 3;
      const isHighDraw = drawNum > (2 * race.runners) / 3;

      if (
        (race.drawBias === "Low" && isLowDraw) ||
        (race.drawBias === "Middle" && isMiddleDraw) ||
        (race.drawBias === "High" && isHighDraw) ||
        race.drawBias === "No Clear Bias"
      ) {
        score += 2;
      }
      // Experience from similar draw
      const hasWonFromSimilarDraw = horse.formObj?.form?.some(
        (f) =>
          f.raceOutcomeCode === "1" &&
          f.draw &&
          Math.abs(f.draw - parseInt(horse.draw || "0")) <= 2
      );
      if (hasWonFromSimilarDraw) score++;
    }

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Calculate total score
  const totalScore =
    ratingsScore.score * weights.ratings +
    distanceScore.score * weights.distance +
    goingScore.score * weights.going +
    formScore.score * weights.form +
    courseScore.score * weights.course +
    classScore.score * weights.class +
    connectionsScore.score * weights.connections +
    prizeScore.score * weights.prize +
    weightScore.score * weights.weight +
    drawScore.score * weights.draw;

  const totalMaxScore =
    ratingsScore.maxScore * weights.ratings +
    distanceScore.maxScore * weights.distance +
    goingScore.maxScore * weights.going +
    formScore.maxScore * weights.form +
    courseScore.maxScore * weights.course +
    classScore.maxScore * weights.class +
    connectionsScore.maxScore * weights.connections +
    prizeScore.maxScore * weights.prize +
    weightScore.maxScore * weights.weight +
    drawScore.maxScore * weights.draw;

  return {
    total: {
      score: totalScore,
      maxScore: totalMaxScore,
      percentage: (totalScore / totalMaxScore) * 100,
    },
    components: {
      ratings: ratingsScore,
      distance: distanceScore,
      going: goingScore,
      form: formScore,
      course: courseScore,
      class: classScore,
      connections: connectionsScore,
      prize: prizeScore,
      weight: weightScore,
      draw: drawScore,
    },
  };
}
