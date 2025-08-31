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
import { renderCommentWithHighlights } from "./FormRow";
import { RaceResults } from "@/types/racing";
import { getHorsePosition, getTrophy } from "../horse/rows/HorseNameRow";

interface HorseProps {
  horse: HorseType;
  race: RaceType;
  meeting: MeetingType;
  results: RaceResults | undefined;
}

export function Horse({ horse, race, meeting, results }: HorseProps) {
  const { formInfo, name, scoreObj, jockey, lastRan } = horse;

  const { averages: formAverages, maxes: formMaxes, min: formMin } = formInfo;

  const {
    distanceF: formAveragesDistanceF,
    goingCodes: formAveragesGoingCode,
    jockeys: formAveragesJockey,
    racedAgainst_Beaten_Averages: formAveragesRacedAgainstBeatenAverages,
    racedAgainst_Beaten_Maxes: formAveragesRacedAgainstBeatenMaxes,
  } = formAverages;

  const {
    racedAgainst_Beaten_Maxes: formMaxesRacedAgainstBeatenMaxes,
    racedAgainst_Beaten_Averages: formMaxesRacedAgainstBeatenAverages,
  } = formMaxes;

  const { timePerFurlong: formMinTimePerFurlong } = formMin;

  const {
    total: totalScore,
    horseBetterThanRaceTheshold,
    horseFormAveragesStatsGood,
    horseRacedWith,
  } = scoreObj || {};

  const mostRecentForm_commentMatchedTerms =
    horse.mostRecentForm?.commentMatchedTerms;
  const mostRecentForm_commentMatchedTerms_hampered =
    mostRecentForm_commentMatchedTerms?.hampered || [];
  const mostRecentForm_commentMatchedTerms_eyecatcher =
    mostRecentForm_commentMatchedTerms?.eyecatcher || [];

  const anyFormsHaveEyecatcher = horse.form?.some(
    (form) => form.commentMatchedTerms?.eyecatcher?.length > 0
  );

  const anyFormsHaveHampered = horse.form?.some(
    (form) => form.commentMatchedTerms?.hampered?.length > 0
  );

  const horsePos = getHorsePosition(horse.name, results, race.time);
  const horseTrophy = getTrophy(horsePos);
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={horse.id} isOpenDefault>
        <AccordionTrigger className="">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white">
                {horsePos ? horseTrophy : ""} {name}
              </span>
              <span className="text-gray-400">({jockey})</span>

              <span
                className={twMerge(
                  "text-gray-400",
                  horseRacedWith?.lastRan && "text-yellow-400"
                )}
              >
                ({lastRan > 0 ? `${lastRan}d` : "0d"})
              </span>
              <span className="text-gray-400">
                ({horse.oddsDecimal > 0 ? horse.oddsDecimal : ""})
              </span>
              <span className="px-2 py-1 text-sm bg-blue-900 rounded-full">
                {totalScore}
              </span>

              {anyFormsHaveHampered && (
                <span style={{ color: "#fb923c", marginRight: "4px" }}>⚠️</span>
              )}

              {anyFormsHaveEyecatcher && (
                <span style={{ color: "#facc15", marginRight: "4px" }}>⭐</span>
              )}
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
                  <td className="px-4 py-2">Distances</td>
                  <td className="px-4 py-2">Goings</td>
                  <td className="px-4 py-2">Going</td>
                  <td className="px-4 py-2">Jockeys</td>
                  <td className="px-4 py-2">Avg_Jockey</td>
                  <td className="px-4 py-2">TPF</td>
                  <td className="px-4 py-2 ">Beaten Avg (Avg)</td>
                  <td className="px-4 py-2 ">Beaten Avg (Max)</td>
                  <td className="px-4 py-2 ">Beaten Max (Avg)</td>
                  <td className="px-4 py-2 ">Beaten Max (Max)</td>
                  <td className="px-4 py-2 ">Recent Form Avgs</td>
                  <td className="px-4 py-2 ">Recent Form Max</td>
                  <td className="px-4 py-2 ">OR | GAP</td>
                  <td className="px-4 py-2 ">Comment</td>
                </tr>
              </thead>
              <tbody>
                <tr className="">
                  <td
                    className={twMerge(
                      "px-4 py-2",
                      horseFormAveragesStatsGood?.distance && "text-[#fa9360]"
                    )}
                  >
                    {formAveragesDistanceF?.toFixed(1)}
                  </td>

                  <td
                    className={twMerge(
                      "px-4 py-2",
                      horseRacedWith?.distance && "text-yellow-400"
                    )}
                  >
                    {Array.from(
                      new Set(horse.form?.map((x) => x.distanceF?.toFixed(1)))
                    ).join(", ")}
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
                      horseFormAveragesStatsGood?.jockey && "text-[#fa9360]"
                    )}
                  >
                    {formAveragesJockey?.join(", ")}
                  </td>
                  <td
                    className={twMerge(
                      "px-4 py-2",
                      horseBetterThanRaceTheshold?.race_min_timePerFurlong &&
                        "text-[#fa9360]"
                    )}
                  >
                    {formMinTimePerFurlong.toFixed(2)}
                  </td>

                  <td
                    className={twMerge(
                      "px-4 py-2 ",
                      horseBetterThanRaceTheshold?.handicapped_averages_racedAgainst_Beaten_Averages_rpr &&
                        "text-[rgb(105,255,100)]"
                    )}
                  >
                    {(
                      formAveragesRacedAgainstBeatenAverages.rpr +
                      (horse.handicapBonus || 0)
                    )?.toFixed(2)}
                  </td>
                  <td
                    className={twMerge(
                      "px-4 py-2 ",
                      horseBetterThanRaceTheshold?.handicapped_maxes_racedAgainst_Beaten_Averages_rpr &&
                        "text-[rgb(105,255,100)]"
                    )}
                  >
                    {(
                      formMaxesRacedAgainstBeatenAverages.rpr +
                      (horse.handicapBonus || 0)
                    )?.toFixed(2)}
                  </td>
                  <td
                    className={twMerge(
                      "px-4 py-2 ",
                      horseBetterThanRaceTheshold?.handicapped_averages_racedAgainst_Beaten_rpr &&
                        "text-[#fa9360]"
                    )}
                  >
                    {(
                      formAveragesRacedAgainstBeatenMaxes.rpr +
                      (horse.handicapBonus || 0)
                    )?.toFixed(2)}
                  </td>
                  <td
                    className={twMerge(
                      "px-4 py-2 ",
                      horseBetterThanRaceTheshold?.handicapped_maxes_racedAgainst_Beaten_rpr &&
                        "text-[#fa9360]"
                    )}
                  >
                    {(
                      formMaxesRacedAgainstBeatenMaxes.rpr +
                      (horse.handicapBonus || 0)
                    )?.toFixed(2)}
                  </td>

                  <td
                    className={twMerge(
                      "px-4 py-2 ",
                      horseBetterThanRaceTheshold?.handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr &&
                        "text-yellow-400"
                    )}
                  >
                    {(
                      (horse?.mostRecentForm?.racedAgainst_BeatenInfo?.averages
                        ?.rpr || 0) + (horse.handicapBonus || 0)
                    )?.toFixed(2)}
                  </td>

                  <td
                    className={twMerge(
                      "px-4 py-2 ",
                      horseBetterThanRaceTheshold?.handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr &&
                        "text-yellow-400"
                    )}
                  >
                    {(
                      (horse.mostRecentForm?.racedAgainst_BeatenInfo?.maxes
                        ?.rpr || 0) + (horse.handicapBonus || 0)
                    )?.toFixed(2)}
                  </td>

                  <td className={twMerge("px-4 py-2 ")}>
                    {horse.or} | {horse.handicapBonus}
                  </td>
                  {/* 
                  <td
                    className={twMerge(
                      "px-4 py-2 ",
                      horseBetterThanRaceTheshold?.race_handicapped_rpr &&
                        "text-yellow-400"
                    )}
                  >
                    {(
                      (horse.formInfo?.averages?.racedAgainst_Beaten_Maxes
                        ?.rpr || 0) + (horse.handicapBonus || 0)
                    )?.toFixed(2)}{" "}
                    ({horse.handicapBonus}){" "}
                    {horse.formInfo?.averages?.racedAgainst_Beaten_Maxes?.rpr ||
                      0}
                  </td> */}

                  <td className="px-4 py-2 ">
                    {mostRecentForm_commentMatchedTerms_hampered?.length >
                      0 && (
                      <span style={{ color: "#fb923c", marginRight: "4px" }}>
                        ⚠️
                      </span>
                    )}

                    {mostRecentForm_commentMatchedTerms_eyecatcher?.length >
                      0 && (
                      <span style={{ color: "#facc15", marginRight: "4px" }}>
                        ⭐
                      </span>
                    )}
                    {renderCommentWithHighlights(
                      horse.mostRecentForm?.comment,
                      mostRecentForm_commentMatchedTerms
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
