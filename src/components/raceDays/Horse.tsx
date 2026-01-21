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
import {
  avg,
  countCommentSentimentObj,
  isJumpsRaceTypeCode,
} from "@/lib/utils";

interface HorseProps {
  horse: HorseType;
  race: RaceType;
  meeting: MeetingType;
  results: RaceResults | undefined;
}

const GREEN_TEXT_COLOR = "text-[rgb(105,255,100)]";
const YELLOW_TEXT_COLOR = "text-[#fa9360]";

export const horseHasRequiredStats = (horse: HorseType, race: RaceType) => {
  //("horseHasRequiredStats", horse, race);
  return getWarningMessage(horse, race).horseHasRequiredStats;
};

export const getWarningMessage = (horse: HorseType, race: RaceType) => {
  //console.log("getWarningMessage", horse, race);
  const raceAvgScore =
    race?.horses?.length > 0
      ? avg(race?.horses?.map((horse) => horse.scoreObj?.total || 0))
      : 0;
  const gapToAvgScore =
    horse.scoreObj?.total && raceAvgScore
      ? (horse.scoreObj?.total || 0) - raceAvgScore
      : 0;

  const gapToAvgScoreThreshold = 0;
  const gapToAvgScoreGood = gapToAvgScore >= gapToAvgScoreThreshold;
  // console.log(
  //   "getWarningMessage gapToAvgScore",
  //   horse.name,
  //   race,
  //   raceAvgScore,
  //   gapToAvgScore,
  //   gapToAvgScoreGood
  // );
  const countCommentSentiment =
    horse?.mostRecentForm &&
    countCommentSentimentObj(horse?.mostRecentForm?.commentMatchedTerms);


  const commentScore = countCommentSentiment?.score || 0;
  const lastRaceCommentScoreGood = commentScore >= 0;

  const lastRaceWasGood =
    lastRaceCommentScoreGood;

  const raceTypeIsJumps = isJumpsRaceTypeCode(race?.raceTypeCode);

  const jockeyStats = race.raceExtraInfo?.jockeyStats?.find(
    (x) => horseNameToKey(x.name) === horseNameToKey(horse.jockey)
  );
  const jockeyStatsLast14DaysWinRate = jockeyStats?.last14Days?.winRate;

  const jockeyStatsOverallWinRate = jockeyStats?.overall?.winRate;

  const jockeyStatsDecent =
    (jockeyStatsLast14DaysWinRate !== undefined &&
      jockeyStatsLast14DaysWinRate >= 5) ||
    (jockeyStatsOverallWinRate !== undefined &&
      jockeyStatsOverallWinRate >= 5);


  const requiredStats = [


    {
      value: horse?.mostRecentForm?.rpr && horse?.mostRecentForm?.rpr >= horse.formInfo?.maxes?.rpr * 0.85,
      name: "Most recent form rpr is less than form maxes rpr",
    },
    // {
    //   value:
    //     horse?.scoreObj?.horseBetterThanRaceTheshold
    //       ?.race_averages_racedAgainstMaxes,
    //   name: "Averages raced against maxes isn't good",
    // },


    // {
    //   value:
    //     horse?.scoreObj?.horseBetterThanRaceTheshold
    //       ?.handicapped_averages_racedAgainst_Beaten_Averages_rpr,
    //   name: "Averages raced against beaten averages isn't good",
    // },

    {
      value: lastRaceWasGood,
      name: "Last race wasn't good",
    },

    {
      value: horse?.scoreObj?.horseBetterThanRaceTheshold?.race_formAverages_rpr,
      name: "Form averages rpr is low",
    },
    {
      value: jockeyStatsDecent,
      name: "Jockey isnt decent",
    },
    {
      value: gapToAvgScoreGood,
      name: `Gap to avg score is less than ${gapToAvgScoreThreshold}`,
    },
    {
      value: horse.scoreObj?.total && horse.scoreObj?.total > 70,
      name: "Score is less than 70",
    },
    {
      value: horse.age > 3,
      name: "Horse is under 3 years old",
    },
    {
      value: horse.form.length >= 1,
      name: "Horse has less than 1 forms",
    },

    {
      value: horse.scoreObj?.horseRacedWith?.lastRan,
      name: "Long time since last ran",
    },
    {
      value: horse?.scoreObj?.horseRacedWith?.distance,
      name: "Hasn't raced at this distance",
    },
    {
      value: horse?.scoreObj?.horseRacedWith?.goingCode,
      name: "Hasn't raced with this going",
    },
    {
      value: horse?.scoreObj?.horseRacedWith?.raceTypeCode,
      name: "Hasn't raced with this race type",
    },

    // {
    //   value: raceTypeIsJumps || horse?.scoreObj?.horseRacedWith?.track,
    //   name: "Hasn't raced with this track",
    // },
    // {
    //   value: horse?.scoreObj?.horseRacedWith?.jockey,
    //   name: "Hasn't raced with this jockey",
    // },

    {
      value: horse?.scoreObj?.horseFormAveragesStatsGood?.distance,
      name: "Hasn't averaged distance",
    },

    // {
    //   value: horse?.scoreObj?.horseMostRecentForm?.type,
    //   name: "Recent form type",
    // },
    // {
    //   value: horse?.scoreObj?.horseMostRecentForm?.distance,
    //   name: "Recent form distance",
    // },

    // {
    //   value: horse?.scoreObj?.horseMostRecentForm?.going,
    //   name: "Recent form going",
    // },

    // {
    //   value:
    //     horse?.scoreObj?.horseBetterThanRaceTheshold?.race_min_timePerFurlong,
    //   name: "Time per furlong is high",
    // },
    // {
    //   value:
    //     horse?.scoreObj?.horseBetterThanRaceTheshold
    //       ?.handicapped_maxes_racedAgainst_Beaten_Averages_rpr,
    //   name: "Max form beaten averages rpr is low",
    // },
    // {
    //   value:
    //     horse?.scoreObj?.horseBetterThanRaceTheshold
    //       ?.handicapped_maxes_racedAgainst_Beaten_rpr,
    //   name: "Max form beaten rpr is low",
    // },

    // {
    //   value:
    //     horse?.scoreObj?.horseBetterThanRaceTheshold
    //       ?.handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr,
    //   name: "Last race had bad averages rpr",
    // },

    // {
    //   value:
    //     horse?.scoreObj?.horseBetterThanRaceTheshold
    //       ?.handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr,
    //   name: "Last race had bad averages rpr",
    // },

    {
      value:
        horse?.scoreObj?.horseBetterThanRaceTheshold
          ?.handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr,
      name: "Last race had bad max rpr",
    },
  ];

  const missingStats = requiredStats
    .filter((stat) => !stat.value)
    .map((stat) => stat.name);

  const horseHasRequiredStats = missingStats.length === 0;
  const message = missingStats?.length
    ? `Missing: ${missingStats.join(", ")}`
    : "";

  return { horseHasRequiredStats, message, missingStats };
};

