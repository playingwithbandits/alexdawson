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
    mostRecentForm: {
      rpr: number;
    };
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
  maxes: {
    mostRecentForm: {
      rpr: number;
    };
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

export interface ScoreObj {
  total: number;
  horseBetterThanRaceTheshold: {
    rpr_racedAgainst_Beaten_Averages: boolean;
    rpr_racedAgainst_Beaten_Maxes: boolean;
    timePerFurlong: boolean;
    mostRecentForm: boolean;
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
  };
}

export interface Horse {
  id: string;
  name: string;
  jockey: string;
  form: FormObj[];
  formInfo: FormInfo;
  rpr: number;
  scoreObj?: ScoreObj;
  mostRecentForm: FormObj | undefined;
  oddsDecimal: number;
  lastRan: number;
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
