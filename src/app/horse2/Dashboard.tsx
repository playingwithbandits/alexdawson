import { Meeting, ScoreObj } from "@/types/raceday";
import { Meeting as MeetingComponent } from "@/components/raceDays/Meeting";
import { horseNameToKey } from "@/lib/racing/scores/funcs";
import { compareTwoGoingCodeArrays, distanceOkay, max } from "@/lib/utils";
import { RaceResults } from "@/types/racing";
import { useState } from "react";
import { getRaceToShowStats } from "@/components/raceDays/Race";
import { normalizeTime } from "@/components/horse/DayPredictions";

export function Dashboard({
  data,
  results,
  date,
}: {
  data: Meeting[];
  results: RaceResults | undefined;
  date: string;
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

          const raw_handicapped_rpr = race.horses.map(
            (horse) => horse.handicappedRpr || 0
          );

          const raw_handicapped_maxes_racedAgainst_Beaten_rpr = race.horses.map(
            (horse) =>
              (horse.formInfo?.maxes?.racedAgainst_Beaten?.rpr || 0) +
              (horse.handicapBonus || 0)
          );
          const raw_handicapped_maxes_racedAgainst_Beaten_Averages_rpr =
            race.horses.map(
              (horse) =>
                (horse.formInfo?.maxes?.racedAgainst_Beaten_Averages?.rpr ||
                  0) + (horse.handicapBonus || 0)
            );

          const raw_handicapped_maxes_racedAgainst_Beaten_Maxes_rpr =
            race.horses.map(
              (horse) =>
                (horse.formInfo?.maxes?.racedAgainst_Beaten_Maxes?.rpr || 0) +
                (horse.handicapBonus || 0)
            );

          const raw_handicapped_averages_racedAgainst_Beaten_rpr =
            race.horses.map(
              (horse) =>
                (horse.formInfo?.averages?.racedAgainst_Beaten?.rpr || 0) +
                (horse.handicapBonus || 0)
            );

          const raw_handicapped_averages_racedAgainst_Beaten_Averages_rpr =
            race.horses.map(
              (horse) =>
                (horse.formInfo?.averages?.racedAgainst_Beaten_Averages?.rpr ||
                  0) + (horse.handicapBonus || 0)
            );

          const raw_handicapped_averages_racedAgainst_Beaten_Maxes_rpr =
            race.horses.map(
              (horse) =>
                (horse.formInfo?.averages?.racedAgainst_Beaten_Maxes?.rpr ||
                  0) + (horse.handicapBonus || 0)
            );

          const raw_handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr =
            race.horses.map(
              (horse) =>
                (horse.mostRecentForm?.racedAgainst_BeatenInfo?.averages?.rpr ||
                  0) + (horse.handicapBonus || 0)
            );

          const raw_handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr =
            race.horses.map(
              (horse) =>
                (horse.mostRecentForm?.racedAgainst_BeatenInfo?.maxes?.rpr ||
                  0) + (horse.handicapBonus || 0)
            );

          const maxRaceHandicappedRpr = max(raw_handicapped_rpr);
          const maxRaceHandicappedMaxesRacedAgainstBeatenRpr = max(
            raw_handicapped_maxes_racedAgainst_Beaten_rpr
          );
          const maxRaceHandicappedMaxesRacedAgainstBeatenAveragesRpr = max(
            raw_handicapped_maxes_racedAgainst_Beaten_Averages_rpr
          );
          const maxRaceHandicappedMaxesRacedAgainstBeatenMaxesRpr = max(
            raw_handicapped_maxes_racedAgainst_Beaten_Maxes_rpr
          );
          const maxRaceHandicappedAveragesRacedAgainstBeatenRpr = max(
            raw_handicapped_averages_racedAgainst_Beaten_rpr
          );
          const maxRaceHandicappedAveragesRacedAgainstBeatenAveragesRpr = max(
            raw_handicapped_averages_racedAgainst_Beaten_Averages_rpr
          );
          const maxRaceHandicappedAveragesRacedAgainstBeatenMaxesRpr = max(
            raw_handicapped_averages_racedAgainst_Beaten_Maxes_rpr
          );

          const maxRaceHandicappedMostRecentFormRacedAgainstBeatenAveragesRpr =
            max(
              raw_handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr
            );
          const maxRaceHandicappedMostRecentFormRacedAgainstBeatenMaxesRpr =
            max(raw_handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr);

          const thresholdValue = 0.9;

          const raceThresholds = {
            race_rpr: raceMaxes?.race_rpr * thresholdValue,
            race_averages_racedAgainst:
              raceMaxes?.race_averages_racedAgainst * thresholdValue,
            race_maxes_racedAgainst:
              raceMaxes?.race_maxes_racedAgainst * thresholdValue,
            race_averages_racedAgainst_Averages:
              raceMaxes?.race_averages_racedAgainst_Averages * thresholdValue,
            race_maxes_racedAgainst_Averages:
              raceMaxes?.race_maxes_racedAgainst_Averages * thresholdValue,
            race_averages_racedAgainst_Beaten:
              raceMaxes?.race_averages_racedAgainst_Beaten * thresholdValue,
            race_maxes_racedAgainst_Beaten:
              raceMaxes?.race_maxes_racedAgainst_Beaten * thresholdValue,
            race_averages_racedAgainst_Beaten_Averages:
              raceMaxes?.race_averages_racedAgainst_Beaten_Averages *
              thresholdValue,
            race_maxes_racedAgainst_Beaten_Averages:
              raceMaxes?.race_maxes_racedAgainst_Beaten_Averages *
              thresholdValue,
            race_mostRecentForm_racedAgainst_Beaten_Averages:
              raceMaxes?.race_mostRecentForm_racedAgainst_Beaten_Averages *
              thresholdValue,
            race_mostRecentForm_racedAgainst_Beaten_Maxes:
              raceMaxes?.race_mostRecentForm_racedAgainst_Beaten_Maxes *
              thresholdValue,

            race_min_timePerFurlong: raceMin?.race_min_timePerFurlong * 1.1,

            race_handicapped_rpr: maxRaceHandicappedRpr * thresholdValue,
            race_handicapped_maxes_racedAgainst_Beaten_rpr:
              maxRaceHandicappedMaxesRacedAgainstBeatenRpr * thresholdValue,
            race_handicapped_maxes_racedAgainst_Beaten_Averages_rpr:
              maxRaceHandicappedMaxesRacedAgainstBeatenAveragesRpr *
              thresholdValue,
            race_handicapped_maxes_racedAgainst_Beaten_Maxes_rpr:
              maxRaceHandicappedMaxesRacedAgainstBeatenMaxesRpr *
              thresholdValue,
            race_handicapped_averages_racedAgainst_Beaten_rpr:
              maxRaceHandicappedAveragesRacedAgainstBeatenRpr * thresholdValue,
            race_handicapped_averages_racedAgainst_Beaten_Averages_rpr:
              maxRaceHandicappedAveragesRacedAgainstBeatenAveragesRpr *
              thresholdValue,
            race_handicapped_averages_racedAgainst_Beaten_Maxes_rpr:
              maxRaceHandicappedAveragesRacedAgainstBeatenMaxesRpr *
              thresholdValue,

            race_handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr:
              maxRaceHandicappedMostRecentFormRacedAgainstBeatenAveragesRpr *
              thresholdValue,
            race_handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr:
              maxRaceHandicappedMostRecentFormRacedAgainstBeatenMaxesRpr *
              thresholdValue,
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
                  or: horseOr,
                  handicapBonus,
                  handicappedRpr,
                } = horse;

                const handicappedStats = {
                  handicapped_maxes_racedAgainst_Beaten_rpr:
                    (horse.formInfo?.maxes?.racedAgainst_Beaten?.rpr || 0) +
                    (horse.handicapBonus || 0),
                  handicapped_maxes_racedAgainst_Beaten_Averages_rpr:
                    (horse.formInfo?.maxes?.racedAgainst_Beaten_Averages?.rpr ||
                      0) + (horse.handicapBonus || 0),
                  handicapped_maxes_racedAgainst_Beaten_Maxes_rpr:
                    (horse.formInfo?.maxes?.racedAgainst_Beaten_Maxes?.rpr ||
                      0) + (horse.handicapBonus || 0),
                  handicapped_averages_racedAgainst_Beaten_rpr:
                    (horse.formInfo?.averages?.racedAgainst_Beaten?.rpr || 0) +
                    (horse.handicapBonus || 0),
                  handicapped_averages_racedAgainst_Beaten_Averages_rpr:
                    (horse.formInfo?.averages?.racedAgainst_Beaten_Averages
                      ?.rpr || 0) + (horse.handicapBonus || 0),
                  handicapped_averages_racedAgainst_Beaten_Maxes_rpr:
                    (horse.formInfo?.averages?.racedAgainst_Beaten_Maxes?.rpr ||
                      0) + (horse.handicapBonus || 0),
                  handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr:
                    (horse.mostRecentForm?.racedAgainst_BeatenInfo?.averages
                      ?.rpr || 0) + (horse.handicapBonus || 0),
                  handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr:
                    (horse.mostRecentForm?.racedAgainst_BeatenInfo?.maxes
                      ?.rpr || 0) + (horse.handicapBonus || 0),
                };

                const {
                  maxes: horseFormMaxes,
                  min: horseFormMin,
                  averages: horseFormAverages,
                } = horseFormInfo;

                // const horseBetterThanRaceAverage = {
                //   rpr: Boolean(horseRpr) && horseRpr >= raceAverages?.rpr,
                // };

                const horseBetterThanRaceTheshold: {
                  race_rpr: boolean;
                  race_averages_racedAgainst: boolean;
                  race_maxes_racedAgainst: boolean;
                  race_averages_racedAgainst_Averages: boolean;
                  race_maxes_racedAgainst_Averages: boolean;
                  race_averages_racedAgainst_Beaten: boolean;
                  race_maxes_racedAgainst_Beaten: boolean;
                  race_averages_racedAgainst_Beaten_Averages: boolean;
                  race_maxes_racedAgainst_Beaten_Averages: boolean;
                  race_mostRecentForm_racedAgainst_Beaten_Averages: boolean;
                  race_mostRecentForm_racedAgainst_Beaten_Maxes: boolean;
                  race_min_timePerFurlong: boolean;
                  race_handicapped_rpr: boolean;

                  handicapped_maxes_racedAgainst_Beaten_rpr: boolean;
                  handicapped_maxes_racedAgainst_Beaten_Averages_rpr: boolean;
                  handicapped_maxes_racedAgainst_Beaten_Maxes_rpr: boolean;
                  handicapped_averages_racedAgainst_Beaten_rpr: boolean;
                  handicapped_averages_racedAgainst_Beaten_Averages_rpr: boolean;
                  handicapped_averages_racedAgainst_Beaten_Maxes_rpr: boolean;

                  handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr: boolean;
                  handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr: boolean;
                } = {
                  race_rpr:
                    Boolean(horseRpr) && horseRpr >= raceThresholds.race_rpr,

                  race_averages_racedAgainst:
                    Boolean(horseFormAverages?.racedAgainst?.rpr) &&
                    horseFormAverages.racedAgainst.rpr >=
                      raceThresholds.race_averages_racedAgainst,

                  race_maxes_racedAgainst:
                    Boolean(horseFormMaxes?.racedAgainst?.rpr) &&
                    horseFormMaxes.racedAgainst.rpr >=
                      raceThresholds.race_maxes_racedAgainst,

                  race_averages_racedAgainst_Averages:
                    Boolean(horseFormAverages?.racedAgainst_Averages?.rpr) &&
                    horseFormAverages.racedAgainst_Averages.rpr >=
                      raceThresholds.race_averages_racedAgainst_Averages,

                  race_maxes_racedAgainst_Averages:
                    Boolean(horseFormMaxes?.racedAgainst_Averages?.rpr) &&
                    horseFormMaxes.racedAgainst_Averages.rpr >=
                      raceThresholds.race_maxes_racedAgainst_Averages,

                  race_averages_racedAgainst_Beaten:
                    Boolean(horseFormAverages?.racedAgainst_Beaten?.rpr) &&
                    horseFormAverages.racedAgainst_Beaten.rpr >=
                      raceThresholds.race_averages_racedAgainst_Beaten,

                  race_maxes_racedAgainst_Beaten:
                    Boolean(horseFormMaxes?.racedAgainst_Beaten?.rpr) &&
                    horseFormMaxes.racedAgainst_Beaten.rpr >=
                      raceThresholds.race_maxes_racedAgainst_Beaten,

                  race_averages_racedAgainst_Beaten_Averages:
                    Boolean(
                      horseFormAverages?.racedAgainst_Beaten_Averages?.rpr
                    ) &&
                    horseFormAverages.racedAgainst_Beaten_Averages.rpr >=
                      raceThresholds.race_averages_racedAgainst_Beaten_Averages,

                  race_maxes_racedAgainst_Beaten_Averages:
                    Boolean(
                      horseFormMaxes?.racedAgainst_Beaten_Averages?.rpr
                    ) &&
                    horseFormMaxes.racedAgainst_Beaten_Averages.rpr >=
                      raceThresholds.race_maxes_racedAgainst_Beaten_Averages,

                  race_mostRecentForm_racedAgainst_Beaten_Averages:
                    Boolean(
                      horse.mostRecentForm?.racedAgainst_BeatenInfo?.averages
                        ?.rpr
                    ) &&
                    (horse.mostRecentForm?.racedAgainst_BeatenInfo?.averages
                      ?.rpr || 0) >=
                      raceThresholds.race_mostRecentForm_racedAgainst_Beaten_Averages,

                  race_mostRecentForm_racedAgainst_Beaten_Maxes:
                    Boolean(
                      horse.mostRecentForm?.racedAgainst_BeatenInfo?.maxes?.rpr
                    ) &&
                    (horse.mostRecentForm?.racedAgainst_BeatenInfo?.maxes
                      ?.rpr || 0) >=
                      raceThresholds.race_mostRecentForm_racedAgainst_Beaten_Maxes,

                  race_min_timePerFurlong:
                    Boolean(horseFormMin?.timePerFurlong) &&
                    horseFormMin.timePerFurlong <=
                      raceThresholds.race_min_timePerFurlong,

                  race_handicapped_rpr: !Boolean(
                    raceThresholds.race_handicapped_rpr
                  )
                    ? true
                    : Boolean(handicappedRpr) &&
                      (handicappedRpr || 0) >=
                        raceThresholds.race_handicapped_rpr,

                  handicapped_maxes_racedAgainst_Beaten_rpr: !Boolean(
                    raceThresholds.race_handicapped_maxes_racedAgainst_Beaten_rpr
                  )
                    ? true
                    : Boolean(
                        handicappedStats.handicapped_maxes_racedAgainst_Beaten_rpr
                      ) &&
                      (handicappedStats.handicapped_maxes_racedAgainst_Beaten_rpr ||
                        0) >=
                        raceThresholds.race_handicapped_maxes_racedAgainst_Beaten_rpr,

                  handicapped_maxes_racedAgainst_Beaten_Averages_rpr: !Boolean(
                    raceThresholds.race_handicapped_maxes_racedAgainst_Beaten_Averages_rpr
                  )
                    ? true
                    : Boolean(
                        handicappedStats.handicapped_maxes_racedAgainst_Beaten_Averages_rpr
                      ) &&
                      (handicappedStats.handicapped_maxes_racedAgainst_Beaten_Averages_rpr ||
                        0) >=
                        raceThresholds.race_handicapped_maxes_racedAgainst_Beaten_Averages_rpr,

                  handicapped_maxes_racedAgainst_Beaten_Maxes_rpr: !Boolean(
                    raceThresholds.race_handicapped_maxes_racedAgainst_Beaten_Maxes_rpr
                  )
                    ? true
                    : Boolean(
                        handicappedStats.handicapped_maxes_racedAgainst_Beaten_Maxes_rpr
                      ) &&
                      (handicappedStats.handicapped_maxes_racedAgainst_Beaten_Maxes_rpr ||
                        0) >=
                        raceThresholds.race_handicapped_maxes_racedAgainst_Beaten_Maxes_rpr,

                  handicapped_averages_racedAgainst_Beaten_rpr: !Boolean(
                    raceThresholds.race_handicapped_averages_racedAgainst_Beaten_rpr
                  )
                    ? true
                    : Boolean(
                        handicappedStats.handicapped_averages_racedAgainst_Beaten_rpr
                      ) &&
                      (handicappedStats.handicapped_averages_racedAgainst_Beaten_rpr ||
                        0) >=
                        raceThresholds.race_handicapped_averages_racedAgainst_Beaten_rpr,

                  handicapped_averages_racedAgainst_Beaten_Averages_rpr:
                    !Boolean(
                      raceThresholds.race_handicapped_averages_racedAgainst_Beaten_Averages_rpr
                    )
                      ? true
                      : Boolean(
                          handicappedStats.handicapped_averages_racedAgainst_Beaten_Averages_rpr
                        ) &&
                        (handicappedStats.handicapped_averages_racedAgainst_Beaten_Averages_rpr ||
                          0) >=
                          raceThresholds.race_handicapped_averages_racedAgainst_Beaten_Averages_rpr,

                  handicapped_averages_racedAgainst_Beaten_Maxes_rpr: !Boolean(
                    raceThresholds.race_handicapped_averages_racedAgainst_Beaten_Maxes_rpr
                  )
                    ? true
                    : Boolean(
                        handicappedStats.handicapped_averages_racedAgainst_Beaten_Maxes_rpr
                      ) &&
                      (handicappedStats.handicapped_averages_racedAgainst_Beaten_Maxes_rpr ||
                        0) >=
                        raceThresholds.race_handicapped_averages_racedAgainst_Beaten_Maxes_rpr,

                  handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr:
                    !Boolean(
                      raceThresholds.race_handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr
                    )
                      ? true
                      : Boolean(
                          handicappedStats.handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr
                        ) &&
                        (handicappedStats.handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr ||
                          0) >=
                          raceThresholds.race_handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr,

                  handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr:
                    !Boolean(
                      raceThresholds.race_handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr
                    )
                      ? true
                      : Boolean(
                          handicappedStats.handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr
                        ) &&
                        (handicappedStats.handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr ||
                          0) >=
                          raceThresholds.race_handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr,
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
                  distance: form
                    ?.map((f) => distanceOkay(f.distanceF, distanceF))
                    .some((x) => x),
                };

                const weights = {
                  race_rpr: 1,
                  race_averages_racedAgainst: 1,
                  race_maxes_racedAgainst: 1,
                  race_averages_racedAgainst_Averages: 1,
                  race_maxes_racedAgainst_Averages: 1,
                  race_averages_racedAgainst_Beaten: 1,
                  race_maxes_racedAgainst_Beaten: 1,
                  race_averages_racedAgainst_Beaten_Averages: 1,
                  race_maxes_racedAgainst_Beaten_Averages: 1,
                  race_mostRecentForm_racedAgainst_Beaten_Averages: 1,
                  race_mostRecentForm_racedAgainst_Beaten_Maxes: 1,
                  race_min_timePerFurlong: 1,

                  race_handicapped_rpr: 1,
                  handicapped_maxes_racedAgainst_Beaten_rpr: 1,
                  handicapped_maxes_racedAgainst_Beaten_Averages_rpr: 1,
                  handicapped_maxes_racedAgainst_Beaten_Maxes_rpr: 1,
                  handicapped_averages_racedAgainst_Beaten_rpr: 1,
                  handicapped_averages_racedAgainst_Beaten_Averages_rpr: 1,
                  handicapped_averages_racedAgainst_Beaten_Maxes_rpr: 1,
                  handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr: 1,
                  handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr: 1,

                  hfa_distance: 1,
                  hfa_goingCode: 1,
                  hfa_jockey: 1,

                  hrw_jockey: 1,
                  hrw_goingCode: 1,
                  hrw_lastRan: 1,
                  hrw_distance: 1,
                };

                const total =
                  [
                    horseBetterThanRaceTheshold?.race_rpr
                      ? weights.race_rpr
                      : 0,
                    horseBetterThanRaceTheshold?.race_averages_racedAgainst
                      ? weights.race_averages_racedAgainst
                      : 0,
                    horseBetterThanRaceTheshold?.race_maxes_racedAgainst
                      ? weights.race_maxes_racedAgainst
                      : 0,
                    horseBetterThanRaceTheshold?.race_averages_racedAgainst_Averages
                      ? weights.race_averages_racedAgainst_Averages
                      : 0,
                    horseBetterThanRaceTheshold?.race_maxes_racedAgainst_Averages
                      ? weights.race_maxes_racedAgainst_Averages
                      : 0,
                    horseBetterThanRaceTheshold?.race_averages_racedAgainst_Beaten
                      ? weights.race_averages_racedAgainst_Beaten
                      : 0,
                    horseBetterThanRaceTheshold?.race_maxes_racedAgainst_Beaten
                      ? weights.race_maxes_racedAgainst_Beaten
                      : 0,
                    horseBetterThanRaceTheshold?.race_averages_racedAgainst_Beaten_Averages
                      ? weights.race_averages_racedAgainst_Beaten_Averages
                      : 0,
                    horseBetterThanRaceTheshold?.race_maxes_racedAgainst_Beaten_Averages
                      ? weights.race_maxes_racedAgainst_Beaten_Averages
                      : 0,
                    horseBetterThanRaceTheshold?.race_mostRecentForm_racedAgainst_Beaten_Averages
                      ? weights.race_mostRecentForm_racedAgainst_Beaten_Averages
                      : 0,
                    horseBetterThanRaceTheshold?.race_mostRecentForm_racedAgainst_Beaten_Maxes
                      ? weights.race_mostRecentForm_racedAgainst_Beaten_Maxes
                      : 0,
                    horseBetterThanRaceTheshold?.race_min_timePerFurlong
                      ? weights.race_min_timePerFurlong
                      : 0,

                    horseBetterThanRaceTheshold?.race_handicapped_rpr
                      ? weights.race_handicapped_rpr
                      : 0,

                    horseBetterThanRaceTheshold?.handicapped_maxes_racedAgainst_Beaten_rpr
                      ? weights.handicapped_maxes_racedAgainst_Beaten_rpr
                      : 0,

                    horseBetterThanRaceTheshold?.handicapped_maxes_racedAgainst_Beaten_Averages_rpr
                      ? weights.handicapped_maxes_racedAgainst_Beaten_Averages_rpr
                      : 0,

                    horseBetterThanRaceTheshold?.handicapped_maxes_racedAgainst_Beaten_Maxes_rpr
                      ? weights.handicapped_maxes_racedAgainst_Beaten_Maxes_rpr
                      : 0,

                    horseBetterThanRaceTheshold?.handicapped_averages_racedAgainst_Beaten_rpr
                      ? weights.handicapped_averages_racedAgainst_Beaten_rpr
                      : 0,

                    horseBetterThanRaceTheshold?.handicapped_averages_racedAgainst_Beaten_Averages_rpr
                      ? weights.handicapped_averages_racedAgainst_Beaten_Averages_rpr
                      : 0,

                    horseBetterThanRaceTheshold?.handicapped_averages_racedAgainst_Beaten_Maxes_rpr
                      ? weights.handicapped_averages_racedAgainst_Beaten_Maxes_rpr
                      : 0,

                    horseBetterThanRaceTheshold?.handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr
                      ? weights.handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr
                      : 0,

                    horseBetterThanRaceTheshold?.handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr
                      ? weights.handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr
                      : 0,

                    horseFormAveragesStatsGood?.distance
                      ? weights.hfa_distance
                      : 0,
                    horseFormAveragesStatsGood?.goingCode
                      ? weights.hfa_goingCode
                      : 0,
                    horseFormAveragesStatsGood?.jockey ? weights.hfa_jockey : 0,
                    horseRacedWith?.jockey ? weights.hrw_jockey : 0,
                    horseRacedWith?.goingCode ? weights.hrw_goingCode : 0,
                    horseRacedWith?.lastRan ? weights.hrw_lastRan : 0,
                    horseRacedWith?.distance ? weights.hrw_distance : 0,
                  ]
                    ?.filter(Boolean)
                    .reduce<number>((a, b) => a + b, 0) || 0;

                const totalScorePossible = Object.values(weights).reduce(
                  (a, b) => a + b,
                  0
                );

                const scoreObj: ScoreObj = {
                  total: (total / totalScorePossible) * 100,
                  horseRacedWith,
                  horseBetterThanRaceTheshold,
                  horseFormAveragesStatsGood,
                };

                console.log(
                  "horse scoreObj",
                  horse.name,
                  scoreObj,
                  handicappedStats,
                  raceThresholds
                );
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
              (horse) =>
                (horse.scoreObj?.total || 0) >= scoreToBeBetterThan &&
                horse.scoreObj?.horseRacedWith?.lastRan
            );

            const raceHasFinsihed =
              date === new Date().toISOString().split("T")[0] &&
              new Date(
                `${date} ${normalizeTime(race.time).split(":").join(":")}`
              ).getTime() < new Date().getTime();

            return (
              ratioWithFormsGood && someHorseHasMaxScore && !raceHasFinsihed
            );
          });

          return showInfo ? hasARaceWithHorseScoreMax : true;
        })
        ?.map((meeting) => (
          <MeetingComponent
            key={meeting.trackId}
            meeting={meeting}
            results={results}
            showInfo={showInfo}
            date={date}
          />
        ))}
    </div>
  );
}