export function Horse({ horse, race, meeting, results }: HorseProps) {
  const { formInfo, name, scoreObj, jockey, lastRan } = horse;

  const { averages: formAverages, maxes: formMaxes, min: formMin } = formInfo;

  const {
    distanceF: formAveragesDistanceF,
    goingCodes: formAveragesGoingCode,
    jockeys: formAveragesJockey,
    racedAgainst_Beaten_Averages: formAveragesRacedAgainstBeatenAverages,
    racedAgainst_Beaten_Maxes: formAveragesRacedAgainstBeatenMaxes,
    racedAgainst_Maxes: formAveragesRacedAgainstMaxes_Avg,
  } = formAverages;

  const {
    racedAgainst_Beaten_Maxes: formMaxesRacedAgainstBeatenMaxes,
    racedAgainst_Beaten_Averages: formMaxesRacedAgainstBeatenAverages,
    racedAgainst_Maxes: formMaxesRacedAgainstMaxes_Max,
  } = formMaxes;

  const { timePerFurlong: formMinTimePerFurlong } = formMin;

  const {
    total: totalScore,
    horseBetterThanRaceTheshold,
    horseFormAveragesStatsGood,
    horseRacedWith,
    horseMostRecentForm,
  } = scoreObj || {};

  const mostRecentForm_commentMatchedTerms =
    horse.mostRecentForm?.commentMatchedTerms;
  const mostRecentForm_commentMatchedTerms_hampered =
    mostRecentForm_commentMatchedTerms?.hampered || [];
  const mostRecentForm_commentMatchedTerms_eyecatcher =
    mostRecentForm_commentMatchedTerms?.eyecatcher || [];

  const countCommentSentiment =
    horse?.mostRecentForm &&
    countCommentSentimentObj(horse?.mostRecentForm?.commentMatchedTerms);
  const lastRaceWasExcellent =
    countCommentSentiment?.score !== undefined &&
    countCommentSentiment?.score >= 3;

  const anyFormsHaveEyecatcher = horse.form?.some(
    (form) => form.commentMatchedTerms?.eyecatcher?.length > 0
  );

  const anyFormsHaveHampered = horse.form?.some(
    (form) => form.commentMatchedTerms?.hampered?.length > 0
  );

  const horsePos = getHorsePosition(horse.name, results, race.time);
  const horseTrophy = getTrophy(horsePos);

  const warningMessage = getWarningMessage(horse, race);
  const averageCommentScore =
    horse?.form
      ?.map((form) => form.commentMatchedTerms)
      .map((commentMatchedTerms) =>
        countCommentSentimentObj(commentMatchedTerms)
      )
      .reduce((acc, curr) => acc + curr.score, 0) / horse?.form?.length;
  const averageCommentScoreLast3 =
    horse?.form
      ?.slice(0, 3)
      .map((form) => form.commentMatchedTerms)
      .map((commentMatchedTerms) =>
        countCommentSentimentObj(commentMatchedTerms)
      )
      .reduce((acc, curr) => acc + curr.score, 0) / 3;

  const lastCommentScore =
    horse?.mostRecentForm &&
    countCommentSentimentObj(horse?.mostRecentForm?.commentMatchedTerms).score;

  const raceTypeIsJumps = isJumpsRaceTypeCode(race?.raceTypeCode);

  const jockeyStats = race.raceExtraInfo?.jockeyStats?.find(
    (x) => horseNameToKey(x.name) === horseNameToKey(jockey)
  );
  const jockeyStatsLast14DaysWinRate = jockeyStats?.last14Days?.winRate;

  const jockeyStatsOverallWinRate = jockeyStats?.overall?.winRate;

  const jockeyStatsDecent =
    (jockeyStatsLast14DaysWinRate !== undefined &&
      jockeyStatsLast14DaysWinRate >= 5) ||
    (jockeyStatsOverallWinRate !== undefined &&
      jockeyStatsOverallWinRate >= 5);

  return (
    <div className={warningMessage.horseHasRequiredStats ? "" : "opacity-70"}>
      {" "}
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
                    horseRacedWith?.lastRan && GREEN_TEXT_COLOR
                  )}
                >
                  ({lastRan > 0 ? `${lastRan}d` : "0d"})
                </span>
                <span className="text-gray-400">
                  ({horse.oddsDecimal > 0 ? horse.oddsDecimal : ""})
                </span>
                <span className="text-gray-400">{totalScore?.toFixed(2)}</span>

                <span
                  className={twMerge(
                    "text-gray-400",
                    lastCommentScore !== undefined && lastCommentScore >= 0
                      ? GREEN_TEXT_COLOR
                      : "text-red-500"
                  )}
                >
                  {lastCommentScore !== undefined
                    ? lastCommentScore
                      ? lastCommentScore?.toFixed(2)
                      : 0
                    : "--"}
                </span>
                <span
                  className={twMerge(
                    "text-gray-400",
                    averageCommentScore >= 0
                      ? YELLOW_TEXT_COLOR
                      : "text-red-500"
                  )}
                >
                  {averageCommentScore !== undefined
                    ? averageCommentScore
                      ? averageCommentScore?.toFixed(2)
                      : 0
                    : "--"}
                </span>
                <span
                  className={twMerge(
                    "text-gray-400",
                    averageCommentScoreLast3 >= 0
                      ? YELLOW_TEXT_COLOR
                      : "text-red-500"
                  )}
                >
                  {averageCommentScoreLast3 !== undefined
                    ? averageCommentScoreLast3
                      ? averageCommentScoreLast3?.toFixed(2)
                      : 0
                    : "--"}
                </span>

                {anyFormsHaveHampered && (
                  <span style={{ color: "#fb923c", marginRight: "4px" }}>
                    ⚠️
                  </span>
                )}

                {anyFormsHaveEyecatcher && (
                  <span style={{ color: "#facc15", marginRight: "4px" }}>
                    ⭐
                  </span>
                )}

                <span>{warningMessage.message}</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mb-4">
              <table className="text-sm">
                <thead>
                  <tr className="opacity-50">
                    <td className="px-2 py-1" colSpan={3}>
                      Form Avgs
                    </td>
                    <td className="px-2 py-1 " colSpan={3}>
                      Beaten
                    </td>
                  </tr>
                  <tr className="opacity-50">
                    <td className="px-2 py-1 w-[100px]">Dists</td>
                    <td className="px-2 py-1 w-[100px]">Dist</td>
                    <td className="px-2 py-1 w-[100px]">Gngs</td>
                    <td className="px-2 py-1 w-[100px]">Gng</td>
                    {/* <td className="px-2 py-1 w-[100px]">Race Types</td>
                    <td className="px-2 py-1 w-[100px]">Race Type</td> */}
                    <td className="px-2 py-1 w-[100px]">Trks</td>
                    <td className="px-2 py-1 w-[100px]">Jocks</td>
                    <td className="px-2 py-1 w-[100px]">A_Jock</td>
                    <td className="px-2 py-1 w-[100px]">Jocks%</td>
                    <td className="px-2 py-1 w-[100px]">RPR</td>
                    <td className="px-2 py-1 w-[100px]">APR-FPR</td>
                    <td className="px-2 py-1 w-[100px]">TPF</td>
                    <td className="px-2 py-1 w-[100px]">MRA (Avg)</td>
                    <td className="px-2 py-1 w-[100px]">MRA (Max)</ td>
                    <td className="px-2 py-1 w-[100px]">Bt Avg (Avg)</td>
                    <td className="px-2 py-1 w-[100px]">Bt Avg (Max)</td>
                    <td className="px-2 py-1 w-[100px]">Bt Max (Avg)</td>
                    <td className="px-2 py-1 w-[100px]">Bt Max (Max)</td>
                    <td className="px-2 py-1 w-[100px]">RF Going</td>
                    <td className="px-2 py-1 w-[100px]">RF Dist</td>
                    <td className="px-2 py-1 w-[100px]">RF Avgs</td>
                    <td className="px-2 py-1 w-[100px]">RF Max</td>
                    <td className="px-2 py-1 w-[100px]">Bonus</td>
                    <td className="px-2 py-1 w-[100px]">Com</td>
                    <td className="px-2 py-1 min-w-[300px]">Com</td>
                  </tr>
                </thead>
                <tbody>
                  <tr className="">
                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseRacedWith?.distance && GREEN_TEXT_COLOR
                      )}
                    >
                      {Array.from(
                        new Set(horse.form?.map((x) => x.distanceF?.toFixed(1)))
                      ).join(", ")}
                    </td>
                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseFormAveragesStatsGood?.distance && GREEN_TEXT_COLOR
                      )}
                    >
                      {formAveragesDistanceF?.toFixed(1)}
                    </td>

                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseRacedWith?.goingCode && GREEN_TEXT_COLOR
                      )}
                    >
                      {Array.from(
                        new Set(horse.form?.flatMap((x) => x.goingCodes))
                      ).join(", ")}
                    </td>
                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseFormAveragesStatsGood?.goingCode &&
                          YELLOW_TEXT_COLOR
                      )}
                    >
                      {formAveragesGoingCode?.join(", ")}
                    </td>

                    {/* <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseRacedWith?.raceTypeCode &&
                          GREEN_TEXT_COLOR
                      )}
                    >
                      {Array.from(
                        new Set(horse.form?.flatMap((x) => x.raceTypeCode))
                      ).join(", ")}
                    </td>
                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseFormAveragesStatsGood?.raceTypeCode &&
                          YELLOW_TEXT_COLOR
                      )}
                    >
                      {formAveragesRaceTypeCode?.join(", ")}
                    </td> */}

                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseRacedWith?.track
                          ? raceTypeIsJumps
                            ? YELLOW_TEXT_COLOR
                            : YELLOW_TEXT_COLOR
                          : ""
                      )}
                    >
                      {Array.from(
                        new Set(horse.form?.map((x) => x.trackId))
                      ).join(", ")}
                    </td>
                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseRacedWith?.jockey && YELLOW_TEXT_COLOR
                      )}
                    >
                      {Array.from(new Set(horse.form?.map((x) => x.jockey)))
                        .map((x) => horseNameToKey(x))
                        .join(", ")}
                    </td>
                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseFormAveragesStatsGood?.jockey && YELLOW_TEXT_COLOR
                      )}
                    >
                      {formAveragesJockey?.join(", ")}
                    </td>
                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        jockeyStatsDecent && GREEN_TEXT_COLOR
                      )}
                    >
                      {jockeyStatsLast14DaysWinRate} |{" "}
                      {jockeyStatsOverallWinRate}
                    </td>

                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseBetterThanRaceTheshold?.race_formAverages_rpr &&
                        GREEN_TEXT_COLOR
                      )}
                    >
                      {formAverages?.rpr?.toFixed(2)}
                    </td>

                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horse?.mostRecentForm?.rpr && horse?.mostRecentForm?.rpr >= formMaxes?.rpr * 0.85 &&
                         GREEN_TEXT_COLOR
                      )}

                      title={`${horse?.mostRecentForm?.rpr} >= ${formMaxes?.rpr *0.85}`}
                    >
                      {horse?.mostRecentForm?.rpr && horse?.mostRecentForm?.rpr >= formMaxes?.rpr *0.85 ? "Yes" : "No"}
                    </td>

                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseBetterThanRaceTheshold?.race_min_timePerFurlong &&
                          YELLOW_TEXT_COLOR
                      )}
                    >
                      {formMinTimePerFurlong.toFixed(2)}
                    </td>

                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseBetterThanRaceTheshold?.race_averages_racedAgainstMaxes &&
                          YELLOW_TEXT_COLOR
                      )}
                    >
                      {formAveragesRacedAgainstMaxes_Avg.rpr?.toFixed(2)}
                    </td>

                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseBetterThanRaceTheshold?.race_maxes_racedAgainstMaxes &&
                          YELLOW_TEXT_COLOR
                      )}

                    >
                      {formMaxesRacedAgainstMaxes_Max.rpr?.toFixed(2)}
                    </td>

                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseBetterThanRaceTheshold?.handicapped_averages_racedAgainst_Beaten_Averages_rpr &&
                        YELLOW_TEXT_COLOR
                      )}
                        title={`${horse.scoreObj?.raw_data?.raw_handicapped_averages_racedAgainst_Beaten_Averages_rpr.join(", ")}`}
                    >
                      {(
                        formAveragesRacedAgainstBeatenAverages.rpr +
                        (horse.handicapBonus || 0)
                      )?.toFixed(2)}
                    </td>
                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseBetterThanRaceTheshold?.handicapped_maxes_racedAgainst_Beaten_Averages_rpr &&
                          YELLOW_TEXT_COLOR
                      )}
                      title={`${horse.scoreObj?.raw_data?.raw_handicapped_maxes_racedAgainst_Beaten_Averages_rpr.join(", ")}`}
                    >
                      {(
                        formMaxesRacedAgainstBeatenAverages.rpr +
                        (horse.handicapBonus || 0)
                      )?.toFixed(2)}
                    </td>
                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseBetterThanRaceTheshold?.handicapped_averages_racedAgainst_Beaten_Maxes_rpr &&
                          YELLOW_TEXT_COLOR
                      )}
                      title={`${horse.scoreObj?.raw_data?.raw_handicapped_averages_racedAgainst_Beaten_Maxes_rpr.join(", ")}`}
                    >
                      {(
                        formAveragesRacedAgainstBeatenMaxes.rpr +
                        (horse.handicapBonus || 0)
                      )?.toFixed(2)}
                    </td>
                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseBetterThanRaceTheshold?.handicapped_maxes_racedAgainst_Beaten_rpr &&
                          YELLOW_TEXT_COLOR
                      )}

                      title={`${horse.scoreObj?.raw_data?.raw_handicapped_maxes_racedAgainst_Beaten_Maxes_rpr.join(", ")}`}
                    >
                      {(
                        formMaxesRacedAgainstBeatenMaxes.rpr +
                        (horse.handicapBonus || 0)
                      )?.toFixed(2)}
                    </td>
                    {/* <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseMostRecentForm?.type && GREEN_TEXT_COLOR
                      )}
                    >
                      {horse?.mostRecentForm?.raceTypeCode}
                    </td> */}
                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseMostRecentForm?.going && YELLOW_TEXT_COLOR
                      )}
                    >
                      {horse?.mostRecentForm?.goingCodes?.join(", ")}
                    </td>
                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseMostRecentForm?.distance && YELLOW_TEXT_COLOR
                      )}
                    >
                      {horse?.mostRecentForm?.distanceF?.toFixed(1)}
                    </td>
                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseBetterThanRaceTheshold?.handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr &&
                          YELLOW_TEXT_COLOR
                      )}
                    >
                      {(
                        (horse?.mostRecentForm?.racedAgainst_BeatenInfo
                          ?.averages?.rpr || 0) + (horse.handicapBonus || 0)
                      )?.toFixed(2)}
                    </td>

                    <td
                      className={twMerge(
                        "px-2 py-1 w-[100px]",
                        horseBetterThanRaceTheshold?.handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr &&
                          GREEN_TEXT_COLOR
                      )}
                    >
                      {(
                        (horse.mostRecentForm?.racedAgainst_BeatenInfo?.maxes
                          ?.rpr || 0) + (horse.handicapBonus || 0)
                      )?.toFixed(2)}
                    </td>

                    <td
                      className={twMerge("px-2 py-1 w-[100px]")}
                      title={
                        `Last Race Or: ${horse.mostRecentForm?.or}\n` +
                        `Current Or: ${horse.or}\n\n` +
                        `Gap Between Last Race Or And Current Or: ${horse.gapBetweenLastRaceOrAndCurrentOr?.toFixed(
                          2
                        )}\n\n` +
                        `Form Averages Or: ${horse.formInfo.averages.or.toFixed(
                          2
                        )}\n` +
                        `Current Or: ${horse.or}\n` +
                        `Gap Between Form Averages Or And Horse Or: ${horse.gapBetweenFormAveragesOrAndHorseOr?.toFixed(
                          2
                        )}\n\n` +
                        `Handicap Bonus:\n\n (` +
                        `${horse.gapBetweenFormAveragesOrAndHorseOr?.toFixed(
                          2
                        )} + ${horse.gapBetweenLastRaceOrAndCurrentOr?.toFixed(
                          2
                        )} ) / 2 = ${horse.handicapBonus?.toFixed(2)}`
                      }
                    >
                      {horse.handicapBonus?.toFixed(2)}
                    </td>

