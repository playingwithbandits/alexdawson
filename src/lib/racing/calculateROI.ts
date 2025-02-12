import { Meeting, RaceResults } from "@/types/racing";
import { horseNameToKey } from "./scores/funcs";
import { normalizeTime } from "@/components/horse/DayPredictions";

interface RoiResult {
  roi: number;
  wins: number;
  total: number;
  totalReturns: number;
  totalBets: number;
  noResults?: boolean;
}

interface CalculateRoiParams {
  meetings?: Meeting[];
  results?: RaceResults;
  picks?: {
    time: string;
    horse: string;
  }[];
}

export function calculateROI({
  meetings,
  results,
  picks,
}: CalculateRoiParams): RoiResult {
  if (!results || !picks)
    return {
      roi: 0,
      wins: 0,
      total: 0,
      totalReturns: 0,
      totalBets: 0,
      noResults: true,
    };

  let totalBets = 0;
  let totalReturns = 0;
  let wins = 0;

  const bettingForecasts = meetings?.flatMap((m) => {
    return m.races.flatMap((r) => {
      return { time: r.time, bettingForecast: r.bettingForecast };
    });
  });

  picks?.forEach((pick) => {
    const raceResult = results?.results.find(
      (r) => normalizeTime(r.time) === normalizeTime(pick.time)
    );

    const pickedHorse = horseNameToKey(pick.horse);

    const bettingForecast = bettingForecasts?.find(
      (b) => normalizeTime(b.time) === normalizeTime(pick.time)
    );

    const odds =
      bettingForecast?.bettingForecast?.find(
        (b) => horseNameToKey(b.horseName) === pickedHorse
      )?.decimalOdds || 2;

    const winner = horseNameToKey(raceResult?.winner?.name || "");
    if (pickedHorse && pickedHorse !== "" && winner && winner !== "") {
      totalBets++;
      if (pickedHorse === winner) {
        wins++;
        totalReturns += odds;
      }
    }
  });

  const roi = totalBets ? ((totalReturns - totalBets) / totalBets) * 100 : 0;

  return {
    roi,
    wins,
    total: totalBets,
    totalReturns,
    totalBets,
  };
}
