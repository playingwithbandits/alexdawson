export interface Meeting {
  trackId: string;
  races: Race[];
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
    rpr: number;
    racedAgainst: {
      rpr: number;
    };
    racedAgainst_Beaten: {
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
  };
  min: {
    timePerFurlong: number;
  };
}

export interface ScoreObj {
  total: number;
  horseBetterThanRaceAverage: {
    rpr: boolean;
  };
  horseBetterThanRaceTheshold: {
    rpr: boolean;
    timePerFurlong: boolean;
  };
  horseFormRacedAgainstBeatenBetterThanRaceRacedAgainstBeatenAverage: {
    rpr: boolean;
  };
  horseFormAveragesStatsGood: {
    distance: boolean;
    goingCode: boolean;
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
}

export interface FormInfo {
  rawData: {
    rpr: number[];
    distanceF: number[];
    trackId: string[];
    goingCodes: string[];
    jockey: string[];
    timePerFurlong: number[];
    racedAgainst: {
      rpr: number[];
    };
    racedAgainst_Beaten: {
      rpr: number[];
    };
  };
  averages: {
    rpr: number;
    distanceF: number;
    trackId: string;
    goingCode: string;
    jockey: string;
    racedAgainst: {
      rpr: number;
    };
    racedAgainst_Beaten: {
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