<td  title={`
  ${mostRecentForm_commentMatchedTerms?.positive?.length} Positive: ${mostRecentForm_commentMatchedTerms?.positive?.map((term) => term).join(", ")} \n
  ${mostRecentForm_commentMatchedTerms?.negative?.length}  Negative: ${mostRecentForm_commentMatchedTerms?.negative?.map((term) => term).join(", ")} \n
  ${mostRecentForm_commentMatchedTerms?.hampered?.length}  Hampered: ${mostRecentForm_commentMatchedTerms?.hampered?.map((term) => term).join(", ")} \n
  ${mostRecentForm_commentMatchedTerms?.eyecatcher?.length}  Eyecatcher: ${mostRecentForm_commentMatchedTerms?.eyecatcher?.map((term) => term).join(", ")}\n
    \n
    
    `}
                      className={twMerge("px-2 py-1 w-[100px]", lastCommentScore !== undefined && lastCommentScore >= 0 ? GREEN_TEXT_COLOR : "text-red-500")}>{lastCommentScore !== undefined ? lastCommentScore : "-"}</td>
                    <td className="px-2 py-1">
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
                      {lastRaceWasExcellent && (
                        <span style={{ color: "#10b981", marginRight: "4px" }}>
                          👑
                        </span>
                      )}

                      <></>

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
    </div>
  );
}
