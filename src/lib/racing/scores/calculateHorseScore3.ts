import { Horse, Meeting, Race, RaceStats } from "@/types/racing";
import { calculateRatingsScore } from "./ratings";
import { HorseScore } from "./types";
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

export function calculateHorseScore3(props: {
  horse: Horse;
  race: Race;
  raceStats: RaceStats;
  meetingDetails: Partial<Meeting>;
}): HorseScore {
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
  const sentiment = calculateSentimentScore(props); //done

  const totalScore = Object.entries({
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
  }).reduce((acc, [key, component]) => {
    // Normalize the score (0-1) and apply the weight
    const normalizedWeightedScore =
      (component.score / component.maxScore) *
      RACING_SCORE_WEIGHTS[key as keyof typeof RACING_SCORE_WEIGHTS];
    return acc + normalizedWeightedScore;
  }, 0);

  // Calculate total max score (sum of all weights)
  const totalMaxScore = Object.values(RACING_SCORE_WEIGHTS).reduce(
    (acc, weight) => acc + weight,
    0
  );

  const total = {
    score: totalScore,
    maxScore: totalMaxScore,
    percentage: (totalScore / totalMaxScore) * 100,
  };

  console.log(total);

  return {
    total,
    components: {
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
    },
  };
}
