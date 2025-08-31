import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Meeting as MeetingType, Race as RaceType } from "@/types/raceday";
import { RaceResults } from "@/types/racing";
import { Horse } from "./Horse";
import { getHorsePosition, getTrophy } from "../horse/rows/HorseNameRow";
import { normalizeTime } from "../horse/DayPredictions";

interface RaceProps {
  race: RaceType;
  meeting: MeetingType;
  results: RaceResults | undefined;
  showInfo: boolean;
  date: string;
}

export const getRaceToShowStats = (race: RaceType) => {
  const raceAvgScore =
    race.horses
      ?.map((horse) => horse.scoreObj?.total || 0)
      .sort((a, b) => b - a)
      .slice(1, 4)
      .reduce((acc, score) => acc + score, 0) / 3;

  const maxScore = 80;
  const horsesInRace = race.horses.length;
  const horsesInRaceWithForms = race.horses.filter(
    (horse) => horse.form.length > 2
  ).length;
  const ratioWithForms = horsesInRaceWithForms / horsesInRace;
  const ratioWithFormsGood = ratioWithForms > 0.66;

  const scoreToBeBetterThan = 75;

  return {
    raceAvgScore,
    maxScore,
    horsesInRace,
    horsesInRaceWithForms,
    ratioWithForms,
    ratioWithFormsGood,
    scoreToBeBetterThan,
  };
};

export function Race({ race, meeting, results, showInfo, date }: RaceProps) {
  // Calculate

  const { raceAvgScore, maxScore, ratioWithFormsGood, scoreToBeBetterThan } =
    getRaceToShowStats(race);

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

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={race.id}>
        <AccordionTrigger className="">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-blue-400">
                {raceHasFinsihed ? "🏁" : ""} {race.time}{" "}
                {raceAvgScore.toFixed(1)}
              </span>
              <div className="flex flex-wrap gap-2">
                {race.horses
                  // ?.filter(
                  //   (horse) =>
                  //     horse.oddsDecimal >= 20 &&
                  //     (horse.scoreObj?.total || 0) >= 10
                  // )
                  .filter((horse) => {
                    const totalScore = horse.scoreObj?.total ?? 0;
                    const gapToAvgScore = totalScore - raceAvgScore;
                    const scoreGood = totalScore >= scoreToBeBetterThan;

                    const racedRecently =
                      horse.scoreObj?.horseRacedWith?.lastRan;

                    const requiredStats = [
                      horse?.scoreObj?.horseRacedWith?.distance,
                      horse?.scoreObj?.horseRacedWith?.goingCode,

                      horse?.scoreObj?.horseBetterThanRaceTheshold
                        ?.handicapped_averages_racedAgainst_Beaten_Averages_rpr,
                      horse?.scoreObj?.horseBetterThanRaceTheshold
                        ?.handicapped_averages_racedAgainst_Beaten_rpr,
                      horse?.scoreObj?.horseBetterThanRaceTheshold
                        ?.handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr,
                    ];

                    const requiredStatsGood = requiredStats.every(
                      (stat) => stat
                    );

                    const oddsGood =
                      horse.oddsDecimal >= 25 &&
                      totalScore >= 50 &&
                      gapToAvgScore > 5;

                    const neededOkay = [scoreGood, oddsGood].some(
                      (value) => value
                    );

                    return showInfo
                      ? !raceHasFinsihed &&
                          ratioWithFormsGood &&
                          racedRecently &&
                          neededOkay &&
                          requiredStatsGood
                      : racedRecently && neededOkay;
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

                    return (
                      <span
                        key={horse.id + index}
                        className="flex items-center gap-1"
                      >
                        <span
                          className={`px-2 py-1 text-sm  rounded-full ${
                            ratioWithFormsGood
                              ? (horse.scoreObj?.total || 0) >= maxScore
                                ? "bg-yellow-500 text-black"
                                : gapToAvgScore > 15
                                ? "bg-blue-400 text-black"
                                : horse?.oddsDecimal >= 15
                                ? "bg-gray-300 text-black"
                                : "bg-blue-900"
                              : "bg-red-900 opacity-40"
                          } ${
                            horse.oddsDecimal >= 15
                              ? "border-2 border-gray-300"
                              : ""
                          }`}
                          title={`${horse.name} ${horse.scoreObj?.total}`}
                        >
                          {horse.name} {horse.scoreObj?.total?.toFixed(1)} (
                          {gapToAvgScore > 0 ? "+" : ""}
                          {gapToAvgScore.toFixed(1)}){" "}
                          {horse.oddsDecimal > 0 ? horse.oddsDecimal : ""}
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
            {race.horses.map((horse) => (
              <Horse
                key={horse.id}
                horse={horse}
                race={race}
                meeting={meeting}
                results={results}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
