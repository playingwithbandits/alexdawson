import {
  DayTips,
  GytoTip,
  Meeting,
  NapsTableTip,
  Race,
  RaceResults,
} from "@/types/racing";
import { normalizeTime } from "../DayPredictions";
import { cleanName } from "@/app/rp/utils/fetchRaceAccordion";

interface PicksRaceRowProps {
  isTodayOrPast: boolean;
  index: number;
  race: Race;
  meeting: Meeting;

  results: RaceResults | undefined;
  tips: DayTips | null;
  gytoTips: GytoTip[] | undefined;
  napsTableTips: NapsTableTip[] | undefined;
}

export function PicksRaceRow({
  isTodayOrPast,
  index,
  race,
  meeting,
  results,
  tips,
  gytoTips,
  napsTableTips,
}: PicksRaceRowProps) {
  console.log("CompactRaceRow", {
    isTodayOrPast,
    index,
    race,
    meeting,
    results,
    tips,
    gytoTips,
    napsTableTips,
  });

  const topPercentage = race?.horses?.sort(
    (a, b) =>
      (b.score?.total?.percentage || 0) - (a.score?.total?.percentage || 0)
  )?.[0]?.score?.total?.percentage;
  const fivePercentOffTop = topPercentage ? topPercentage * 0.9 : 100;

  const aiTopPicks = race?.horses?.filter(
    (x) =>
      x.score?.total?.percentage &&
      x.score?.total?.percentage >= fivePercentOffTop &&
      x.score?.total?.percentage >= 45
  );

  const rpPredictions = Object.values(race.predictions || {}).sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  const topRpPredictions = rpPredictions?.filter(
    (x) => x.score && x.score >= 90
  );

  const rpVerdictPick = race.raceExtraInfo?.verdict?.selection;

  // Get ATR tip for this race
  //console.log("Getting ATR tip");
  const atrTipSelections = tips?.atrTips
    ?.flatMap((m) => m.races)
    ?.find(
      (r) => normalizeTime(r.time) === normalizeTime(race.time)
    )?.selections;

  const timeformTipSelections = tips?.timeformTips
    ?.flatMap((m) => m.races)
    ?.find(
      (r) => normalizeTime(r.time) === normalizeTime(race.time)
    )?.selections;

  const gytoTipSelectionObj = gytoTips?.find(
    (r) => normalizeTime(r.time) === normalizeTime(race.time)
  );

  const napsTableTipSelections = napsTableTips?.filter(
    (r) => normalizeTime(r.time) === normalizeTime(race.time)
  );
  //?.filter((x) => x.score && parseFloat(x.score) > -15);
  //console.log("Naps Table tip selections:", napsTableTipSelections);

  const napsTableTipSelectionsScoreSorted = napsTableTipSelections?.sort(
    (a, b) => (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0)
  );

  // Combine all horse names from different sources:
  // - AI top picks based on percentage threshold
  // - Racing Post predictions
  // - Racing Post verdict selection
  // - ATR tips
  // - Timeform tips
  // - GYTO tips
  // - Naps table tips (sorted by score)
  // Filter out any empty strings or undefined values
  const allNames: string[] = [
    ...aiTopPicks?.map((x) => x.name),
    ...topRpPredictions?.map((x) => x.name),
    rpVerdictPick ? rpVerdictPick : "",
    ...(atrTipSelections?.map((x) => x.horse) || []),
    ...(timeformTipSelections?.map((x) => x.horse) || []),
    gytoTipSelectionObj ? gytoTipSelectionObj.horse : "",
    ...(napsTableTipSelectionsScoreSorted?.map((x) => x.horse) || []),
  ].filter((x) => x !== "" && x !== undefined);

  console.log(
    "All horse names:",
    {
      "1": aiTopPicks?.map((x) => x.name),
      "2": topRpPredictions?.map((x) => x.name),
      "3": rpVerdictPick ? rpVerdictPick : "",
      "4": atrTipSelections?.map((x) => x.horse) || [],
      "5": timeformTipSelections?.map((x) => x.horse) || [],
      "6": gytoTipSelectionObj ? gytoTipSelectionObj.horse : "",
      "7": napsTableTipSelectionsScoreSorted?.map((x) => x.horse) || [],
    },
    allNames
  );

  // Create weighted scores for each source
  const weightedScores = [
    ...(aiTopPicks?.map(
      (x, i) => [x.name, 0.5 / Math.pow(2, i)] as [string, number]
    ) || []),
    ...(topRpPredictions?.map(
      (x, i) => [x.name, 0.5 / Math.pow(2, i)] as [string, number]
    ) || []),
    ...(rpVerdictPick ? [[rpVerdictPick, 0.5]] : []),
    ...(atrTipSelections?.map(
      (x, i) => [x.horse, 0.5 / Math.pow(2, i)] as [string, number]
    ) || []),
    ...(timeformTipSelections?.map(
      (x, i) => [x.horse, 0.5 / Math.pow(2, i)] as [string, number]
    ) || []),
    ...(gytoTipSelectionObj ? [[gytoTipSelectionObj.horse, 0.5]] : []),
    ...(napsTableTipSelectionsScoreSorted?.map(
      (x, i) => [x.horse, 0.5 / Math.pow(2, i)] as [string, number]
    ) || []),
  ];

  const nameCounts = weightedScores
    .reduce<[string, number][]>((acc, [name, score]) => {
      const existing = acc.find(
        ([existingName]) =>
          cleanName(existingName as string) === cleanName(name as string)
      ) as [string, number] | undefined;
      if (existing) {
        existing[1] += Number(score);
      } else {
        acc.push([name as string, Number(score)]);
      }
      return acc;
    }, [])
    .sort((a, b) => b[1] - a[1]);

  const totalWeightedScore = weightedScores.reduce(
    (acc, [, score]) => acc + Number(score),
    0
  );

  const nameCountsWithPerc: [string, number, number][] = nameCounts?.map(
    ([name, count]) => [
      name,
      count,
      Math.round((count / totalWeightedScore) * 100),
    ]
  );

  console.log(
    "Name counts with perc:",
    nameCountsWithPerc,
    nameCounts,
    weightedScores
  );

  return (
    <div
      className={`flex justify-between p-1 rounded ${
        index % 2 === 0 ? "bg-[#222440]" : ""
      }`}
    >
      <div className="flex gap-[0.1rem] w-20 items-center">
        <span className="font-semibold w-8 text-xs">{race.time}</span>
      </div>

      <div
        className={`w-full flex-1 grid ${"grid-cols-1"} gap-2 items-baseline text-sm`}
      >
        {/* <div className="flex flex-col gap-2">
          {aiTopPicks?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x.name}
              results={results}
              time={race.time}
              odds={
                race.bettingForecast?.find(
                  (y) => cleanName(y.horseName) === cleanName(x.name)
                )?.decimalOdds || 0
              }
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {topRpPredictions?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x.name}
              results={results}
              time={race.time}
              odds={
                race.bettingForecast?.find(
                  (y) => cleanName(y.horseName) === cleanName(x.name)
                )?.decimalOdds || 0
              }
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {[rpVerdictPick]?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x || ""}
              results={results}
              time={race.time}
              odds={
                race.bettingForecast?.find(
                  (y) => cleanName(y.horseName) === cleanName(x || "")
                )?.decimalOdds || 0
              }
              extraText={rpVerdictPickIsNap ? " (NAP)" : ""}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {atrTipSelections?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x.horse || ""}
              results={results}
              time={race.time}
              odds={
                race.bettingForecast?.find(
                  (y) => cleanName(y.horseName) === cleanName(x.horse || "")
                )?.decimalOdds || 0
              }
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {timeformTipSelections?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x.horse || ""}
              results={results}
              time={race.time}
              odds={
                race.bettingForecast?.find(
                  (y) => cleanName(y.horseName) === cleanName(x.horse || "")
                )?.decimalOdds || 0
              }
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {[gytoTipSelectionObj]?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x?.horse || ""}
              results={results}
              time={race.time}
              odds={
                race.bettingForecast?.find(
                  (y) => cleanName(y.horseName) === cleanName(x?.horse || "")
                )?.decimalOdds || 0
              }
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {napsTableTipSelectionsScoreSorted?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x.horse || ""}
              results={results}
              time={race.time}
              odds={
                race.bettingForecast?.find(
                  (y) => cleanName(y.horseName) === cleanName(x.horse || "")
                )?.decimalOdds || 0
              }
            />
          ))}
        </div> */}
        <div className="flex flex-col gap-2">
          {nameCountsWithPerc?.map((x, x_i) => {
            const odds =
              race.bettingForecast?.find(
                (y) => cleanName(y.horseName) === cleanName(x[0] || "")
              )?.decimalOdds || 0;
            return (
              <HorseNameRow
                key={race.time + x_i}
                horseName={x[0] || ""}
                results={results}
                time={race.time}
                odds={odds}
                extraText={x[1].toFixed(2) + " (" + x[2] + "%)"}
                highlight={x[2] >= 50}
                greyedOut={x[1] < 1}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

const getTrophy = (position: string) => {
  switch (position.toLowerCase()) {
    case "1st":
      return "🏆";
    case "2nd":
      return "🥈";
    case "3rd":
      return "🥉";
    default:
      return "";
  }
};

const getHorsePosition = (
  horseName: string,
  results: RaceResults | undefined,
  time: string
) => {
  console.log("Getting position for horse:", horseName);
  const raceResult = results?.results.find(
    (r) => normalizeTime(r.time) === normalizeTime(time)
  );

  if (!raceResult) return "";

  if (cleanName(raceResult.winner.name) === cleanName(horseName)) {
    console.log("Horse was winner");
    return "1st";
  }

  const placed = raceResult.placedHorses.find(
    (h) => cleanName(h.name) === cleanName(horseName)
  );
  console.log("Horse placed:", placed?.position);
  return placed?.position || "";
};

function HorseNameRow({
  horseName,
  odds,
  results,
  time,
  highlight,
  extraText,
  greyedOut,
}: {
  horseName: string;
  results: RaceResults | undefined;
  time: string;
  odds: number;
  highlight?: boolean;
  extraText?: string;
  greyedOut?: boolean;
}) {
  return (
    <span
      className={`flex items-center justify-between gap-2 ${
        highlight ? "text-yellow-400 font-bold" : ""
      } ${greyedOut ? "text-gray-500" : ""}`}
    >
      <span>
        {getTrophy(getHorsePosition(horseName, results, time))}
        {horseName}
      </span>
      <span className="flex gap-2">
        <span>{extraText}</span>
        <span>{odds}</span>
      </span>
    </span>
  );
}
