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
  };

  // Ratings Score (vs race average and field)
  const ratingsScore = (() => {
    let score = 0;
    const maxScore = 4;

    // Better than average OR
    if (Number(horse.officialRating) > raceStats.avgOfficialRating) score++;
    // Better than average RPR
    if (Number(horse.rating) > raceStats.avgRating) score++;
    // Within top 25% of field by OR
    if (
      Number(horse.officialRating) >
      raceStats.avgOfficialRating + raceStats.avgOfficialRating * 0.25
    )
      score++;
    // Within top 25% of field by RPR
    if (Number(horse.rating) > raceStats.avgRating + raceStats.avgRating * 0.25)
      score++;

    return {
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
    };
  })();

  // Distance Suitability
  const distanceScore = (() => {
    let score = 0;
    const maxScore = 3;

    // Within 10% of optimal distance
    if (
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

    // Distance within horse's proven range
    if (
      raceStats.distanceInFurlongs >= raceStats.distanceRange.min &&
      raceStats.distanceInFurlongs <= raceStats.distanceRange.max
    )
      score++;

    return {
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
    };
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
    const maxScore = 4;

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

    return {
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
    };
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

  // Calculate total score
  const totalScore =
    ratingsScore.score * weights.ratings +
    distanceScore.score * weights.distance +
    goingScore.score * weights.going +
    formScore.score * weights.form +
    courseScore.score * weights.course +
    classScore.score * weights.class;

  const totalMaxScore =
    ratingsScore.maxScore * weights.ratings +
    distanceScore.maxScore * weights.distance +
    goingScore.maxScore * weights.going +
    formScore.maxScore * weights.form +
    courseScore.maxScore * weights.course +
    classScore.maxScore * weights.class;

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
    },
  };
}
