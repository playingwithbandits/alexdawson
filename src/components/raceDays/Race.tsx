import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Meeting as MeetingType, Race as RaceType } from "@/types/raceday";
import { RaceResults } from "@/types/racing";
import { getHorsePosition, getTrophy } from "../horse/rows/HorseNameRow";
import { normalizeTime } from "../horse/DayPredictions";
import { Horse, horseHasRequiredStats } from "./Horse";
import { twMerge } from "tailwind-merge";
import { avg, countCommentSentimentObj } from "@/lib/utils";
import { useMemo, useState } from "react";

interface RaceProps {
  race: RaceType;
  meeting: MeetingType;
  results: RaceResults | undefined;
  showInfo: boolean;
  date: string;
}

export const getRaceToShowStats = (race: RaceType) => {
  const raceAvgScore = avg(
    race.horses
      ?.map((horse) => horse.scoreObj?.total || 0)
      .sort((a, b) => b - a)
  );

  const maxScore = 90;
  const horsesInRace = race.horses.length;
  const horsesInRaceWithForms = race.horses.filter(
    (horse) => horse.form.length > 2
  ).length;
  const ratioWithForms = horsesInRaceWithForms / horsesInRace;
  const ratioWithFormsGood = ratioWithForms > 0.66;

  const scoreToBeBetterThan = 80;

  const horsesInRaceAbove2YearsOld = race.horses.filter(
    (horse) => horse.age > 2
  ).length;
  const ratioWithHorsesAbove2YearsOld =
    horsesInRaceAbove2YearsOld / horsesInRace;
  const ratioWithHorsesAbove2YearsOldGood = ratioWithHorsesAbove2YearsOld > 0.8;

  return {
    raceAvgScore,
    maxScore,
    horsesInRace,
    horsesInRaceWithForms,
    ratioWithHorsesAbove2YearsOldGood,
    ratioWithForms,
    ratioWithFormsGood,
    scoreToBeBetterThan,
  };
};

export function Race({ race, meeting, results, showInfo, date }: RaceProps) {
  // Calculate

  const {
    raceAvgScore,
    maxScore,
    ratioWithFormsGood,
    ratioWithHorsesAbove2YearsOldGood,
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
      `${date} ${normalizeTime(race.time).split(":").join(":")}`
    ).getTime() < new Date().getTime();

  const [showAll, setShowAll] = useState(false);

  const filteredHorses = useMemo(() => {
    if (showAll) return race.horses;
    return race.horses.filter((horse) => {
      const requiredStatsGood = horseHasRequiredStats(horse);
      return requiredStatsGood;
    });
  }, [race.horses, showAll]);

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
              </span>
              <div className="flex flex-wrap gap-2">
                {race.horses
                  // ?.filter(
                  //   (horse) =>
                  //     horse.oddsDecimal >= 20 &&
                  //     (horse.scoreObj?.total || 0) >= 10
                  // )
                  .filter((horse) => {
                    const requiredStatsGood = horseHasRequiredStats(horse);

                    return showInfo
                      ? !raceHasFinsihed &&
                          ratioWithFormsGood &&
                          ratioWithHorsesAbove2YearsOldGood &&
                          requiredStatsGood
                      : true;
                  })
                  ?.map((horse, index) => {
                    const gapToAvgScore =
                      (horse.scoreObj?.total || 0) - raceAvgScore;

                    const horsePos = getHorsePosition(
                      horse.name,
                      results,
                      race.time
                    );
                    const horseTrophy = getTrophy(horsePos);

                    const anyFormsHaveEyecatcher = horse.form?.some(
                      (form) => form.commentMatchedTerms?.eyecatcher?.length > 0
                    );

                    const lastRaceWasHampered =
                      horse?.mostRecentForm &&
                      horse?.mostRecentForm?.commentMatchedTerms?.hampered
                        ?.length > 0;

                    const countCommentSentiment =
                      horse?.mostRecentForm &&
                      countCommentSentimentObj(
                        horse?.mostRecentForm?.commentMatchedTerms
                      );

                    const anyFormsHaveExcellent = horse.form?.some((form) => {
                      const countCommentSentiment =
                        form &&
                        countCommentSentimentObj(form?.commentMatchedTerms);
                      return (
                        countCommentSentiment?.score !== undefined &&
                        countCommentSentiment?.score >= 3
                      );
                    });

                    const lastRaceWasBad =
                      countCommentSentiment?.score &&
                      countCommentSentiment?.score < 0;

                    const horseHasRequiredStatsGood =
                      horseHasRequiredStats(horse);
                    return (
                      <span
                        key={horse.id + index}
                        className="flex items-center gap-1"
                      >
                        <span
                          className={twMerge(
                            `px-2 py-1 text-sm  rounded-full ${
                              ratioWithFormsGood &&
                              ratioWithHorsesAbove2YearsOldGood
                                ? horseHasRequiredStatsGood &&
                                  gapToAvgScore >= 0
                                  ? "bg-green-700 text-black"
                                  : gapToAvgScore > 33
                                  ? "bg-blue-400 text-black"
                                  : "bg-blue-900"
                                : "bg-red-900 opacity-40"
                            } ${
                              horse.oddsDecimal >= 10
                                ? "border-2 border-gray-300"
                                : ""
                            }`
                          )}
                          title={`${horse.name} ${horse.scoreObj?.total}`}
                        >
                          {horse.name} {horse.scoreObj?.total?.toFixed(1)} (
                          {gapToAvgScore > 0 ? "+" : ""}
                          {gapToAvgScore.toFixed(1)}){" "}
                          {horse.oddsDecimal > 0 ? horse.oddsDecimal : ""}{" "}
                          {lastRaceWasHampered ? "⚠️" : ""}
                          {anyFormsHaveEyecatcher ? "⭐" : ""}
                          {anyFormsHaveExcellent ? "👑" : ""}
                          {lastRaceWasBad ? "❌" : ""}
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
                      2
                    )}
                  </td>
                  <td className="px-4 py-2 ">
                    {race.horsesInfo.maxes.race_averages_racedAgainst_Beaten_Averages.toFixed(
                      2
                    )}
                  </td>

                  <td className="px-4 py-2 ">
                    {race.horsesInfo.averages.race_maxes_racedAgainst_Beaten_Averages.toFixed(
                      2
                    )}
                  </td>

                  <td className="px-4 py-2 ">
                    {race.horsesInfo.maxes.race_maxes_racedAgainst_Beaten_Averages.toFixed(
                      2
                    )}
                  </td>

                  <td className="px-4 py-2 ">
                    {race.horsesInfo.averages.race_mostRecentForm_racedAgainst_Beaten_Averages.toFixed(
                      2
                    )}
                  </td>
                  <td className="px-4 py-2 ">
                    {race.horsesInfo.maxes.race_mostRecentForm_racedAgainst_Beaten_Averages.toFixed(
                      2
                    )}
                  </td>

                  <td className="px-4 py-2 ">
                    {race.horsesInfo.averages.race_mostRecentForm_racedAgainst_Beaten_Maxes.toFixed(
                      2
                    )}
                  </td>
                  <td className="px-4 py-2 ">
                    {race.horsesInfo.maxes.race_mostRecentForm_racedAgainst_Beaten_Maxes.toFixed(
                      2
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Horses */}
          <div className="space-y-2">
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
