import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { horseNameToKey } from "@/lib/racing/scores/funcs";
import { avg, countCommentSentimentObj } from "@/lib/utils";
import { Meeting as MeetingType, Race as RaceType } from "@/types/raceday";
import { RaceResults } from "@/types/racing";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { normalizeTime } from "../horse/DayPredictions";
import { getHorsePosition, getTrophy } from "../horse/rows/HorseNameRow";
import { getWarningMessage, Horse, horseHasRequiredStats } from "./Horse";

interface RaceProps {
  race: RaceType;
  meeting: MeetingType;
  results: RaceResults | undefined;
  showInfo: boolean;
  date: string;
  missingLenThreshold: number;
}

export const getRaceToShowStats = (race: RaceType) => {
  const raceAvgScore = avg(
    race.horses
      ?.map((horse) => horse.scoreObj?.total || 0)
      .sort((a, b) => b - a),
  );

  const maxScore = 90;
  const horsesInRace = race.horses.length;
  const horsesInRaceWithForms = race.horses.filter(
    (horse) =>
      Boolean(horse.or) &&
      Boolean(horse.form?.map((x) => x.or).some((x) => Boolean(x))),
  ).length;
  const ratioWithForms = horsesInRaceWithForms / horsesInRace;
  const ratioWithFormsGood = ratioWithForms >= 0.66;

  const scoreToBeBetterThan = 80;

  const horsesInRaceAbove3YearsOld = race.horses.filter(
    (horse) => horse.age > 3,
  ).length;
  const ratioWithHorsesAbove3YearsOld =
    horsesInRaceAbove3YearsOld / horsesInRace;
  const ratioWithHorsesAbove3YearsOldGood = ratioWithHorsesAbove3YearsOld > 0.8;

  return {
    raceAvgScore,
    maxScore,
    horsesInRace,
    horsesInRaceWithForms,
    ratioWithHorsesAbove3YearsOldGood,
    ratioWithForms,
    ratioWithFormsGood,
    scoreToBeBetterThan,
  };
};

