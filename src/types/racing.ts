import { RaceAccordionStats } from "@/app/rp/utils/fetchRaceAccordion";
import { HorseScore } from "@/lib/racing/scores/types";

export interface Horse {
  name: string;
  profileUrl: string;
  formObj?: FormObj;
  number: string;
  draw?: string;
  age: string;
  headGear?: {
    code: string;
    description: string;
  };
  weight: {
    pounds: number;
    display: string;
  };
  jockey: {
    name: string;
    allowance?: string;
  };
  trainer: {
    name: string;
    stats?: string;
  };
  owner: string;
  rating: string;
  officialRating: string;
  topSpeed: string;
  form?: string;
  lastRun?: string;
  score?: HorseScore;
  stats?: HorseStats;
}

export interface Bet {
  horseName: string;
  odds: string;
  decimalOdds: number;
}

export interface RaceStats {
  avgOfficialRating: number;
  avgRating: number;
  avgTopSpeed: number;
  avgAge: number;
  avgWeight: number;
  avgLastRunDays: number;
  totalPrizeMoney: number;
  avgPrizeMoney: number;
  avgWinRate: number;
  avgPlaceRate: number;
  totalCareerWins: number;
  avgEarningsPerRace: number;
  avgBestRPR: number;
  avgBestTopSpeed: number;
  avgLastSixPosition: number;
  formTrends: {
    improving: number;
    declining: number;
    consistent: number;
  };
  classLevel: number;
  avgClassLevel: number;
  isHandicap: boolean;
  distanceInFurlongs: number;
  avgDistancePreference: number;
  distanceRange: {
    min: number;
    max: number;
    avg: number;
  };
  goingStats: {
    soft: number;
    good: number;
    firm: number;
    heavy: number;
  };
  courseStats: {
    leftHanded: number;
    rightHanded: number;
    straight: number;
  };
}

export interface Race {
  id?: string;
  time: string;
  title: string;
  raceExtraInfo?: RaceAccordionStats;
  runners: number;
  distance: string;
  class: string;
  ageRestriction: string;
  tv: string;
  prize?: string;
  url: string;
  going?: string;
  // surface?: string;
  // raceType?: string;
  // trackCondition?: string;
  // weather?: string;
  drawBias?: string;
  drawBiasExplanation?: string;
  trackConfig?: "left-handed" | "right-handed" | "straight";
  avgSpeedRating?: number;
  avgOfficialRating?: number;
  avgPrize?: number;
  avgTotalPrize?: number;
  avgRating?: number;
  stalls?: string;
  ewTerms?: string;
  bettingForecast?: Bet[];
  raceStats?: RaceStats;
  horses: Horse[];
  predictions?: PredictionRunner[];
  raceComment?: string;
}

export interface Meeting {
  venue: string;
  surface: string;
  firstRace: string;
  lastRace: string;
  type: string;
  raceCount: string;
  going: string;
  races: Race[];
}

export interface VideoDetail {
  ptvVideoId?: number;
  videoProvider?: string;
  completeRaceUid?: number;
  completeRaceStart?: number;
  completeRaceEnd?: number;
  finishRaceUid?: number;
  finishRaceStart?: number;
  finishRaceEnd?: number;
}

export interface RaceTactics {
  actual?: {
    runnerAttribType?: null | string;
    runnerAttribDescription?: null | string;
  };
  predicted?: {
    runnerAttribType?: null | string;
    runnerAttribDescription?: null | string;
  };
}

export interface FormEntry {
  raceInstanceUid?: number;
  raceGroupUid?: number;
  raceDatetime?: string;
  localMeetingRaceDatetime?: string;
  courseUid?: number;
  courseTypeCode?: string;
  courseName?: string;
  courseStyleName?: string;
  courseRegion?: string;
  countryCode?: string;
  raceInstanceTitle?: string;
  raceTypeCode?: string;
  courseRpAbbrev3?: string;
  courseRpAbbrev4?: string;
  courseCode?: string;
  courseComments?: string;
  goingTypeServicesDesc?: string;
  prizeSterling?: number;
  prizeEuro?: number;
  distanceYard?: number;
  distanceFurlong?: number;
  raceClass?: null | number;
  agesAllowedDesc?: string;
  rpBettingMovements?: string;
  raceGroupCode?: string;
  raceGroupDesc?: string;
  weightCarriedLbs?: number;
  weightAllowanceLbs?: number;
  noOfRunners?: number;
  rpCloseUpComment?: string;
  horseHeadGear?: string | null;
  firstTimeHeadgear?: boolean;
  oddsDesc?: string;
  oddsValue?: number;
  jockeyStyleName?: string;
  jockeyShortName?: string;
  jockeyUid?: number;
  jockeyPtpTypeCode?: string;
  officialRatingRanOff?: number;
  rpTopspeed?: number;
  rpPostmark?: number;
  videoDetail?: VideoDetail[];
  raceDescription?: string;
  distanceToWinner?: string | null;
  winningDistance?: string | null;
  goingTypeCode?: string;
  raceOutcomeCode?: string;
  otherHorse?: {
    styleName?: string;
    horseUid?: number;
    weightCarriedLbs?: number;
  };
  disqualificationUid?: null | number;
  disqualificationDesc?: null | string;
  rpStraightRoundJubileeDesc?: null | string;
  draw?: number;
  raceTactics?: RaceTactics;
}

