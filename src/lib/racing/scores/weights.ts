import { HorseScore } from "./types";

export const DEFAULT_SCORE = { score: 0, maxScore: 0, percentage: 0 };

export const RACING_SCORE_WEIGHTS: Record<
  keyof HorseScore["components"],
  number
> = {
  // Primary factors (1.4-1.5)
  ratings: 1.5, // Core ability indicator
  form: 1.5, // Recent performance
  officialRating: 1.4, // Official handicap mark
  formProgression: 1.4, // Form trajectory

  // Major factors (1.2-1.3)
  distance: 1.3, // Proven ability at race distance
  going: 1.3, // Performance on similar ground
  class: 1.2, // Class level performance
  pace: 1.2, // Race pace suitability
  improvement: 1.2, // Scope for improvement
  courseDistance: 1.2, // Course and distance record

  // Important factors (1.0-1.1)
  course: 1.1, // Track record at venue
  trackConfig: 1.1, // Track configuration
  consistency: 1.1, // Performance consistency
  connections: 1.0, // Trainer/jockey performance
  competitiveness: 1.0, // Race competitiveness factor
  weight: 1.0, // Weight carrying ability

  // Secondary factors (0.8-0.9)
  layoff: 0.9, // Days since last run
  draw: 0.9, // Draw bias impact
  connectionCombo: 0.9, // Jockey/trainer combination
  breeding: 0.9, // Pedigree analysis
  trainerPatterns: 0.9, // Trainer patterns/angles
  jockeyPatterns: 0.9, // Jockey patterns/angles
  bounce: 0.8, // Recovery from big effort
  weightTrend: 0.8, // Weight carrying trends
  seasonal: 0.8, // Seasonal patterns
  margins: 0.8, // Winning/losing margins

  // Minor factors (0.6-0.7)
  prize: 0.7, // Prize money performance
  market: 0.7, // Market performance
  sentiment: 0.7, // Comment analysis
  fieldSize: 0.7, // Performance by field size
  headGear: 0.7, // Response to equipment
  travelDistance: 0.7, // Distance from training base
  ageProfile: 0.7, // Age vs race type suitability
  weather: 0.6, // Weather conditions impact
  timeOfDay: 0.6, // Performance by race timing
};
