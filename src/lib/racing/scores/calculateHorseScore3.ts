import { calculateRatingsScore } from "./ratings";
import { HorseScore, ScoreParams } from "./types";
import { calculateDistanceScore } from "./distance";
import { calculateGoingScore } from "./going";
import { calculateFormScore } from "./form";
import { calculateCourseScore } from "./course";
import { calculateClassScore } from "./class";
import { calculateConnectionsScore } from "./connections";
import { calculatePrizeScore } from "./prize";
import { calculateWeightScore } from "./weight";
import { calculateDrawScore } from "./draw";
import { calculateSeasonalScore } from "./seasonal";
import { calculateConnectionComboScore } from "./connectionCombo";
import { calculateMarketScore } from "./market";
import { calculateMarginsScore } from "./margins";
import { calculateFormProgressionScore } from "./formProgression";
import { calculateTrackConfigScore } from "./trackConfig";
import { calculateOfficialRatingScore } from "./officialRating";
import { calculateConsistencyScore } from "./consistency";
import { calculateLayoffScore } from "./layoff";
import { calculateWeightTrendScore } from "./weightTrend";
import { calculateCourseDistanceScore } from "./courseDistance";
import { calculateSentimentScore } from "./sentiment";
import { RACING_SCORE_WEIGHTS } from "./weights";
import { calculateBounceScore } from "./bounce";
import { calculatePaceScore } from "./pace";
import { calculateAgeProfileScore } from "./ageProfile";
import { calculateHeadGearScore } from "./headGear";
import { calculateCompetitivenessScore } from "./competitiveness";
import { calculateImprovementScore } from "./improvement";
import { calculateFieldSizeScore } from "./fieldSize";
import { calculateTimeOfDayScore } from "./timeOfDay";
import { calculateWeatherScore } from "./weather";
import { calculateTravelDistanceScore } from "./travelDistance";

export function calculateHorseScore3(props: ScoreParams): HorseScore {
  const ratings = calculateRatingsScore(props);
  const distance = calculateDistanceScore(props);

  const going = calculateGoingScore(props);
  const form = calculateFormScore(props);
  const course = calculateCourseScore(props);
  const classScore = calculateClassScore(props);
  const connections = calculateConnectionsScore(props);
  const prize = calculatePrizeScore(props);
  const weight = calculateWeightScore(props);
  const draw = calculateDrawScore(props);
  const seasonal = calculateSeasonalScore(props);
  const connectionCombo = calculateConnectionComboScore(props);
  const market = calculateMarketScore(props);
  const margins = calculateMarginsScore(props);
  const formProgression = calculateFormProgressionScore(props);
  const trackConfig = calculateTrackConfigScore(props);
  const officialRating = calculateOfficialRatingScore(props);
  const consistency = calculateConsistencyScore(props);
  const layoff = calculateLayoffScore(props);
  const weightTrend = calculateWeightTrendScore(props);
  const courseDistance = calculateCourseDistanceScore(props);
  const sentiment = calculateSentimentScore(props);

  const pace = calculatePaceScore(props);
  const headGear = calculateHeadGearScore(props);
  const fieldSize = calculateFieldSizeScore(props);
  const timeOfDay = calculateTimeOfDayScore(props);
  const weather = calculateWeatherScore(props);
  const travelDistance = calculateTravelDistanceScore(props);
  const ageProfile = calculateAgeProfileScore(props);
  const competitiveness = calculateCompetitivenessScore(props);
  const improvement = calculateImprovementScore(props);
  const bounce = calculateBounceScore(props);

  const components = {
    ratings,
    distance,
    going,
    form,
    course,
    class: classScore,
    connections,
    prize,
    weight,
    draw,
    seasonal,
    connectionCombo,
    market,
    margins,
    formProgression,
    trackConfig,
    officialRating,
    consistency,
    layoff,
    weightTrend,
    courseDistance,
    sentiment,
    pace,
    headGear,
    fieldSize,
    timeOfDay,
    weather,
    travelDistance,
    ageProfile,
    competitiveness,
    improvement,
    bounce,
  };

  const weightedScores = Object.entries(components).map(
    ([key, component]) =>
      component.percentage *
      RACING_SCORE_WEIGHTS[key as keyof typeof components]
  );

  const totalScore = weightedScores.reduce((a, b) => a + b, 0);
  const maxPossibleScore = Object.values(RACING_SCORE_WEIGHTS).reduce(
    (a, b) => a + b * 100,
    0
  );

  return {
    total: {
      score: totalScore,
      maxScore: maxPossibleScore,
      percentage: (totalScore / maxPossibleScore) * 100,
    },
    components,
  };
}
