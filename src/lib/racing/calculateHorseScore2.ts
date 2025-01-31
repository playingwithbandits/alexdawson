import { Horse, Meeting, Race, RaceStats } from "@/types/racing";
import { mapGoingCodeToType } from "./goingUtils";

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
    seasonal: ScoreComponent;
    connectionCombo: ScoreComponent;
    market: ScoreComponent;
  };
}

export function calculateHorseScore2(
  horse: Horse,
  race: Race,
  raceStats: RaceStats,
  meetingDetails: Partial<Meeting>
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
    draw: 1, // Draw bias and stall positionq
    seasonal: 1, // Seasonal form
    connectionCombo: 1, // Jockey and trainer combo
    market: 1, // Market position
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

  // Going Score
  const goingScore = (() => {
    let score = 0;
    const maxScore = 6;

    // Get normalized going for comparison
    const raceGoing = mapGoingCodeToType(meetingDetails.going || "");
    const isAW =
      raceGoing.includes("standard") ||
      meetingDetails.type?.toLowerCase().includes("all-weather") ||
      meetingDetails.surface?.toLowerCase().includes("polytrack") ||
      meetingDetails.surface?.toLowerCase().includes("tapeta");

    // Has won on this going
    const goingWins = horse.formObj?.form?.filter(
      (f) =>
        f.raceOutcomeCode === "1" &&
        f.goingTypeCode
          ?.split("/")
          .some((code) => mapGoingCodeToType(code).includes(raceGoing))
    ).length;
    if (goingWins && goingWins > 0) score++;

    // Multiple wins on this going
    if (goingWins && goingWins > 1) score++;

    // Strong place record on this going
    const goingPlaces = horse.formObj?.form?.filter(
      (f) =>
        parseInt(f.raceOutcomeCode || "99") <= 3 &&
        f.goingTypeCode
          ?.split("/")
          .some((code) => mapGoingCodeToType(code).includes(raceGoing))
    ).length;
    if (goingPlaces && goingPlaces >= 3) score++;

    // Recent good run on this going
    const recentGoingForm = horse.formObj?.form
      ?.slice(0, 4)
      .some(
        (f) =>
          parseInt(f.raceOutcomeCode || "99") <= 4 &&
          f.goingTypeCode
            ?.split("/")
            .some((code) => mapGoingCodeToType(code).includes(raceGoing))
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
    const recentWins = horse.formObj?.form
      ?.slice(0, 6)
      .filter((f) => f.raceOutcomeCode === "1").length;
    if (recentWins && recentWins > 1) score++;

    // Consistent placements
    const recentPlacements = horse.formObj?.form
      ?.slice(0, 6)
      .filter((f) => parseInt(f.raceOutcomeCode || "99") <= 3).length;
    if (recentPlacements && recentPlacements >= 3) score++;

    // Progressive form
    const rprs = horse.formObj?.form
      ?.slice(0, 4)
      .map((f) => f.rpPostmark)
      .filter((r): r is number => r !== undefined);
    if (
      rprs &&
      rprs?.length >= 3 &&
      rprs?.every((rpr, i) => i === 0 || rpr >= (rprs[i - 1] || 0))
    )
      score++;

    // Recent class win
    const recentClassWin = horse.formObj?.form
      ?.slice(0, 4)
      .some(
        (f) =>
          f.raceOutcomeCode === "1" &&
          f.raceClass &&
          f.raceClass <= parseInt(race.class.replace(/\D/g, ""))
      );
    if (recentClassWin) score++;

    // Recent course win
    const recentCourseWin = horse.formObj?.form
      ?.slice(0, 6)
      .some(
        (f) =>
          f.raceOutcomeCode === "1" &&
          f.courseName?.toLowerCase() === meetingDetails.venue?.toLowerCase()
      );
    if (recentCourseWin) score++;

    // Recent distance win
    const recentDistanceWin = horse.formObj?.form
      ?.slice(0, 6)
      .some(
        (f) =>
          f.raceOutcomeCode === "1" &&
          Math.abs(
            f.distanceFurlong || 0 - (raceStats.distanceInFurlongs || 0)
          ) <= 1
      );
    if (recentDistanceWin) score++;

    return {
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
    };
  })();

  // Course Form
  const courseScore = (() => {
    let score = 0;
    const maxScore = 5;

    // Course winner
    if ((horse.stats?.courseForm?.wins || 0) > 0) score++;

    // Multiple course wins
    if ((horse.stats?.courseForm?.wins || 0) > 1) score++;

    // Strong course place rate
    if ((horse.stats?.courseForm?.placeRate || 0) > 50) score++;

    // Course experience
    if ((horse.stats?.courseForm?.runs || 0) > 3) score++;

    // Recent course form
    const recentCourseForm = horse.formObj?.form
      ?.slice(0, 4)
      .some(
        (f) =>
          f.courseName?.toLowerCase() === meetingDetails.venue?.toLowerCase() &&
          parseInt(f.raceOutcomeCode || "99") <= 4
      );
    if (recentCourseForm) score++;

    return {
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
    };
  })();

  // Class Level
  const classScore = (() => {
    let score = 0;
    const maxScore = 5;

    // Class winner
    const hasWonInClass =
      horse.formObj?.form?.some(
        (f) =>
          f.raceOutcomeCode === "1" &&
          f.raceClass &&
          f.raceClass <= parseInt(race.class.replace(/\D/g, ""))
      ) || false;
    if (hasWonInClass) score++;

    // Class experience
    const hasClassExperience =
      horse.formObj?.form?.some(
        (f) =>
          f.raceClass && f.raceClass <= parseInt(race.class.replace(/\D/g, ""))
      ) || false;
    if (hasClassExperience) score++;

    // Progressive in class
    const classProgression = horse.stats?.classProgression || [];
    if (
      classProgression.length >= 3 &&
      classProgression.every((c, i) => i === 0 || c <= classProgression[i - 1])
    )
      score++;

    // Proven at higher class
    if (
      horse.formObj?.form?.some(
        (f) =>
          f.raceOutcomeCode === "1" &&
          f.raceClass &&
          f.raceClass < parseInt(race.class.replace(/\D/g, ""))
      )
    )
      score++;

    // Consistent at this level
    const classPerformance = horse.formObj?.form
      ?.filter(
        (f) =>
          f.raceClass && f.raceClass === parseInt(race.class.replace(/\D/g, ""))
      )
      .filter((f) => parseInt(f.raceOutcomeCode || "99") <= 4).length;
    if (classPerformance && classPerformance >= 3) score++;

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

  // Seasonal Form
  const seasonalScore = (() => {
    let score = 0;
    const maxScore = 5;

    const currentMonth = new Date().getMonth();
    const isSpring = currentMonth >= 2 && currentMonth <= 4;
    const isSummer = currentMonth >= 5 && currentMonth <= 7;
    const isAutumn = currentMonth >= 8 && currentMonth <= 10;
    const isWinter = currentMonth >= 11 || currentMonth <= 1;

    // Strong record in current season
    if ((isSpring && horse.stats?.seasonalForm?.spring) || 0 > 3) score++;
    if ((isSummer && horse.stats?.seasonalForm?.summer) || 0 > 3) score++;
    if ((isAutumn && horse.stats?.seasonalForm?.autumn) || 0 > 3) score++;
    if ((isWinter && horse.stats?.seasonalForm?.winter) || 0 > 3) score++;

    // Recent runs in similar conditions
    const lastSixRuns = horse.formObj?.form?.slice(0, 6) || [];
    const similarConditionsRuns = lastSixRuns.filter((run) => {
      const similarClass =
        Math.abs(
          (run.raceClass || 0) - parseInt(race.class.replace(/\D/g, ""))
        ) <= 1;
      const similarDistance =
        Math.abs(
          (run.distanceFurlong || 0) - (raceStats.distanceInFurlongs || 0)
        ) <= 1;
      return similarClass && similarDistance;
    }).length;

    if (similarConditionsRuns >= 2) score++;
    if (similarConditionsRuns >= 4) score++;

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Trainer/Jockey Combination
  const connectionComboScore = (() => {
    let score = 0;
    const maxScore = 5;

    // Find previous runs with same jockey combo
    const comboRuns = horse.formObj?.form?.filter(
      (run) =>
        run.jockeyShortName?.toLowerCase() === horse.jockey.name.toLowerCase()
    );

    if (comboRuns?.length) {
      // Successful partnership
      const comboWins = comboRuns.filter(
        (r) => r.raceOutcomeCode === "1"
      ).length;
      const comboPlaces = comboRuns.filter(
        (r) => parseInt(r.raceOutcomeCode || "99") <= 3
      ).length;

      if (comboWins > 0) score++;
      if (comboWins > 1) score++;
      if (comboPlaces / comboRuns.length > 0.5) score++;

      // Recent success with combo
      const recentComboSuccess = comboRuns
        .slice(0, 3)
        .some((r) => parseInt(r.raceOutcomeCode || "99") <= 3);
      if (recentComboSuccess) score++;
    }

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Market Support History
  const marketScore = (() => {
    let score = 0;
    const maxScore = 5;

    const lastSixRuns = horse.formObj?.form?.slice(0, 6) || [];

    // Well backed when winning
    const wellBackedWins = lastSixRuns.filter(
      (run) =>
        run.raceOutcomeCode === "1" &&
        run.oddsDesc &&
        parseFloat(run.oddsDesc) < 6.0
    ).length;

    if (wellBackedWins > 0) score++;
    if (wellBackedWins > 1) score++;

    // Performs well when fancied
    const fanciedRuns = lastSixRuns.filter(
      (run) => run.oddsDesc && parseFloat(run.oddsDesc) < 4.0
    );

    if (fanciedRuns.length) {
      const goodRuns = fanciedRuns.filter(
        (r) => parseInt(r.raceOutcomeCode || "99") <= 3
      ).length;

      if (goodRuns / fanciedRuns.length > 0.5) score++;
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
    drawScore.score * weights.draw +
    seasonalScore.score * weights.seasonal +
    connectionComboScore.score * weights.connectionCombo +
    marketScore.score * weights.market;

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
    drawScore.maxScore * weights.draw +
    seasonalScore.maxScore * weights.seasonal +
    connectionComboScore.maxScore * weights.connectionCombo +
    marketScore.maxScore * weights.market;

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
      seasonal: seasonalScore,
      connectionCombo: connectionComboScore,
      market: marketScore,
    },
  };
}
