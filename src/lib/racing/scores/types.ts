import { Horse, Race, RaceStats, Meeting } from "@/types/racing";

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
    trackConfig: ScoreComponent;
    officialRating: ScoreComponent;
    consistency: ScoreComponent;
    layoff: ScoreComponent;
    weightTrend: ScoreComponent;
    courseDistance: ScoreComponent;
    sentiment: ScoreComponent;
  };
}

export interface ScoreComponent {
  score: number;
  maxScore: number;
  percentage: number;
}

export interface ScoreParams {
  horse: Horse;
  race: Race;
  raceStats: RaceStats;
  meetingDetails: Partial<Meeting>;
}
