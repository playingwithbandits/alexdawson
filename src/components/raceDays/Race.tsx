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

interface RaceProps {
  race: RaceType;
  meeting: MeetingType;
  results: RaceResults | undefined;
  showInfo: boolean;
}

export const getRaceToShowStats = (race: RaceType) => {
  const raceAvgScore =
    race.horses
      ?.map((horse) => horse.scoreObj?.total || 0)
      .sort((a, b) => b - a)
      .slice(1, 4)
      .reduce((acc, score) => acc + score, 0) / 3;

  const maxScore = 15;
  const horsesInRace = race.horses.length;
  const horsesInRaceWithForms = race.horses.filter(
    (horse) => horse.form.length > 2
  ).length;
  const ratioWithForms = horsesInRaceWithForms / horsesInRace;
  const ratioWithFormsGood = ratioWithForms > 0.66;

  const scoreToBeBetterThan = 14;

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

export function Race({ race, meeting, results, showInfo }: RaceProps) {
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

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={race.id}>
        <AccordionTrigger className="">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-blue-400">
                {race.time} {raceAvgScore.toFixed(1)}
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

                    const oddsGood =
                      horse.oddsDecimal >= 15 &&
                      totalScore >= 10 &&
                      gapToAvgScore > 1;

                    const neededOkay = [scoreGood, oddsGood].some(
                      (value) => value
                    );

                    return showInfo
                      ? ratioWithFormsGood && neededOkay
                      : neededOkay;
                  })
                  ?.map((horse) => {
                    const gapToAvgScore =
                      (horse.scoreObj?.total || 0) - raceAvgScore;

                    const horsePos = getHorsePosition(
                      horse.name,
                      results,
                      race.time
                    );
                    const horseTrophy = getTrophy(horsePos);

                    return (
                      <span key={horse.id} className="flex items-center gap-1">
                        <span
                          className={`px-2 py-1 text-sm  rounded-full ${
                            ratioWithFormsGood
                              ? horse.scoreObj?.total === maxScore &&
                                gapToAvgScore > 2.5
                                ? "bg-yellow-500 text-black"
                                : gapToAvgScore > 2.5
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
                          {horse.name} {horse.scoreObj?.total} (
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
                  <td className="px-4 py-2 ">Avg</td>
                  <td className="px-4 py-2 ">T_Max</td>
                  <td className="px-4 py-2 ">Max Recent Form</td>
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
                    {race.horsesInfo.min.timePerFurlong.toFixed(2)}
                  </td>

                  <td className="px-4 py-2 ">
                    {race.horsesInfo.maxes.racedAgainst_Beaten_Averages.rpr.toFixed(
                      2
                    )}
                  </td>
                  <td className="px-4 py-2 ">
                    {race.horsesInfo.maxes.racedAgainst_Beaten_Maxes.rpr.toFixed(
                      2
                    )}
                  </td>
                  <td className="px-4 py-2 ">
                    {race.horsesInfo.maxes.mostRecentForm.rpr.toFixed(2)}
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
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
