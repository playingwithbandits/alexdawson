import {
  DayTips,
  GytoTip,
  Meeting,
  NapsTableTip,
  Race,
  RaceResults,
  LiveOdds,
  RtWebTip,
  OLBGTip,
} from "@/types/racing";
import { normalizeTime } from "../DayPredictions";
import { cleanName } from "@/app/rp/utils/fetchRaceAccordion";
import { horseNameToKey } from "@/lib/racing/scores/funcs";
import { HorseNameRow } from "./HorseNameRow";

interface PicksRaceRowProps {
  isTodayOrPast: boolean;
  index: number;
  race: Race;
  meeting: Meeting;
  results: RaceResults | undefined;
  tips: DayTips | null;
  gytoTips: GytoTip[] | undefined;
  napsTableTips: NapsTableTip[] | undefined;
  isNonRunner: (time: string, selection: string) => boolean;
  liveOdds: LiveOdds[];
  rtWebTips: RtWebTip[] | undefined;
  olbgTips: OLBGTip[] | undefined;
  showOnlyBest: boolean;
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
  isNonRunner,
  rtWebTips,
  olbgTips,
  showOnlyBest,
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
    rtWebTips,
    olbgTips,
  });

  const olbgTipsForRace = olbgTips?.filter((tip) => {
    const tipHorseKey = horseNameToKey(tip.horseName);
    return race.horses.some(
      (horse) => horseNameToKey(horse.name) === tipHorseKey
    );
  });

  const olbgTipsWithNap = olbgTipsForRace?.filter((x) => x.napTips > 0);
  const olbgTipsWithEw = olbgTipsForRace?.filter((x) => x.ewTips > 0);
  const olbgTipsWithWin = olbgTipsForRace?.filter((x) => x.winTips > 0);
  const olbgTipsWithExpert = olbgTipsForRace?.filter((x) => x.expertCount > 0);
  const olbgTipsWithComment = olbgTipsForRace?.filter(
    (x) => x.commentCount > 0
  );

  console.log(
    "OLBG Tips for Race:",
    olbgTips,
    olbgTipsForRace,
    olbgTipsWithNap,
    olbgTipsWithEw,
    olbgTipsWithWin,
    olbgTipsWithExpert,
    olbgTipsWithComment
  );

  const topAiPercentage = race?.horses?.sort(
    (a, b) =>
      (b.score?.total?.percentage || 0) - (a.score?.total?.percentage || 0)
  )?.[0]?.score?.total?.percentage;
  //const fivePercentOffTop = topPercentage ? topPercentage * 0.95 : 100;

  const aiTopPicks = race?.horses?.filter((x) => x.score?.total?.percentage);
  // .filter(
  //   (x) => x.score?.total?.percentage && x.score?.total?.percentage >= 50
  // );
  const worseAiPercentageScore = Math.min(
    ...race?.horses
      ?.filter((x) => x.score?.total?.percentage)
      ?.map((x) => x.score?.total?.percentage || 0)
  );

  const rpPredictions = Object.values(race.predictions || {}).sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );
  //?.filter((x) => x.score && x.score >= 90);

  const worseRpPredictionScore = Math.min(
    ...(Object.values(race.predictions || {})?.map((x) => x.score || 0) || [])
  );

  const rpVerdictPick = race.raceExtraInfo?.verdict?.selection;
  const rpVerdictPickIsNap = race.raceExtraInfo?.verdict?.isNap;
  const rpVerdictAllNamed = race.raceExtraInfo?.verdict?.allNamed;
  const rpVerdictAllOthers = rpVerdictAllNamed?.filter((x) =>
    rpVerdictPick ? horseNameToKey(x) !== horseNameToKey(rpVerdictPick) : true
  );

  // console.log(
  //   "RP Verdict All Named:",
  //   rpVerdictPick,
  //   rpVerdictAllNamed,
  //   rpVerdictAllOthers
  // );
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
  const gytoTipSelectionIsNap = gytoTipSelectionObj?.isNap;
  console.log("GYTO Tip Selection:", gytoTipSelectionObj);

  const napsTableTipSelections = napsTableTips?.filter(
    (r) => normalizeTime(r.time) === normalizeTime(race.time)
  );
  //?.filter((x) => x.score && parseFloat(x.score) > -15);
  //console.log("Naps Table tip selections:", napsTableTipSelections);

  const napsTableTipSelectionsScoreSorted = napsTableTipSelections?.sort(
    (a, b) => (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0)
  );

  const rtWebTipSelections = rtWebTips?.filter(
    (r) => normalizeTime(r.time) === normalizeTime(race.time)
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
    ...rpPredictions?.map((x) => x.name),
    rpVerdictPick ? rpVerdictPick : "",
    ...(rpVerdictAllOthers || []),
    ...(atrTipSelections?.map((x) => x.horse) || []),
    ...(timeformTipSelections?.map((x) => x.horse) || []),
    gytoTipSelectionObj ? gytoTipSelectionObj.horse : "--",
    ...(napsTableTipSelectionsScoreSorted?.map((x) => x.horse) || []),
    ...(rtWebTipSelections?.map((x) => x.horseName) || []),
    ...(olbgTipsWithNap?.map((x) => x.horseName) || []),
    ...(olbgTipsWithEw?.map((x) => x.horseName) || []),
    ...(olbgTipsWithWin?.map((x) => x.horseName) || []),
    ...(olbgTipsWithExpert?.map((x) => x.horseName) || []),
    ...(olbgTipsWithComment?.map((x) => x.horseName) || []),
  ].filter((x) => x !== "" && x !== undefined && x !== "--");

  console.log(
    "All horse names:",
    {
      "1": aiTopPicks?.map((x) => x.name),
      "2": rpPredictions?.map((x) => x.name),
      "3": rpVerdictPick ? rpVerdictPick : "",
      "4": atrTipSelections?.map((x) => x.horse) || [],
      "5": timeformTipSelections?.map((x) => x.horse) || [],
      "6": gytoTipSelectionObj ? gytoTipSelectionObj.horse : "",
      "7": napsTableTipSelectionsScoreSorted?.map((x) => x.horse) || [],
      "8": rpVerdictAllOthers || [],
      "9": rtWebTipSelections?.map((x) => x.horseName) || [],
      "10": olbgTipsWithNap?.map((x) => x.horseName) || [],
      "11": olbgTipsWithEw?.map((x) => x.horseName) || [],
      "12": olbgTipsWithWin?.map((x) => x.horseName) || [],
      "13": olbgTipsWithExpert?.map((x) => x.horseName) || [],
      "14": olbgTipsWithComment?.map((x) => x.horseName) || [],
    },
    race.time,
    gytoTips,
    allNames
  );

  const aiTopPicksWeighted =
    aiTopPicks?.map((x) => {
      const scorePercentage =
        ((x.score?.total?.percentage || 0) - worseAiPercentageScore) /
        ((topAiPercentage || 100) - worseAiPercentageScore);
      return [x.name, 1 * scorePercentage] as [string, number];
    }) || [];

  const rpPredictionsWeighted =
    rpPredictions?.map((x) => {
      // const scorePercentage =
      //   ((x.score || 0) - worseRpPredictionScore) / rpPredictionScoreGap;

      const scorePercentage =
        (x.score - worseRpPredictionScore || 0) /
        (100 - worseRpPredictionScore);
      return [x.name, 1 * scorePercentage] as [string, number];
    }) || [];

  console.log("AI Predictions Weighted:", aiTopPicksWeighted);

  // Create weighted scores for each source
  const rpVerdictWeighted: [string, number] = rpVerdictPick
    ? [rpVerdictPick, rpVerdictPickIsNap ? 1 : 0.75]
    : ["", 0];

  const rpVerdictOthersWeighted =
    rpVerdictAllOthers?.map((x) => [x, 0.25] as [string, number]) || [];

  const atrTipsWeighted =
    atrTipSelections?.map(
      (x, i) => [x.horse, 0.75 / Math.pow(2, i)] as [string, number]
    ) || [];

  const timeformTipsWeighted =
    timeformTipSelections?.map(
      (x, i) => [x.horse, 0.75 / Math.pow(2, i)] as [string, number]
    ) || [];

  const gytoTipWeighted: [string, number] = gytoTipSelectionObj
    ? [gytoTipSelectionObj?.horse, gytoTipSelectionIsNap ? 1 : 0.75]
    : ["", 0];

  const napsTableWeighted =
    napsTableTipSelectionsScoreSorted?.map(
      (x) => [x.horse, parseFloat(x.score) > 0 ? 0.5 : 0.25] as [string, number]
    ) || [];

  const rtWebTipsWeighted =
    rtWebTipSelections?.map((x) => [x.horseName, 0.5] as [string, number]) ||
    [];

  const olbgNapTipsWeighted =
    olbgTipsWithNap?.map(
      (x) => [x.horseName, 0.2 * x.napTips] as [string, number]
    ) || [];

  const olbgEwTipsWeighted =
    olbgTipsWithEw?.map(
      (x) => [x.horseName, 0.075 * x.ewTips] as [string, number]
    ) || [];

  const olbgWinTipsWeighted =
    olbgTipsWithWin?.map(
      (x) => [x.horseName, 0.05 * x.winTips] as [string, number]
    ) || [];

  const olbgExpertTipsWeighted =
    olbgTipsWithExpert?.map(
      (x) => [x.horseName, 0.25 * x.expertCount] as [string, number]
    ) || [];

  const olbgCommentTipsWeighted =
    olbgTipsWithComment?.map(
      (x) => [x.horseName, 0.25 * x.commentCount] as [string, number]
    ) || [];

  const weightedScores = [
    ...aiTopPicksWeighted,
    ...rpPredictionsWeighted,
    ...[rpVerdictWeighted],
    ...rpVerdictOthersWeighted,
    ...atrTipsWeighted,
    ...timeformTipsWeighted,
    ...[gytoTipWeighted],
    ...napsTableWeighted,
    ...rtWebTipsWeighted,
    ...olbgNapTipsWeighted,
    ...olbgEwTipsWeighted,
    ...olbgWinTipsWeighted,
    ...olbgExpertTipsWeighted,
    ...olbgCommentTipsWeighted,
  ];

  const nameCounts = weightedScores
    .reduce<[string, number][]>((acc, [name, score]) => {
      if (name === "--" || name === "" || name === undefined) {
        return acc;
      }
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

  //const topScorePerc = Math.max(...nameCountsWithPerc?.map((x) => x[2]));
  //const topScorePerc20Perc = topScorePerc * 0.8;

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
        className={`w-full flex-1 grid ${"grid-cols-8"} gap-y-4 gap-x-2 items-baseline text-sm`}
      >
        <div className="flex flex-col gap-2">
          {aiTopPicks?.map((x, x_i) => {
            return (
              <HorseNameRow
                key={race.time + x_i}
                horseName={x.name}
                results={results}
                time={race.time}
                odds={aiTopPicksWeighted[x_i][1]}
                isNonRunner={isNonRunner(race.time, x.name)}
                title={
                  "AI Top Pick: " +
                  x.name +
                  " : " +
                  x.score?.total?.percentage?.toFixed(1) +
                  "%" +
                  " : " +
                  race?.raceExtraInfo?.comments[cleanName(x.name)]
                }
                showOnlyBest={showOnlyBest}
              />
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {rpPredictions?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x.name}
              results={results}
              time={race.time}
              odds={rpPredictionsWeighted[x_i][1]}
              isNonRunner={isNonRunner(race.time, x.name)}
              greyedOut={false}
              title={
                "RP Prediction: " +
                rpPredictions
                  ?.map((x) => x.name + " : " + x.score?.toFixed(1))
                  ?.join(", ") +
                " : " +
                race?.raceExtraInfo?.comments[cleanName(x.name)]
              }
              showOnlyBest={showOnlyBest}
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
              odds={rpVerdictWeighted[1]}
              extraText={rpVerdictPickIsNap ? " (NAP)" : ""}
              isNonRunner={isNonRunner(race.time, x || "")}
              greyedOut={false}
              title={
                "RP Verdict: " +
                race.raceExtraInfo?.verdict?.comment +
                " : " +
                race?.raceExtraInfo?.comments[cleanName(x || "")]
              }
              showOnlyBest={showOnlyBest}
            />
          ))}

          {rpVerdictAllOthers?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x || ""}
              results={results}
              time={race.time}
              odds={rpVerdictOthersWeighted[x_i][1]}
              isNonRunner={isNonRunner(race.time, x || "")}
              greyedOut={false}
              title={
                "RP Verdict: " +
                race.raceExtraInfo?.verdict?.comment +
                " : " +
                race?.raceExtraInfo?.comments[cleanName(x || "")]
              }
              showOnlyBest={showOnlyBest}
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
              odds={atrTipsWeighted[x_i][1]}
              isNonRunner={isNonRunner(race.time, x.horse || "")}
              greyedOut={false}
              title={
                "ATR Tip: " +
                x.comment +
                " : " +
                race?.raceExtraInfo?.comments[cleanName(x.horse || "")]
              }
              showOnlyBest={showOnlyBest}
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
              odds={timeformTipsWeighted[x_i][1]}
              isNonRunner={isNonRunner(race.time, x.horse || "")}
              greyedOut={false}
              title={
                "Timeform Tip: " +
                x.comment +
                " : " +
                race?.raceExtraInfo?.comments[cleanName(x.horse || "")]
              }
              showOnlyBest={showOnlyBest}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {[gytoTipSelectionObj]?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x?.horse || "--"}
              results={results}
              time={race.time}
              odds={gytoTipWeighted[1]}
              extraText={gytoTipSelectionIsNap ? " (NAP)" : ""}
              isNonRunner={isNonRunner(race.time, x?.horse || "")}
              greyedOut={false}
              title={
                "GYTO Tip: " +
                x?.horse +
                (x?.isNap ? " (NAP)" : "") +
                " : " +
                race?.raceExtraInfo?.comments[cleanName(x?.horse || "")]
              }
              showOnlyBest={showOnlyBest}
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
              odds={napsTableWeighted[x_i][1]}
              isNonRunner={isNonRunner(race.time, x.horse || "")}
              greyedOut={false}
              title={
                "Naps Table Tip: " +
                x.horse +
                " (Score: " +
                x.score +
                ", Tipster: " +
                x.tipster +
                ")" +
                " : " +
                race?.raceExtraInfo?.comments[cleanName(x.horse || "")]
              }
              showOnlyBest={showOnlyBest}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {rtWebTipSelections?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x.horseName || ""}
              results={results}
              time={race.time}
              odds={rtWebTipsWeighted[x_i][1]}
              isNonRunner={isNonRunner(race.time, x.horseName || "")}
              greyedOut={false}
              title={
                "RT Web Tip: " +
                x.horseName +
                " : " +
                race?.raceExtraInfo?.comments[cleanName(x.horseName || "")]
              }
              showOnlyBest={showOnlyBest}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {olbgTipsWithWin?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x.horseName || ""}
              results={results}
              time={race.time}
              odds={olbgWinTipsWeighted[x_i][1]}
              extraText={`${x.winTips}`}
              title={`Win: ${x.winTips}/${x.winTotal} : EW: ${x.ewTips}/${x.ewTotal} : NAP: ${x.napTips}/${x.napTotal} : Expert: ${x.expertCount} : Comment: ${x.commentCount}`}
              showOnlyBest={showOnlyBest}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {olbgTipsWithEw?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x.horseName || ""}
              results={results}
              time={race.time}
              odds={olbgEwTipsWeighted[x_i][1]}
              extraText={`${x.ewTips}`}
              title={`Win: ${x.winTips}/${x.winTotal} : EW: ${x.ewTips}/${x.ewTotal} : NAP: ${x.napTips}/${x.napTotal} : Expert: ${x.expertCount} : Comment: ${x.commentCount}`}
              showOnlyBest={showOnlyBest}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {olbgTipsWithNap?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x.horseName || ""}
              results={results}
              time={race.time}
              odds={olbgNapTipsWeighted[x_i][1]}
              extraText={`${x.napTips}`}
              title={`Win: ${x.winTips}/${x.winTotal} : EW: ${x.ewTips}/${x.ewTotal} : NAP: ${x.napTips}/${x.napTotal} : Expert: ${x.expertCount} : Comment: ${x.commentCount}`}
              showOnlyBest={showOnlyBest}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {olbgTipsWithExpert?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x.horseName || ""}
              results={results}
              time={race.time}
              odds={olbgExpertTipsWeighted[x_i][1]}
              extraText={`${x.expertCount}`}
              title={`Win: ${x.winTips}/${x.winTotal} : EW: ${x.ewTips}/${x.ewTotal} : NAP: ${x.napTips}/${x.napTotal} : Expert: ${x.expertCount} : Comment: ${x.commentCount}`}
              showOnlyBest={showOnlyBest}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {olbgTipsWithComment?.map((x, x_i) => (
            <HorseNameRow
              key={race.time + x_i}
              horseName={x.horseName || ""}
              results={results}
              time={race.time}
              odds={olbgCommentTipsWeighted[x_i][1]}
              extraText={`${x.commentCount}`}
              title={`Win: ${x.winTips}/${x.winTotal} : EW: ${x.ewTips}/${x.ewTotal} : NAP: ${x.napTips}/${x.napTotal} : Expert: ${x.expertCount} : Comment: ${x.commentCount} : ${x.comment}`}
              showOnlyBest={showOnlyBest}
            />
          ))}
        </div>
        <div className="flex flex-col col-span-2 gap-2">
          {nameCountsWithPerc?.map(([name, count, perc], x_i) => {
            const odds =
              race.bettingForecast?.find(
                (y) => cleanName(y.horseName) === cleanName(name)
              )?.decimalOdds || 0;

            const decimalOdds = 100 / (perc || 0.1);

            const scoreSummary =
              "Name: " +
              name +
              " : Count: " +
              count.toFixed(2) +
              " : Perc: " +
              perc.toFixed(2) +
              "%" +
              " : Odds: " +
              decimalOdds.toFixed(2);

            const olbgSummary = `Win: ${
              olbgTipsWithWin?.find(
                (x) => cleanName(x.horseName) === cleanName(name)
              )?.winTips || 0
            }/${
              olbgTipsWithWin?.find(
                (x) => cleanName(x.horseName) === cleanName(name)
              )?.winTotal || 0
            } : EW: ${
              olbgTipsWithEw?.find(
                (x) => cleanName(x.horseName) === cleanName(name)
              )?.ewTips || 0
            }/${
              olbgTipsWithEw?.find(
                (x) => cleanName(x.horseName) === cleanName(name)
              )?.ewTotal || 0
            } : NAP: ${
              olbgTipsWithNap?.find(
                (x) => cleanName(x.horseName) === cleanName(name)
              )?.napTips || 0
            }/${
              olbgTipsWithNap?.find(
                (x) => cleanName(x.horseName) === cleanName(name)
              )?.napTotal || 0
            } : Expert: ${
              olbgTipsWithExpert?.find(
                (x) => cleanName(x.horseName) === cleanName(name)
              )?.expertCount || 0
            } : Comments: ${
              olbgTipsWithComment?.find(
                (x) => cleanName(x.horseName) === cleanName(name)
              )?.commentCount || 0
            }`;

            const olbgComment = olbgTipsWithComment
              ?.filter((x) => cleanName(x.horseName) === cleanName(name))
              ?.find(
                (x) => cleanName(x.horseName) === cleanName(name)
              )?.comment;

            const atrComment = atrTipSelections
              ?.filter((x) => cleanName(x.horse) === cleanName(name))
              ?.find((x) => cleanName(x.horse) === cleanName(name))?.comment;

            const timeformComment = timeformTipSelections
              ?.filter((x) => cleanName(x.horse) === cleanName(name))
              ?.find((x) => cleanName(x.horse) === cleanName(name))?.comment;

            const rpRaceComment = race?.raceExtraInfo?.verdict?.allNamed?.find(
              (x) => cleanName(x) === cleanName(name)
            )
              ? race?.raceExtraInfo?.verdict?.comment
              : undefined;

            const rpHorseComment =
              race?.raceExtraInfo?.comments[cleanName(name)];

            const aiSummary =
              (
                aiTopPicks?.find((x) => cleanName(x.name) === cleanName(name))
                  ?.score?.total?.percentage || 0
              ).toFixed(2) + "%";

            const paraGraph = [
              scoreSummary,
              aiSummary,
              olbgSummary
                ? `<span style='color: #666'>OLBG Summary:</span>\n` +
                  olbgSummary
                : undefined,
              olbgComment
                ? `<span style='color: #666'>OLBG Top Comment:</span>\n` +
                  olbgComment
                : undefined,
              atrComment
                ? `<span style='color: #666'>ATR Comment:</span>\n` + atrComment
                : undefined,
              timeformComment
                ? `<span style='color: #666'>Timeform Comment:</span>\n` +
                  timeformComment
                : undefined,
              rpRaceComment
                ? "<span style='color: #666'>RP Verdict:</span>\n" +
                  rpRaceComment
                : undefined,
              rpHorseComment
                ? "<span style='color: #666'>RP Comment:</span>\n" +
                  rpHorseComment
                : undefined,
            ]
              ?.filter((x) => x)
              .join("\n\n");
            return (
              <HorseNameRow
                key={race.time + x_i}
                horseName={name}
                results={results}
                time={race.time}
                odds={odds}
                extraText={`${count.toFixed(1)} : ${perc}%`}
                oddsHighlight={odds > 6 && count >= 3}
                isNonRunner={isNonRunner(race.time, name)}
                greyedOut={count < 2}
                title={paraGraph}
                highlight1={count >= 4}
                highlight2={
                  count >= 3 &&
                  olbgTipsWithComment
                    ?.filter((x) => x.napTips >= 1)
                    ?.some((x) => cleanName(x.horseName) === cleanName(name)) &&
                  (aiTopPicks?.find(
                    (x) => cleanName(x.name) === cleanName(name)
                  )?.score?.total?.percentage || 0) >= 40
                }
                showOnlyBest={showOnlyBest}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
