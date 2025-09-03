export interface Meeting {
  trackId: string;
  races: Race[];
}

export interface Bet {
  horseName: string;
  odds: string;
  decimalOdds: number;
}

export interface Race {
  id: string;
  time: string;
  title: string;
  distanceF: number;
  goingCodes: string[];
  raceClass: number;
  raceTypeCode: string;

  horses: Horse[];
  horsesInfo: RaceHorsesInfo;
}

export interface RaceHorsesInfo {
  averages: {
    race_rpr: number;
    race_or: number;
    race_min_timePerFurlong: number;
    race_averages_racedAgainst: number;
    race_maxes_racedAgainst: number;
    race_averages_racedAgainst_Averages: number;
    race_maxes_racedAgainst_Averages: number;
    race_averages_racedAgainst_Beaten: number;
    race_maxes_racedAgainst_Beaten: number;
    race_averages_racedAgainst_Beaten_Averages: number;
    race_maxes_racedAgainst_Beaten_Averages: number;
    race_mostRecentForm_racedAgainst_Beaten_Averages: number;
    race_mostRecentForm_racedAgainst_Beaten_Maxes: number;
  };
  maxes: {
    race_rpr: number;
    race_or: number;
    race_min_timePerFurlong: number;
    race_averages_racedAgainst: number;
    race_maxes_racedAgainst: number;
    race_averages_racedAgainst_Averages: number;
    race_maxes_racedAgainst_Averages: number;
    race_averages_racedAgainst_Beaten: number;
    race_maxes_racedAgainst_Beaten: number;
    race_averages_racedAgainst_Beaten_Averages: number;
    race_maxes_racedAgainst_Beaten_Averages: number;
    race_mostRecentForm_racedAgainst_Beaten_Averages: number;
    race_mostRecentForm_racedAgainst_Beaten_Maxes: number;
  };
  min: {
    race_min_timePerFurlong: number;
  };
  rawData: {
    raw_race_rpr: number[];
    raw_race_or: number[];
    raw_race_min_timePerFurlong: number[];
    raw_race_averages_racedAgainst: number[];
    raw_race_maxes_racedAgainst: number[];
    raw_race_averages_racedAgainst_Averages: number[];
    raw_race_maxes_racedAgainst_Averages: number[];
    raw_race_averages_racedAgainst_Beaten: number[];
    raw_race_maxes_racedAgainst_Beaten: number[];
    raw_race_averages_racedAgainst_Beaten_Averages: number[];
    raw_race_maxes_racedAgainst_Beaten_Averages: number[];
    raw_race_mostRecentForm_racedAgainst_Beaten_Averages: number[];
    raw_race_mostRecentForm_racedAgainst_Beaten_Maxes: number[];
  };
}

export interface ScoreObj {
  total: number;
  horseBetterThanRaceTheshold: {
    race_rpr: boolean;
    race_averages_racedAgainst: boolean;
    race_maxes_racedAgainst: boolean;
    race_averages_racedAgainst_Averages: boolean;
    race_maxes_racedAgainst_Averages: boolean;
    race_averages_racedAgainst_Beaten: boolean;
    race_maxes_racedAgainst_Beaten: boolean;
    race_averages_racedAgainst_Beaten_Averages: boolean;
    race_maxes_racedAgainst_Beaten_Averages: boolean;
    race_mostRecentForm_racedAgainst_Beaten_Averages: boolean;
    race_mostRecentForm_racedAgainst_Beaten_Maxes: boolean;
    race_min_timePerFurlong: boolean;
    race_handicapped_rpr: boolean;
    handicapped_maxes_racedAgainst_Beaten_rpr: boolean;
    handicapped_maxes_racedAgainst_Beaten_Averages_rpr: boolean;
    handicapped_maxes_racedAgainst_Beaten_Maxes_rpr: boolean;
    handicapped_averages_racedAgainst_Beaten_rpr: boolean;
    handicapped_averages_racedAgainst_Beaten_Averages_rpr: boolean;
    handicapped_averages_racedAgainst_Beaten_Maxes_rpr: boolean;

    handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr: boolean;
    handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr: boolean;
  };
  horseFormAveragesStatsGood: {
    distance: boolean;
    goingCode: boolean;
    jockey: boolean;
  };
  horseRacedWith: {
    jockey: boolean;
    goingCode: boolean;
    lastRan: boolean;
    distance: boolean;
  };
}

export interface Horse {
  id: string;
  name: string;
  jockey: string;
  age: number;
  form: FormObj[];
  formInfo: FormInfo;
  rpr: number;
  or: number;
  scoreObj?: ScoreObj;
  mostRecentForm: FormObj | undefined;
  oddsDecimal: number;
  lastRan: number;
  handicapBonus?: number;
  handicappedRpr?: number;
}

export interface FormInfo {
  rawData: {
    rpr: number[];
    distanceF: number[];
    trackIds: string[];
    goingCodes: string[];
    jockeys: string[];
    timePerFurlong: number[];
    racedAgainst: {
      rpr: number[];
    };
    racedAgainst_Beaten: {
      rpr: number[];
    };
    racedAgainst_Averages: {
      rpr: number[];
    };
    racedAgainst_Beaten_Averages: {
      rpr: number[];
    };
    racedAgainst_Maxes: {
      rpr: number[];
    };
    racedAgainst_Beaten_Maxes: {
      rpr: number[];
    };
  };
  averages: {
    rpr: number;
    distanceF: number;
    trackIds: string[];
    goingCodes: string[];
    jockeys: string[];
    racedAgainst: {
      rpr: number;
    };
    racedAgainst_Beaten: {
      rpr: number;
    };
    racedAgainst_Averages: {
      rpr: number;
    };
    racedAgainst_Beaten_Averages: {
      rpr: number;
    };
    racedAgainst_Maxes: {
      rpr: number;
    };
    racedAgainst_Beaten_Maxes: {
      rpr: number;
    };
  };
  maxes: {
    rpr: number;
    racedAgainst: {
      rpr: number;
    };
    racedAgainst_Beaten: {
      rpr: number;
    };
    racedAgainst_Averages: {
      rpr: number;
    };
    racedAgainst_Beaten_Averages: {
      rpr: number;
    };
    racedAgainst_Maxes: {
      rpr: number;
    };
    racedAgainst_Beaten_Maxes: {
      rpr: number;
    };
  };
  min: {
    timePerFurlong: number;
  };
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
  id: string;
  raceDate: string;
  trackId: string;
  goingCodes: string[];
  position: number;

  racedAgainstRaw: RacedAgainstForm[];
  racedAgainstInfo: RacedAgainstInfo;
  racedAgainst_Beaten: RacedAgainstForm[];
  racedAgainst_BeatenInfo: RacedAgainstInfo;

  rpr: number;

  raceClass: number;

  distanceF: number;
  totalRaceTime: number;
  timePerFurlong: number;

  raceType: string;
  raceTypeCode: string;

  jockey: string;
  comment: string;
  commentMatchedTerms: {
    hampered: string[];
    eyecatcher: string[];
    positive: string[];
    negative: string[];
  };
}

export interface RacedAgainstForm {
  id: string;
  name: string;
  position: number;
  distanceToWinner: number;
  rpr: number;
}

export interface RacedAgainstInfo {
  rawData: {
    rpr: number[];
  };
  averages: {
    rpr: number;
  };
  maxes: {
    rpr: number;
  };
}