export interface RaceRecord {
  starts?: number;
  wins?: number;
  "2nds"?: number;
  "3rds"?: number;
  winnigs?: number;
  earnings?: number;
  totalPrize?: number;
  winPrize?: number;
  netTotalPrize?: number;
  netWinPrize?: number;
  euroWinPrize?: number;
  euroTotalPrize?: number;
  usdWinPrize?: number;
  usdTotalPrize?: number;
  bestTs?: number;
  bestRpr?: number;
  "or+"?: number;
  stake?: number;
  latestBhb?: number | null;
}

export interface FormObj {
  form?: FormEntry[];
  raceRecords?: {
    lifetimeRecords?: {
      "All-weather"?: RaceRecord;
      "Rules Races"?: RaceRecord;
    };
    flatPlacings?: {
      [year: string]: number[];
    };
    jumpsPlacings?: null | unknown;
    flatFiguresCalculated?: Array<{
      formFigure?: string;
      raceTypeCode?: string | null;
    }>;
    jumpsFiguresCalculated?: null | unknown;
    surfaceRecord?: Array<{
      surfaceDesc: string;
      surfaceCode: string;
      runs: number | null;
      wins: number | null;
    }>;
  };
}

export interface HorseStats {
  totalStarts?: number;
  totalWins?: number;
  winRate?: number;
  placeRate?: number;
  avgEarningsPerRace?: number;
  totalEarnings?: number;
  recentFormTrend?: "improving" | "declining" | "consistent";
  avgPositionLastSix?: number;
  finishingPositions?: number[];
  bestRPR?: number;
  avgRPR?: number;
  rprProgression?: number[];
  bestTopSpeed?: number;
  avgTopSpeed?: number;
  topSpeedProgression?: number[];
  minDistance?: number;
  maxDistance?: number;
  avgDistance?: number;
  distanceProgression?: number[];
  minWeight?: number;
  maxWeight?: number;
  avgWeight?: number;
  weightProgression?: number[];
  highestPrize?: number;
  avgPrize?: number;
  totalPrizeMoney?: number;
  goingPerformance?: Array<GoingRecord>;
  surfaceStats?: {
    [key: string]: {
      runs: number;
      wins: number;
      winRate: number;
    };
  };
  latestOR?: number;
  bestOfficialRating?: number;
  avgOfficialRating?: number;
  officialRatingProgression?: number[];
  daysOffTrack: number;
  racingFrequency: number;
  seasonalForm: {
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
  };
  classProgression: Array<number>;
  avgClassLevel: number;
  preferredClass: string;
  distancePreference: "sprinter" | "middle" | "stayer";
  distanceStats: {
    optimal: number;
    range: { min: number; max: number; avg: number };
    performanceByType: {
      sprint: { runs: number; wins: number; winRate: number };
      mile: { runs: number; wins: number; winRate: number };
      middle: { runs: number; wins: number; winRate: number };
      staying: { runs: number; wins: number; winRate: number };
    };
  };
  raceTypeStats?: {
    flat: {
      runs: number;
      wins: number;
      places: number;
      winRate: number;
      placeRate: number;
    };
    aw: {
      runs: number;
      wins: number;
      places: number;
      winRate: number;
      placeRate: number;
    };
    hurdle: {
      runs: number;
      wins: number;
      places: number;
      winRate: number;
      placeRate: number;
    };
    chase: {
      runs: number;
      wins: number;
      places: number;
      winRate: number;
      placeRate: number;
    };
  };
  classStats: {
    highestClass: number;
    lowestClass: number;
    currentClass: number;
    classProgression: number[];
  };
  margins: {
    avgWinningDistance: number;
    avgBeatenDistance: number;
    totalWinningDistance: number;
    totalBeatenDistance: number;
    maxWinningMargin: number;
    maxBeatenDistance: number;
  };
  drawPerformance: {
    winsFromBadDraw: number;
    runsFromBadDraw: number;
    winRateFromBadDraw: number;
    avgPositionFromBadDraw: number;
    bestPositionFromBadDraw: number;
  };
  sentiment: {
    recentCommentScore: number;
    avgCommentScore: number;
    positiveComments: number;
    negativeComments: number;
    trend: "positive" | "negative" | "neutral";
  };
  runStyle?: "leader" | "prominent" | "midfield" | "held up";
  goingStats?: Array<{
    type: string;
    runs: number;
    wins: number;
    winRate: number;
    avgPosition?: number;
  }>;
  distancePerformance?: {
    sprint: DistanceCategory;
    mile: DistanceCategory;
    middle: DistanceCategory;
    staying: DistanceCategory;
  };
  optimalDistance?: number;
  courseForm?: {
    runs: number;
    wins: number;
    places: number;
    winRate: number;
    placeRate: number;
    avgPosition?: number;
  };
  trackConfigPerformance?: Array<{
    style: TrackConfiguration;
    runs: number;
    wins: number;
    winRate: number;
    avgPosition?: number;
  }>;
  formProgression?: {
    last3: number[];
    last6: number[];
    trend: "improving" | "declining" | "steady";
    lastSixPositions: number[];
    positionTrend: "improving" | "declining" | "steady";
    averagePosition: number;
  };
  classMovement?: {
    current: number;
    highest: number;
    lowest: number;
    trend: "up" | "down" | "stable";
  };
  consistency?: {
    finishPositions: number[];
    avgPosition: number;
    stdDev: number;
    reliability: number;
  };
  layoff?: {
    currentDays: number;
    avgGapDays: number;
    performanceAfterBreak: {
      runs: number;
      wins: number;
      winRate: number;
    };
  };
  seasonal?: Record<
    string,
    {
      runs: number;
      wins: number;
      winRate: number;
      earnings: number;
    }
  >;
}

