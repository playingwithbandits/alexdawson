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
import { calculateClassMovementScore } from "./classMovement";
import { calculateTrackConfigScore } from "./trackConfig";
import { calculateRaceTypeScore } from "./raceType";
import { calculateSurfaceAdaptabilityScore } from "./surfaceAdaptability";
import { calculateOfficialRatingScore } from "./officialRating";
import { calculateConsistencyScore } from "./consistency";
import { calculateLayoffScore } from "./layoff";
import { calculateWeightTrendScore } from "./weightTrend";
import { calculatePrizeProgressionScore } from "./prizeProgression";
import { calculateCourseDistanceScore } from "./courseDistance";
import { calculateSentimentScore } from "./sentiment";

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
  const classMovement = calculateClassMovementScore(props);
  const trackConfig = calculateTrackConfigScore(props);
  const raceType = calculateRaceTypeScore(props);
  const surfaceAdaptability = calculateSurfaceAdaptabilityScore(props);
  const officialRating = calculateOfficialRatingScore(props);
  const consistency = calculateConsistencyScore(props);
  const layoff = calculateLayoffScore(props);
  const weightTrend = calculateWeightTrendScore(props);
  const prizeProgression = calculatePrizeProgressionScore(props);
  const courseDistance = calculateCourseDistanceScore(props);
  const sentiment = calculateSentimentScore(props); //done

  const totalScore = [
    ratings,
    distance,
    going,
    form,
    course,
    classScore,
    connections,
    prize,
    weight,
    draw,
    seasonal,
    connectionCombo,
    market,
    margins,
    formProgression,
    classMovement,
    trackConfig,
    raceType,
    surfaceAdaptability,
    officialRating,
    consistency,
    layoff,
    weightTrend,
    prizeProgression,
    courseDistance,
    sentiment,
  ].reduce((acc, curr) => acc + curr.score, 0);
  const totalMaxScore = [
    ratings,
    distance,
    going,
    form,
    course,
    classScore,
    connections,
    prize,
    weight,
    draw,
    seasonal,
    connectionCombo,
    market,
    margins,
    formProgression,
    classMovement,
    trackConfig,
    raceType,
    surfaceAdaptability,
    officialRating,
    consistency,
    layoff,
    weightTrend,
    prizeProgression,
    courseDistance,
    sentiment,
  ].reduce((acc, curr) => acc + curr.maxScore, 0);

  const total = {
    score: totalScore,
    maxScore: totalMaxScore,
    percentage: totalMaxScore === 0 ? 0 : (totalScore / totalMaxScore) * 100,
  };

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
      classMovement,
      trackConfig,
      raceType,
      surfaceAdaptability,
      officialRating,
      consistency,
      layoff,
      weightTrend,
      prizeProgression,
      courseDistance,
      sentiment,
    },
  };
}