export function Race({
  race,
  meeting,
  results,
  showInfo,
  date,
  missingLenThreshold,
}: RaceProps) {
  // Calculate

  const {
    raceAvgScore,
    ratioWithFormsGood,
    ratioWithHorsesAbove3YearsOldGood,
  } = getRaceToShowStats(race);

  // const betterThanLowLevel = 7;
  // const maxScoreThreshold = maxScore * 0.8;
  // const scoreToBeBetterThan =
  //   maxScoreThreshold && maxScore > betterThanLowLevel
  //     ? maxScoreThreshold < betterThanLowLevel
  //       ? betterThanLowLevel
  //       : maxScoreThreshold
  //     : betterThanLowLevel;
  // Example of checking if race has finished:
  const raceHasFinsihed =
    date === new Date().toISOString().split("T")[0] &&
    new Date(
      `${date} ${normalizeTime(race.time).split(":").join(":")}`,
    ).getTime() < new Date().getTime();

  const [showAll, setShowAll] = useState(false);

  const filteredHorses = useMemo(() => {
    if (showAll) return race.horses;
    return race.horses.filter((horse) => {
      // console.log(
      //   "filteredHorses horseHasRequiredStats log 1",
      //   race
      // );
      const gapToAvgScore = (horse.scoreObj?.total || 0) - raceAvgScore;
      const requiredStatsGood = horseHasRequiredStats(horse, race);
      const missingStats = !requiredStatsGood
        ? getWarningMessage(horse, race).missingStats
        : [];

      const missingLen = missingStats.length;

      return showInfo
        ? !raceHasFinsihed && missingLen <= missingLenThreshold
        : missingLen <= missingLenThreshold; // && gapToAvgScore >= 0;
    });
  }, [
    showAll,
    race,
    raceAvgScore,
    showInfo,
    raceHasFinsihed,
    missingLenThreshold,
  ]);

  const placeTerms =
    race.horses.length < 5
      ? 1
      : race.horses.length < 8
        ? 2
        : race.horses.length < 12
          ? 3
          : race.horses.length < 20
            ? 4
            : 5;

  const raceHasPredictions =
    race?.predictions && Object.values(race?.predictions || {}).length > 0;

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={race.id}>
        <AccordionTrigger className="">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-blue-400">
                {raceHasFinsihed ? "🏁" : ""} {race.time}{" "}
                {raceAvgScore.toFixed(1)}
                {placeTerms ? ` 👥${placeTerms}` : ""}
                {raceHasPredictions ? ` rp` : ""}
                {!ratioWithHorsesAbove3YearsOldGood ? ` !3y` : ""}
                {!ratioWithFormsGood ? ` !F#` : ""}
              </span>
              <div className="flex flex-wrap gap-2">
                {race.horses
                  // ?.filter(
                  //   (horse) =>
                  //     horse.oddsDecimal >= 20 &&
                  //     (horse.scoreObj?.total || 0) >= 10
                  // )
                  .filter((horse) => {
                    // console.log(
                    //   "filteredHorses horseHasRequiredStats log 1",
                    //   race
                    // );
                    const gapToAvgScore =
                      (horse.scoreObj?.total || 0) - raceAvgScore;
                    const requiredStatsGood = horseHasRequiredStats(
                      horse,
                      race,
                    );
                    const missingStats = !requiredStatsGood
                      ? getWarningMessage(horse, race).missingStats
                      : [];

                    const missingLen = missingStats.length;

                    return showInfo
                      ? !raceHasFinsihed && missingLen <= missingLenThreshold
                      : missingLen <= missingLenThreshold; // && gapToAvgScore >= 0;
                  })
                  ?.map((horse, index) => {
                    const gapToAvgScore =
                      (horse.scoreObj?.total || 0) - raceAvgScore;

                    const horsePos = getHorsePosition(
                      horse.name,
                      results,
                      race.time,
                    );
                    const horseTrophy = getTrophy(horsePos);

                    const anyFormsHaveEyecatcher = horse.form?.some(
                      (form) =>
                        form.commentMatchedTerms?.eyecatcher?.length > 0,
                    );

                    const lastRaceWasHampered =
                      horse?.mostRecentForm &&
                      horse?.mostRecentForm?.commentMatchedTerms?.hampered
                        ?.length > 0;

                    const lastRaceScore =
                      horse?.mostRecentForm &&
                      countCommentSentimentObj(
                        horse?.mostRecentForm?.commentMatchedTerms,
                      ).score;

                    const lastRaceWasExcellent =
                      lastRaceScore !== undefined && lastRaceScore >= 3;

                    // const averageCommentScoreLast3 =
                    //   horse?.form &&
                    //   horse?.form
                    //     ?.slice(0, 3)
                    //     .map((form) => form.commentMatchedTerms)
                    //     .map((commentMatchedTerms) =>
                    //       countCommentSentimentObj(commentMatchedTerms)
                    //     )
                    //     .reduce((acc, curr) => acc + curr.score, 0) / 3;

                    //console.log(
                    //  "filteredHorses horseHasRequiredStats log 3",
                    //  race
                    //);
                    const horseHasRequiredStatsGood = horseHasRequiredStats(
                      horse,
                      race,
                    );

                    const missingStats = !horseHasRequiredStatsGood
                      ? getWarningMessage(horse, race).missingStats
                      : [];
                    const missingOnlyFew =
                      missingStats.length <= missingLenThreshold;
                    const missingNoStats = missingStats.length === 0;

                    const rpPredictions = Object.values(
                      race?.predictions || {},
                    )?.find(
                      (prediction) =>
                        horseNameToKey(prediction.name) ===
                        horseNameToKey(horse.name),
                    );
                    const rpPredictionScore = rpPredictions?.score;

                    return (
                      <span
                        key={horse.id + index}
                        className="flex items-center gap-1"
                      >
                        <span
                          className={twMerge(
                            `px-2 py-1 text-sm  rounded-full ${
                              ratioWithFormsGood &&
                              ratioWithHorsesAbove3YearsOldGood
                                ? missingNoStats
                                  ? "bg-green-700 text-black"
                                  : missingOnlyFew
                                    ? "bg-[#ae7100] text-black"
                                    : "bg-blue-900"
                                : missingNoStats
                                  ? "bg-red-900"
                                  : "bg-red-900 opacity-40"
                            } ${
                              horse.oddsDecimal >= 20
                                ? "border-4 border-yellow-300"
                                : horse.oddsDecimal >= 10
                                  ? "border-4 border-gray-300"
                                  : ""
                            }`,
                          )}
                          title={`${horse.name} ${horse.scoreObj?.total}`}
                        >
                          {horse.name} {horse.scoreObj?.total?.toFixed(1)} (
                          {gapToAvgScore > 0 ? "+" : ""}
                          {gapToAvgScore.toFixed(1)}){" "}
                          {horse.oddsDecimal > 0 ? horse.oddsDecimal : ""}{" "}
                          <span
                            className={twMerge(
                              lastRaceScore !== undefined && lastRaceScore >= 0
                                ? "text-[rgb(105,255,100)]"
                                : "text-red-400",
                            )}
                          >
                            {lastRaceScore !== undefined
                              ? lastRaceScore
                                ? lastRaceScore?.toFixed(2)
                                : 0
                              : "--"}
                          </span>
                          <span>
                            {rpPredictionScore !== undefined
                              ? rpPredictionScore?.toFixed(2)
                              : "--"}
                          </span>{" "}
                          {lastRaceWasHampered ? "⚠️" : ""}
                          {lastRaceWasExcellent ? "👑" : ""}
                          {anyFormsHaveEyecatcher ? "⭐" : ""}{" "}
                        </span>
                        {horseTrophy}
                      </span>
                    );
                  })}
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="mb-4">
            <table className="text-sm">
              <thead>
                <tr>
                  <td className="px-4 py-2 bg-gray-800" colSpan={3}>
                    About Race
                  </td>
                  <td className="px-4 py-2" colSpan={1}>
                    Horses
                  </td>
                  <td className="px-4 py-2 " colSpan={2}>
                    Beaten
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 bg-gray-800">Distance</td>
                  <td className="px-4 py-2 bg-gray-800">Going</td>
                  <td className="px-4 py-2 bg-gray-800">Type</td>
                  <td className="px-4 py-2">TPF</td>
                  <td className="px-4 py-2 ">B Avg (Avg)</td>
                  <td className="px-4 py-2 ">B Avg (Max)</td>
                  <td className="px-4 py-2 ">B Max (Avg)</td>
                  <td className="px-4 py-2 ">B Max (Max)</td>
                  <td className="px-4 py-2 ">RF Avgs (Avg)</td>
                  <td className="px-4 py-2 ">RF Avgs (Max)</td>
                  <td className="px-4 py-2 ">RF Max (Avg)</td>
                  <td className="px-4 py-2 ">RF Max (Max)</td>
                </tr>
              </thead>
              <tbody>
                <tr className="">
                  <td className="px-4 py-2 bg-gray-800">
                    {race.distanceF?.toFixed(2)}F
                  </td>
                  <td className="px-4 py-2 bg-gray-800 ">
                    {race.goingCodes.join(", ")}
                  </td>
                  <td className="px-4 py-2 bg-gray-800">{race.raceTypeCode}</td>

                  <td className="px-4 py-2">
                    {race.horsesInfo.min.race_min_timePerFurlong.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 ">
                    {race.horsesInfo.averages.race_averages_racedAgainst_Beaten_Averages.toFixed(
                      2,
                    )}
                  </td>
                  <td className="px-4 py-2 ">
                    {race.horsesInfo.maxes.race_averages_racedAgainst_Beaten_Averages.toFixed(
                      2,
                    )}
                  </td>

                  <td className="px-4 py-2 ">
                    {race.horsesInfo.averages.race_maxes_racedAgainst_Beaten_Averages.toFixed(
                      2,
                    )}
                  </td>

                  <td className="px-4 py-2 ">
                    {race.horsesInfo.maxes.race_maxes_racedAgainst_Beaten_Averages.toFixed(
                      2,
                    )}
                  </td>

                  <td className="px-4 py-2 ">
                    {race.horsesInfo.averages.race_mostRecentForm_racedAgainst_Beaten_Averages.toFixed(
                      2,
                    )}
                  </td>
                  <td className="px-4 py-2 ">
                    {race.horsesInfo.maxes.race_mostRecentForm_racedAgainst_Beaten_Averages.toFixed(
                      2,
                    )}
                  </td>

                  <td className="px-4 py-2 ">
                    {race.horsesInfo.averages.race_mostRecentForm_racedAgainst_Beaten_Maxes.toFixed(
                      2,
                    )}
                  </td>
                  <td className="px-4 py-2 ">
                    {race.horsesInfo.maxes.race_mostRecentForm_racedAgainst_Beaten_Maxes.toFixed(
                      2,
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Horses */}
          <div className="space-y-2">
            {race.predictions ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.values(race.predictions)
                  .sort((a, b) => b.score - a.score)
                  .map((prediction) => (
                    <div
                      key={prediction.id}
                      className="px-3 py-1 bg-gray-800 rounded-full text-sm flex items-center gap-2"
                    >
                      <span className="font-medium">{prediction.name}</span>
                      <span className="text-primary">
                        {prediction.score.toFixed(1)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <>No predictions available</>
            )}
            {race.raceExtraInfo?.verdict.comment && (
              <div className="bt-4 text-sm text-gray-300">
                <p className="mb-2">{race.raceExtraInfo.verdict.comment}</p>
                {race.raceExtraInfo.verdict.allNamed.length > 0 && (
                  <div className="text-xs text-gray-400">
                    Mentioned: {race.raceExtraInfo.verdict.allNamed.join(", ")}
                  </div>
                )}
              </div>
            )}
            <>
              <div className="mb-4">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-4 py-2 text-sm bg-blue-900 rounded hover:bg-blue-800"
                >
                  {showAll ? "Show Scored Only" : "Show All"}
                </button>
              </div>
              {filteredHorses.map((horse) => (
                <Horse
                  key={horse.id}
                  horse={horse}
                  race={race}
                  meeting={meeting}
                  results={results}
                />
              ))}
            </>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