interface DistanceCategory {
  min: number;
  max: number;
  runs: number;
  wins: number;
  winRate: number;
}

type TrackConfiguration = "left-handed" | "right-handed" | "straight";

export interface RaceStats {
  avgOfficialRating: number;
  avgRating: number;
  avgTopSpeed: number;
  avgAge: number;
  avgWeight: number;
  avgLastRunDays: number;
  totalPrizeMoney: number;
  avgPrizeMoney: number;
  avgWinRate: number;
  avgPlaceRate: number;
  totalCareerWins: number;
  avgEarningsPerRace: number;
  avgBestRPR: number;
  avgBestTopSpeed: number;
  avgLastSixPosition: number;
  formTrends: {
    improving: number;
    declining: number;
    consistent: number;
  };
  classLevel: number;
  avgClassLevel: number;
  isHandicap: boolean;
  distanceInFurlongs: number;
  avgDistancePreference: number;
  distanceRange: {
    min: number;
    max: number;
    avg: number;
  };
  goingStats: {
    soft: number;
    good: number;
    firm: number;
    heavy: number;
  };
  courseStats: {
    leftHanded: number;
    rightHanded: number;
    straight: number;
  };
}

export interface Meeting {
  venue: string;
  surface: string;
  firstRace: string;
  lastRace: string;
  type: string;
  raceCount: string;
  going: string;
  races: Race[];
}

export interface Bet {
  horseName: string;
  odds: string;
  decimalOdds: number;
}

export interface PredictionRunner {
  id: number;
  name: string;
  diffusion_name: string;
  saddle_cloth_number: number;
  score: number;
  dist_to_horse_in_front: string | null;
  dist_to_winner: string | null;
}

export interface PredictionRace {
  id: number;
  time: string;
  surface: string;
  time_before_update: number;
  diffusion_competition_name: string;
  diffusion_race_date: string;
  diffusion_event_name: string;
}

export interface PredictionResponse {
  data: {
    race: PredictionRace;
    runners: { [key: string]: PredictionRunner };
  };
  status: number;
}

export interface GoingRecord {
  goingCode: string;
  type: string;
  runs: number;
  wins: number;
  winRate: number;
}

export interface RaceResult {
  time: string;
  course: string;
  raceId?: string;
  distance: string;
  prizeMoney?: string;
  winner: {
    name: string;
    trainer: string;
    jockey: string;
  };
  placedHorses: {
    position: string;
    name: string;
  }[];
  runnersTotal: number;
  winningDistance?: string;
  winningTime?: string;
}

export interface RaceResults {
  date: string;
  results: RaceResult[];
}

export interface TipSelection {
  horse: string;
  comment?: string;
  rank?: number;
}

export interface RaceTip {
  time: string;
  selections: TipSelection[];
  verdict?: string;
}

export interface CourseTips {
  course: string;
  races: RaceTip[];
}

export interface DayTips {
  date: string;
  atrTips: CourseTips[];
  timeformTips: CourseTips[];
}

export interface GytoTip {
  time: string;
  horse: string;
  isNap: boolean;
}

export interface GytoTips {
  date: string;
  tips: GytoTip[];
}

export interface NapsTableTip {
  time: string;
  horse: string;
  tipster: string;
  score: string;
}

export interface NapsTableTips {
  date: string;
  tips: NapsTableTip[];
}
