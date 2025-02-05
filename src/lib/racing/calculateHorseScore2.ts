import { Horse, HorseStats, Meeting, Race, RaceStats } from "@/types/racing";
import { mapGoingCodeToType } from "./goingUtils";
import { avg } from "../utils";
import { distanceToWinnerStrToFloat } from "./calculateHorseStats";

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
    margins: ScoreComponent;
    formProgression: ScoreComponent;
    classMovement: ScoreComponent;
    trackConfig: ScoreComponent;
    raceType: ScoreComponent;
    surfaceAdaptability: ScoreComponent;
    officialRating: ScoreComponent;
    consistency: ScoreComponent;
    layoff: ScoreComponent;
    weightTrend: ScoreComponent;
    prizeProgression: ScoreComponent;
    courseDistance: ScoreComponent;
  };
}

export function calculateHorseScore2(
  horse: Horse,
  race: Race,
  raceStats: RaceStats,
  meetingDetails: Partial<Meeting>
): HorseScore {
  const weights = {
    // Most important factors (0.06-0.07)
    ratings: 0.07,
    formProgression: 0.07,
    officialRating: 0.07,

    // Very important factors (0.05-0.06)
    distance: 0.06,
    going: 0.06,
    form: 0.06,
    classMovement: 0.06,
    surfaceAdaptability: 0.06,

    // Important factors (0.04-0.05)
    course: 0.05,
    class: 0.05,
    trackConfig: 0.05,
    raceType: 0.05,
    consistency: 0.05,
    courseDistance: 0.05,

    // Secondary factors (0.03-0.04)
    connections: 0.04,
    weight: 0.04,
    layoff: 0.04,
    weightTrend: 0.04,

    // Minor factors (0.02-0.03)
    prize: 0.02,
    draw: 0.02,
    seasonal: 0.02,
    connectionCombo: 0.02,
    market: 0.02,
    margins: 0.02,
    prizeProgression: 0.02,
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

  // Distance Analysis
  const distanceScore = (() => {
    let score = 0;
    const maxScore = 10;

    // Get distance stats for this range
    const rangeStats = horse.stats?.distanceStats?.performanceByType;

    // Score based on performance in distance category
    if (rangeStats) {
      const category =
        raceStats.distanceInFurlongs <= 7
          ? rangeStats.sprint
          : raceStats.distanceInFurlongs <= 9
          ? rangeStats.mile
          : raceStats.distanceInFurlongs <= 12
          ? rangeStats.middle
          : rangeStats.staying;

      if (category.winRate > 20) score += 2;
      if (category.runs >= 5) score += 1;
    }

    // Has won at this distance range
    const distanceWins =
      horse.formObj?.form?.filter(
        (r) =>
          r.raceOutcomeCode === "1" &&
          Math.abs((r.distanceFurlong || 0) - raceStats.distanceInFurlongs) <= 1
      ).length || 0;
    if (distanceWins > 0) score += 3;
    if (distanceWins > 1) score += 2;

    // Strong win rate at this distance
    const distanceRuns =
      horse.formObj?.form?.filter(
        (r) =>
          Math.abs((r.distanceFurlong || 0) - raceStats.distanceInFurlongs) <= 1
      ) || [];
    if (distanceRuns?.length >= 3) {
      const winRate = (distanceWins / distanceRuns.length) * 100;
      if (winRate > 25) score += 2;
      if (winRate > 40) score += 2;
    }

    // Distance within horse's proven range
    const minDistance = horse.stats?.minDistance || 0;
    const maxDistance = horse.stats?.maxDistance || 0;
    if (
      raceStats.distanceInFurlongs >= minDistance &&
      raceStats.distanceInFurlongs <= maxDistance
    ) {
      score += 1;
      // Comfortably within range (not at extremes)
      if (
        raceStats.distanceInFurlongs >= minDistance + 1 &&
        raceStats.distanceInFurlongs <= maxDistance - 1
      ) {
        score += 2;
      }
    }

    // Good margins at this distance
    const distanceMargins = horse.formObj?.form
      ?.filter(
        (r) =>
          Math.abs((r.distanceFurlong || 0) - raceStats.distanceInFurlongs) <= 1
      )
      .map((r) => {
        if (r.raceOutcomeCode === "1") {
          return distanceToWinnerStrToFloat(r.winningDistance || "");
        }
        return -distanceToWinnerStrToFloat(r.distanceToWinner || "");
      });

    if (distanceMargins?.length && distanceMargins.length >= 3) {
      const avgMargin = avg(distanceMargins);
      if (avgMargin > 0) score += 2; // Net positive margins
      if (avgMargin > 1) score += 2; // Strong positive margins
    }

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
  const drawScore = calculateDrawScore(horse.stats?.drawPerformance);

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

  // Calculate margins score
  const marginsScore = calculateMarginsScore(horse.stats?.margins);

  // Form Progression Score
  const formProgressionScore = (() => {
    let score = 0;
    const maxScore = 10;

    const progression = horse.stats?.formProgression;
    if (progression) {
      // Improving form trend
      if (progression.positionTrend === "improving") score += 4;
      if (progression.positionTrend === "steady") score += 2;

      // Good average position
      if (progression.averagePosition <= 3) score += 3;
      else if (progression.averagePosition <= 4) score += 2;

      // Recent good positions
      const goodPositions = progression.lastSixPositions.filter(
        (p) => p <= 3
      ).length;
      if (goodPositions >= 3) score += 3;
    }

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Class Movement Score
  const classMovementScore = (() => {
    let score = 0;
    const maxScore = 10;

    const classStats = horse.stats?.classStats;
    if (classStats) {
      // Proven at this level or higher
      if (classStats.highestClass <= parseInt(race.class)) score += 3;

      // Progressive through classes
      const isProgressive = classStats.classProgression.every(
        (c, i, arr) => i === 0 || c <= arr[i - 1]
      );
      if (isProgressive) score += 4;

      // Well handicapped compared to best
      if (classStats.currentClass > classStats.highestClass + 2) score += 3;
    }

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Track Configuration Score
  const trackConfigScore = (() => {
    let score = 0;
    const maxScore = 10;

    const trackConfig = horse.stats?.trackConfigPerformance?.find(
      (t) => t.style === race?.trackConfig || "unknown"
    );

    if (trackConfig) {
      // Good win rate on this configuration
      if (trackConfig.winRate > 25) score += 4;
      if (trackConfig.winRate > 15) score += 2;

      // Experience on this configuration
      if (trackConfig.runs >= 5) score += 3;
      if (trackConfig.runs >= 3) score += 1;
    }

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Race Type Score
  const raceTypeScore = (() => {
    let score = 0;
    const maxScore = 10;

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

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Surface Adaptability Score
  const surfaceScore = (() => {
    let score = 0;
    const maxScore = 10;

    const surfaceStats = meetingDetails?.surface
      ? horse.stats?.surfaceStats?.[meetingDetails?.surface?.toLowerCase()]
      : undefined;
    if (surfaceStats) {
      // Strong win rate on surface
      if (surfaceStats.winRate > 25) score += 4;
      if (surfaceStats.winRate > 15) score += 2;

      // Proven on surface
      if (surfaceStats.runs >= 5) score += 2;
      if (surfaceStats.wins >= 2) score += 2;
    }

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Official Rating Progression Score
  const officialRatingScore = (() => {
    let score = 0;
    const maxScore = 10;

    if (horse.stats?.officialRatingProgression) {
      const progression = horse.stats.officialRatingProgression;

      // Currently well rated vs best
      if (progression[0] >= Math.max(...progression) - 5) score += 3;

      // Progressive pattern
      const isProgressive = progression.every(
        (r, i, arr) => i === 0 || r >= arr[i - 1] - 3
      );
      if (isProgressive) score += 4;

      // Well handicapped vs peak
      const dropFromBest = Math.max(...progression) - progression[0];
      if (dropFromBest > 5 && dropFromBest < 10) score += 3;
    }

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Consistency Score
  const consistencyScore = (() => {
    let score = 0;
    const maxScore = 10;

    const validRuns = horse.formObj?.form?.slice(0, 6) || [];
    if (validRuns.length >= 3) {
      // Finishing positions consistency
      const positions = validRuns
        .map((r) => parseInt(r.raceOutcomeCode || "0"))
        .filter((p) => p > 0);
      const positionVariance = calculateVariance(positions);
      if (positionVariance < 2) score += 4;
      if (positionVariance < 4) score += 2;

      // Performance level consistency
      const ratings = validRuns
        .map((r) => r.rpPostmark || 0)
        .filter((r) => r > 0);
      const ratingVariance = calculateVariance(ratings);
      if (ratingVariance < 5) score += 4;
    }

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Layoff Performance Score
  const layoffScore = (() => {
    let score = 0;
    const maxScore = 10;

    const daysOff = horse.stats?.daysOffTrack || 0;
    const form = horse.formObj?.form || [];

    // Good fresh record
    const freshRuns = form.filter((r) => {
      const runDaysOff = calculateDaysOff(r.raceDatetime);
      return runDaysOff > 60 && r.raceOutcomeCode === "1";
    });

    if (freshRuns.length >= 2) score += 3;
    if (freshRuns.length >= 1) score += 2;

    // Current layoff suitability
    if (daysOff < 30) score += 3;
    else if (daysOff < 60 && freshRuns.length > 0) score += 2;

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Weight Trend Score
  const weightTrendScore = (() => {
    let score = 0;
    const maxScore = 10;

    const weightProgression = horse.stats?.weightProgression || [];
    if (weightProgression.length >= 3) {
      // Progressive weight carrying
      const isProgressive = weightProgression.every(
        (w, i, arr) => i === 0 || Math.abs(w - arr[i - 1]) <= 3
      );
      if (isProgressive) score += 4;

      // Current weight vs recent average
      const recentAvg = avg(weightProgression.slice(0, 3));
      if (horse.weight.pounds <= recentAvg) score += 3;
      if (horse.weight.pounds <= recentAvg - 3) score += 3;
    }

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Prize Money Progression Score
  const prizeProgressionScore = (() => {
    let score = 0;
    const maxScore = 10;

    const form = horse.formObj?.form || [];
    const prizesWon = form
      .slice(0, 6)
      .map((r) => r.prizeSterling || 0)
      .filter((p) => p > 0);

    if (prizesWon.length >= 3) {
      // Progressive prize money winning
      const isProgressive = prizesWon.every(
        (p, i, arr) => i === 0 || p >= arr[i - 1] * 0.8
      );
      if (isProgressive) score += 5;

      // Current race prize vs average won
      const avgPrize = avg(prizesWon);
      const racePrize = parseInt(race.prize?.replace(/[£,]/g, "") || "0");
      if (racePrize <= avgPrize * 1.2) score += 5;
    }

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Course and Distance Combined Score
  const courseDistanceScore = (() => {
    let score = 0;
    const maxScore = 10;

    const cdRuns =
      horse.formObj?.form?.filter(
        (r) =>
          r.courseName?.toLowerCase() ===
            meetingDetails?.venue?.toLowerCase() &&
          Math.abs((r.distanceFurlong || 0) - raceStats.distanceInFurlongs) <= 1
      ) || [];

    if (cdRuns.length > 0) {
      // C&D wins
      const cdWins = cdRuns.filter((r) => r.raceOutcomeCode === "1").length;
      if (cdWins > 0) score += 4;
      if (cdWins > 1) score += 2;

      // C&D place rate
      const cdPlaces = cdRuns.filter(
        (r) => parseInt(r.raceOutcomeCode || "0") <= 3
      ).length;
      const cdPlaceRate = (cdPlaces / cdRuns.length) * 100;
      if (cdPlaceRate > 50) score += 4;
    }

    return { score, maxScore, percentage: (score / maxScore) * 100 };
  })();

  // Add helper function
  function calculateVariance(numbers: number[]): number {
    const mean = avg(numbers);
    const squareDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return avg(squareDiffs);
  }

  function calculateDaysOff(raceDate?: string): number {
    if (!raceDate) return 0;
    const raceTime = new Date(raceDate).getTime();
    const now = new Date().getTime();
    return Math.floor((now - raceTime) / (1000 * 60 * 60 * 24));
  }

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
    marketScore.score * weights.market +
    marginsScore.score * weights.margins +
    formProgressionScore.score * weights.formProgression +
    classMovementScore.score * weights.classMovement +
    trackConfigScore.score * weights.trackConfig +
    raceTypeScore.score * weights.raceType +
    surfaceScore.score * weights.surfaceAdaptability +
    officialRatingScore.score * weights.officialRating +
    consistencyScore.score * weights.consistency +
    layoffScore.score * weights.layoff +
    weightTrendScore.score * weights.weightTrend +
    prizeProgressionScore.score * weights.prizeProgression +
    courseDistanceScore.score * weights.courseDistance;

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
    marketScore.maxScore * weights.market +
    marginsScore.maxScore * weights.margins +
    formProgressionScore.maxScore * weights.formProgression +
    classMovementScore.maxScore * weights.classMovement +
    trackConfigScore.maxScore * weights.trackConfig +
    raceTypeScore.maxScore * weights.raceType +
    surfaceScore.maxScore * weights.surfaceAdaptability +
    officialRatingScore.maxScore * weights.officialRating +
    consistencyScore.maxScore * weights.consistency +
    layoffScore.maxScore * weights.layoff +
    weightTrendScore.maxScore * weights.weightTrend +
    prizeProgressionScore.maxScore * weights.prizeProgression +
    courseDistanceScore.maxScore * weights.courseDistance;

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
      margins: marginsScore,
      formProgression: formProgressionScore,
      classMovement: classMovementScore,
      trackConfig: trackConfigScore,
      raceType: raceTypeScore,
      surfaceAdaptability: surfaceScore,
      officialRating: officialRatingScore,
      consistency: consistencyScore,
      layoff: layoffScore,
      weightTrend: weightTrendScore,
      prizeProgression: prizeProgressionScore,
      courseDistance: courseDistanceScore,
    },
  };
}

function calculateDrawScore(
  drawPerf?: HorseStats["drawPerformance"]
): ScoreComponent {
  if (!drawPerf) return { score: 0, maxScore: 10, percentage: 0 };

  let score = 0;
  const maxScore = 10;

  // Reward good performance from bad draws
  if (drawPerf.runsFromBadDraw >= 3) {
    if (drawPerf.winRateFromBadDraw > 25) score += 5;
    if (drawPerf.winRateFromBadDraw > 15) score += 3;
    if (drawPerf.avgPositionFromBadDraw < 4) score += 2;
  }

  const percentage = (score / maxScore) * 100;
  return { score, maxScore, percentage };
}

function calculateMarginsScore(
  margins?: HorseStats["margins"]
): ScoreComponent {
  if (!margins) return { score: 0, maxScore: 10, percentage: 0 };

  let score = 0;
  const maxScore = 10;

  // Reward horses that win decisively
  if (margins.avgWinningDistance > 2) score += 3;
  if (margins.avgWinningDistance > 4) score += 2;

  // Reward horses that stay close when beaten
  if (margins.avgBeatenDistance < 3) score += 3;
  if (margins.avgBeatenDistance < 5) score += 2;

  const percentage = (score / maxScore) * 100;
  return { score, maxScore, percentage };
}
