import { FormEntry, Horse, Meeting, Race, RaceStats } from "@/types/racing";

export interface HorseScore {
  total: ScoreComponent;
  components: {
    ratings?: ScoreComponent;
    distance?: ScoreComponent;
    going?: ScoreComponent;
    form?: ScoreComponent;
    course?: ScoreComponent;
    class?: ScoreComponent;
    connections?: ScoreComponent;
    prize?: ScoreComponent;
    weight?: ScoreComponent;
    draw?: ScoreComponent;
    seasonal?: ScoreComponent;
    connectionCombo?: ScoreComponent;
    market?: ScoreComponent;
    margins?: ScoreComponent;
    formProgression?: ScoreComponent;
    trackConfig?: ScoreComponent;
    officialRating?: ScoreComponent;
    consistency?: ScoreComponent;
    layoff?: ScoreComponent;
    weightTrend?: ScoreComponent;
    courseDistance?: ScoreComponent;
    sentiment?: ScoreComponent;
    pace?: ScoreComponent;
    headGear?: ScoreComponent;
    fieldSize?: ScoreComponent;
    timeOfDay?: ScoreComponent;
    weather?: ScoreComponent;
    travelDistance?: ScoreComponent;
    ageProfile?: ScoreComponent;
    competitiveness?: ScoreComponent;
    bounce?: ScoreComponent;
    improvement?: ScoreComponent;
    racedAgainst?: ScoreComponent;
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

export interface AllBeatenHorsesNowGoneOntoStats {
  raw: BeatenHorseFormObjsStats[];
  maxes: {
    rpr: number;
    or: number;
  };
}

export interface BeatenHorseFormObjsStats {
  raw: BeatenHorseFormObj[];
  maxes: {
    rpr: number;
    or: number;
  };
}
export interface BeatenHorseFormObj {
  name: string;
  allForms: FormEntry[];
  greaterThanDate: string;
  validForms: FormEntry[];
  stats: {
    rpr: number[];
    or: number[];
  };
  stats_max: {
    maxRpr: number;
    maxOr: number;
  };
  profileUrl: string;
}

export interface LastRaceRunner {
  name: string;
  profileUrl: string;
  position: number;
  or: number;
  rpr: number;
  ts: number;
  draw: number;
  age: number;
  trainer: string;
  jockey: number;
  oddsDec: number;
  distanceBeaten: number;
}

export interface LastRaceStats {
  raceTypeCode: string;
  runners_all: LastRaceRunner[];
  runners_beaten: LastRaceRunner[];
  averages_all: {
    or: number;
    rpr: number;
    ts: number;
    draw: number;
    age: number;
  };
  averages_beaten: {
    or: number;
    rpr: number;
    ts: number;
    draw: number;
    age: number;
  };
  maxes_all: {
    or: number;
    rpr: number;
    ts: number;
    draw: number;
    age: number;
  };
  maxes_beaten: {
    or: number;
    rpr: number;
    ts: number;
    draw: number;
    age: number;
  };
  info: {
    winningTimeSeconds: number;
    winningTimeStatus: string;
    timePerFurlong: number;
    distanceF: number;
  };
}
