import { HorseScore } from "./types";

export const DEFAULT_SCORE = { score: 0, maxScore: 0, percentage: 0 };

export const RACING_SCORE_WEIGHTS: Record<
  keyof HorseScore["components"],
  number
> = {
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
  sentiment: 0.06,
};
