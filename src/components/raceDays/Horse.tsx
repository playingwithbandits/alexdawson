import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { horseNameToKey } from "@/lib/racing/scores/funcs";
import {
  Horse as HorseType,
  Meeting as MeetingType,
  Race as RaceType,
} from "@/types/raceday";
import { twMerge } from "tailwind-merge";
import { Forms } from "./Forms";

interface HorseProps {
  horse: HorseType;
  race: RaceType;
  meeting: MeetingType;
}

export function Horse({ horse, race, meeting }: HorseProps) {
  const { formInfo, name, scoreObj, jockey } = horse;

  const { averages: formAverages, maxes: formMaxes, min: formMin } = formInfo;

  const {
    distanceF: formAveragesDistanceF,
    goingCodes: formAveragesGoingCode,
    jockeys: formAveragesJockey,
    racedAgainst_Beaten_Averages: formAveragesRacedAgainstBeatenAverages,
  } = formAverages;

  const {
    racedAgainst_Beaten_Maxes: formMaxesRacedAgainstBeatenMaxes,
    racedAgainst_Beaten_Averages,
  } = formMaxes;

  const { timePerFurlong: formMinTimePerFurlong } = formMin;

  const {
    total: totalScore,
    horseBetterThanRaceTheshold,
    horseFormAveragesStatsGood,
    horseRacedWith,
  } = scoreObj || {};

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={horse.id} isOpenDefault>
        <AccordionTrigger className="">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white">{name}</span>
              <span className="text-gray-400">({jockey})</span>
              <span className="px-2 py-1 text-sm bg-blue-900 rounded-full">
                {totalScore}
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="mb-4">
            <table className="text-sm">
              <thead>
                <tr>
                  <td className="px-4 py-2" colSpan={3}>
                    Form Avgs
                  </td>
                  <td className="px-4 py-2 " colSpan={3}>
                    Beaten
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Distance</td>
                  <td className="px-4 py-2">Goings</td>
                  <td className="px-4 py-2">Going</td>
                  <td className="px-4 py-2">Jockeys</td>
                  <td className="px-4 py-2">Avg_Jockey</td>
                  <td className="px-4 py-2">TPF</td>
                  <td className="px-4 py-2 ">Avg</td>
                  <td className="px-4 py-2 ">A_Max</td>
                  <td className="px-4 py-2 ">T_Max</td>
                  <td className="px-4 py-2 ">Max Recent Form</td>
                </tr>
              </thead>
              <tbody>
                <tr className="">
                  <td
                    className={twMerge(
                      "px-4 py-2",
                      horseFormAveragesStatsGood?.distance && "text-yellow-400"
                    )}
                  >
                    {formAveragesDistanceF?.toFixed(1)}
                  </td>

                  <td
                    className={twMerge(
                      "px-4 py-2",
                      horseRacedWith?.goingCode && "text-[#fa9360]"
                    )}
                  >
                    {Array.from(
                      new Set(horse.form?.flatMap((x) => x.goingCodes))
                    ).join(", ")}
                  </td>
                  <td
                    className={twMerge(
                      "px-4 py-2",
                      horseFormAveragesStatsGood?.goingCode && "text-yellow-400"
                    )}
                  >
                    {formAveragesGoingCode?.join(", ")}
                  </td>

                  <td
                    className={twMerge(
                      "px-4 py-2",
                      horseRacedWith?.jockey && "text-[#fa9360]"
                    )}
                  >
                    {Array.from(new Set(horse.form?.map((x) => x.jockey)))
                      .map((x) => horseNameToKey(x))
                      .join(", ")}
                  </td>
                  <td
                    className={twMerge(
                      "px-4 py-2",
                      horseFormAveragesStatsGood?.jockey && "text-yellow-400"
                    )}
                  >
                    {formAveragesJockey?.join(", ")}
                  </td>
                  <td
                    className={twMerge(
                      "px-4 py-2",
                      horseBetterThanRaceTheshold?.timePerFurlong &&
                        "text-yellow-400"
                    )}
                  >
                    {formMinTimePerFurlong.toFixed(2)}
                  </td>

                  <td
                    className={twMerge(
                      "px-4 py-2 ",
                      horseBetterThanRaceTheshold?.rpr_racedAgainst_Beaten_Averages &&
                        "text-yellow-400"
                    )}
                  >
                    {formAveragesRacedAgainstBeatenAverages.rpr?.toFixed(2)}
                  </td>
                  <td className={twMerge("px-4 py-2 ")}>
                    {racedAgainst_Beaten_Averages.rpr?.toFixed(2)}
                  </td>
                  <td
                    className={twMerge(
                      "px-4 py-2 ",
                      horseBetterThanRaceTheshold?.rpr_racedAgainst_Beaten_Maxes &&
                        "text-yellow-400"
                    )}
                  >
                    {formMaxesRacedAgainstBeatenMaxes.rpr?.toFixed(2)}
                  </td>
                  <td
                    className={twMerge(
                      "px-4 py-2 ",
                      horseBetterThanRaceTheshold?.mostRecentForm &&
                        "text-yellow-400"
                    )}
                  >
                    {horse.mostRecentForm?.racedAgainst_BeatenInfo?.maxes?.rpr?.toFixed(
                      2
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem value={horse.id + "form"}>
              <AccordionTrigger className="">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 100 2h4a1 1 0 100-2H8zm5-4a1 1 0 00-1-1H8a1 1 0 100 2h4a1 1 0 001-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-2 bg-gray-900">
                  <Forms
                    forms={horse.form}
                    horse={horse}
                    race={race}
                    meeting={meeting}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
