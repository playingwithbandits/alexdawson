import { Meeting, ScoreObj } from "@/types/raceday";
import { Meeting as MeetingComponent } from "@/components/raceDays/Meeting";
import { horseNameToKey, placeToPlaceKey } from "@/lib/racing/scores/funcs";
import { compareTwoGoingCodeArrays, distanceOkay } from "@/lib/utils";
import { RaceResults } from "@/types/racing";
import { useState } from "react";
import { getRaceToShowStats } from "@/components/raceDays/Race";

export function Dashboard({
  data,
  results,
}: {
  data: Meeting[];
  results: RaceResults | undefined;
}) {
  console.log("Dashboard", data, results);
  const [showInfo, setShowInfo] = useState(true);

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 bg-gray-900 min-h-screen">
        No race meetings available
      </div>
    );
  }

  const addScoreObjToMeeting = (meetings: Meeting[]): Meeting[] => {
    return meetings.map((meeting) => {
      return {
        ...meeting,
        races: meeting.races.map((race) => {
          const { horsesInfo, goingCodes, distanceF, trackId } = race;
          const { maxes: raceMaxes, min: raceMin } = horsesInfo;

          const raceThresholds = {
            rpr_racedAgainst_Beaten_Averages:
              raceMaxes?.racedAgainst_Beaten_Averages?.rpr * 0.925,
            rpr_racedAgainst_Beaten_Maxes:
              raceMaxes?.racedAgainst_Beaten_Maxes?.rpr * 0.925,

            timePerFurlong: raceMin?.timePerFurlong * 1.1,

            mostRecentForm: raceMaxes?.mostRecentForm?.rpr * 0.925,
          };

          return {
            ...race,
            horses: race.horses
              .map((horse) => {
                const {
                  rpr: horseRpr,
                  formInfo: horseFormInfo,
                  jockey,
                  form,
                } = horse;

                const {
                  maxes: horseFormMaxes,
                  min: horseFormMin,
                  averages: horseFormAverages,
                } = horseFormInfo;

                // const horseBetterThanRaceAverage = {
                //   rpr: Boolean(horseRpr) && horseRpr >= raceAverages?.rpr,
                // };

                const horseBetterThanRaceTheshold = {
                  rpr_racedAgainst_Beaten_Averages:
                    Boolean(
                      horseFormAverages?.racedAgainst_Beaten_Averages?.rpr
                    ) &&
                    horseFormAverages?.racedAgainst_Beaten_Averages?.rpr >=
                      raceThresholds.rpr_racedAgainst_Beaten_Averages,

                  rpr_racedAgainst_Beaten_Maxes:
                    Boolean(horseFormMaxes?.racedAgainst_Beaten_Maxes?.rpr) &&
                    horseFormMaxes?.racedAgainst_Beaten_Maxes?.rpr >=
                      raceThresholds.rpr_racedAgainst_Beaten_Maxes,

                  timePerFurlong:
                    Boolean(horseFormMin?.timePerFurlong) &&
                    horseFormMin?.timePerFurlong <=
                      raceThresholds.timePerFurlong,

                  mostRecentForm:
                    Boolean(
                      horse.mostRecentForm?.racedAgainst_BeatenInfo?.maxes?.rpr
                    ) &&
                    (horse.mostRecentForm?.racedAgainst_BeatenInfo?.maxes
                      ?.rpr || 0) >= raceThresholds.mostRecentForm,
                };

                const avgGoingCodes = horseFormInfo?.averages?.goingCodes;
                const avgJockeys = horseFormInfo?.averages?.jockeys;
                const avgDistanceF = horseFormInfo?.averages?.distanceF;

                const horseFormAveragesStatsGood = {
                  distance: distanceOkay(avgDistanceF, distanceF),
                  goingCode:
                    Boolean(avgGoingCodes) &&
                    compareTwoGoingCodeArrays(goingCodes, avgGoingCodes),

                  jockey:
                    Boolean(avgJockeys) &&
                    avgJockeys?.some(
                      (x) => horseNameToKey(x) === horseNameToKey(jockey)
                    ),
                };

                const horseRacedWith = {
                  jockey: form
                    ?.map((x) => horseNameToKey(x.jockey))
                    .includes(horseNameToKey(jockey)),
                  goingCode: form
                    ?.map((f) =>
                      compareTwoGoingCodeArrays(goingCodes, f.goingCodes)
                    )
                    .some((x) => x),
                  lastRan: Boolean(horse.lastRan) && horse.lastRan <= 45,
                };

                const total =
                  [
                    horseBetterThanRaceTheshold?.timePerFurlong ? 1 : 0,
                    horseBetterThanRaceTheshold?.mostRecentForm ? 2 : 0,
                    horseBetterThanRaceTheshold?.rpr_racedAgainst_Beaten_Averages
                      ? 2
                      : 0,
                    horseBetterThanRaceTheshold?.rpr_racedAgainst_Beaten_Maxes
                      ? 2
                      : 0,
                    horseFormAveragesStatsGood?.distance ? 2 : 0,
                    horseFormAveragesStatsGood?.goingCode ? 1 : 0,
                    horseFormAveragesStatsGood?.jockey ? 0.5 : 0,
                    horseRacedWith?.jockey ? 0.5 : 0,
                    horseRacedWith?.goingCode ? 2 : 0,
                    horseRacedWith?.lastRan ? 2 : 0,
                  ]
                    ?.filter(Boolean)
                    .reduce<number>((a, b) => a + b, 0) || 0;

                const scoreObj: ScoreObj = {
                  total,
                  horseRacedWith,
                  horseBetterThanRaceTheshold,
                  horseFormAveragesStatsGood,
                };

                return {
                  ...horse,
                  scoreObj,
                };
              })
              .sort((a, b) => b.scoreObj.total - a.scoreObj.total),
          };
        }),
      };
    });
  };

  const dataWithScoreObj: Meeting[] = addScoreObjToMeeting(data);

  console.log("dataWithScoreObj", dataWithScoreObj);

  return (
    <div className="space-y-4 p-4 bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Race Day Dashboard</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={() => setShowInfo(!showInfo)}
        >
          {showInfo ? "Hide" : "Show"}
        </button>
      </div>
      {dataWithScoreObj
        ?.filter((x) => {
          const hasARaceWithHorseScoreMax = x.races.some((race) => {
            const {
              raceAvgScore,
              maxScore,
              ratioWithFormsGood,
              scoreToBeBetterThan,
            } = getRaceToShowStats(race);

            const someHorseHasMaxScore = race.horses.some(
              (horse) => (horse.scoreObj?.total || 0) >= scoreToBeBetterThan
            );

            return ratioWithFormsGood && someHorseHasMaxScore;
          });

          return showInfo ? hasARaceWithHorseScoreMax : true;
        })
        ?.map((meeting) => (
          <MeetingComponent
            key={meeting.trackId}
            meeting={meeting}
            results={results}
            showInfo={showInfo}
          />
        ))}
    </div>
  );
}
