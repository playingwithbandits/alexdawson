import { Meeting, ScoreObj } from "@/types/raceday";
import { Meeting as MeetingComponent } from "@/components/raceDays/Meeting";
import { horseNameToKey } from "@/lib/racing/scores/funcs";
import {
  compareTwoGoingCodeArrays,
  courseNameToTrackId,
  distanceOkay,
  matchRaceTypeCode,
  max,
} from "@/lib/utils";
import { RaceResults } from "@/types/racing";
import { useState } from "react";
import { getRaceToShowStats } from "@/components/raceDays/Race";
import { normalizeTime } from "@/components/horse/DayPredictions";
import { horseHasRequiredStats } from "@/components/raceDays/Horse";

// race_rpr: 184,
// race_maxes_racedAgainst: 114,
// race_min_timePerFurlong: 190,
// race_handicapped_rpr: 140,
// handicapped_maxes_racedAgainst_Beaten_rpr: 140,
// handicapped_maxes_racedAgainst_Beaten_Maxes_rpr: 140,
// handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr: 76,
// handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr: 121,
// hfa_distance: 162,
// hrw_goingCode: 145,
// hrw_lastRan: 173,
// hrw_distance: 185,
// hrf_type: 136,
// hrf_distance: 159,
// handicapped_averages_racedAgainst_Beaten_rpr: 119,
// hrf_going: 81,
// race_averages_racedAgainst: 119,
// race_averages_racedAgainst_Averages: 125,
// race_maxes_racedAgainst_Averages: 120,
// hfa_goingCode: 111,
// hrw_jockey: 105,
// race_averages_racedAgainst_Beaten: 122,
// race_maxes_racedAgainst_Beaten: 150,
// race_averages_racedAgainst_Beaten_Averages: 117,
// race_maxes_racedAgainst_Beaten_Averages: 102,
// race_mostRecentForm_racedAgainst_Beaten_Averages: 80,
// race_mostRecentForm_racedAgainst_Beaten_Maxes: 126,
// handicapped_maxes_racedAgainst_Beaten_Averages_rpr: 97,
// handicapped_averages_racedAgainst_Beaten_Averages_rpr: 114,
// handicapped_averages_racedAgainst_Beaten_Maxes_rpr: 125,
// hfa_jockey: 90,
const weights = {
  race_averages_racedAgainstMaxes: 1,
  handicapped_race_averages_racedAgainstMaxes: 1,
  race_rpr: 1,
  race_maxes_racedAgainst: 1,
  race_min_timePerFurlong: 1,
  race_handicapped_rpr: 1,
  handicapped_maxes_racedAgainst_Beaten_rpr: 1,
  handicapped_maxes_racedAgainst_Beaten_Maxes_rpr: 1,
  handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr: 1,
  handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr: 1,
  hfa_distance: 1,
  hrw_goingCode: 1,
  hrw_lastRan: 1,
  hrw_distance: 1,
  hrf_type: 1,
  hrf_distance: 1,
  handicapped_averages_racedAgainst_Beaten_rpr: 1,
  hrf_going: 1,
  race_averages_racedAgainst: 1,
  race_averages_racedAgainst_Averages: 1,
  race_maxes_racedAgainst_Averages: 1,
  hfa_goingCode: 1,
  hrw_jockey: 1,
  race_averages_racedAgainst_Beaten: 1,
  race_maxes_racedAgainst_Beaten: 1,
  race_averages_racedAgainst_Beaten_Averages: 1,
  race_maxes_racedAgainst_Beaten_Averages: 1,
  race_mostRecentForm_racedAgainst_Beaten_Averages: 1,
  race_mostRecentForm_racedAgainst_Beaten_Maxes: 1,
  handicapped_maxes_racedAgainst_Beaten_Averages_rpr: 1,
  handicapped_averages_racedAgainst_Beaten_Averages_rpr: 1,
  handicapped_averages_racedAgainst_Beaten_Maxes_rpr: 1,
  hfa_jockey: 1,

  hrw_raceTypeCode: 1,
  hfa_raceTypeCode: 1,
};

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
  const [thresholdValue, setThresholdValue] = useState(0.85);

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
          const { horsesInfo, goingCodes, raceTypeCode, distanceF } = race;
          const { maxes: raceMaxes, min: raceMin } = horsesInfo;

          const raw_handicapped_rpr = race.horses.map(
            (horse) => horse.handicappedRpr || 0,
          );

          const raw_handicapped_maxes_racedAgainst_Beaten_rpr = race.horses.map(
            (horse) =>
              (horse.formInfo?.maxes?.racedAgainst_Beaten?.rpr || 0) +
              (horse.handicapBonus || 0),
          );
          const raw_handicapped_maxes_racedAgainst_Beaten_Averages_rpr =
            race.horses.map(
              (horse) =>
                (horse.formInfo?.maxes?.racedAgainst_Beaten_Averages?.rpr ||
                  0) + (horse.handicapBonus || 0),
            );

          const raw_handicapped_maxes_racedAgainst_Beaten_Maxes_rpr =
            race.horses.map(
              (horse) =>
                (horse.formInfo?.maxes?.racedAgainst_Beaten_Maxes?.rpr || 0) +
                (horse.handicapBonus || 0),
            );

          const raw_handicapped_averages_racedAgainst_Beaten_rpr =
            race.horses.map(
              (horse) =>
                (horse.formInfo?.averages?.racedAgainst_Beaten?.rpr || 0) +
                (horse.handicapBonus || 0),
            );

          const raw_handicapped_averages_racedAgainst_Beaten_Averages_rpr =
            race.horses.map(
              (horse) =>
                (horse.formInfo?.averages?.racedAgainst_Beaten_Averages?.rpr ||
                  0) + (horse.handicapBonus || 0),
            );

          const raw_handicapped_averages_racedAgainst_Beaten_Maxes_rpr =
            race.horses.map(
              (horse) =>
                (horse.formInfo?.averages?.racedAgainst_Beaten_Maxes?.rpr ||
                  0) + (horse.handicapBonus || 0),
            );

          const raw_handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr =
            race.horses.map(
              (horse) =>
                (horse.mostRecentForm?.racedAgainst_BeatenInfo?.averages?.rpr ||
                  0) + (horse.handicapBonus || 0),
            );

          const raw_handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr =
            race.horses.map(
              (horse) =>
                (horse.mostRecentForm?.racedAgainst_BeatenInfo?.maxes?.rpr ||
                  0) + (horse.handicapBonus || 0),
            );

          const maxRaceHandicappedRpr = max(raw_handicapped_rpr);
          const maxRaceHandicappedMaxesRacedAgainstBeatenRpr = max(
            raw_handicapped_maxes_racedAgainst_Beaten_rpr,
          );
          const maxRaceHandicappedMaxesRacedAgainstBeatenAveragesRpr = max(
            raw_handicapped_maxes_racedAgainst_Beaten_Averages_rpr,
          );
          const maxRaceHandicappedMaxesRacedAgainstBeatenMaxesRpr = max(
            raw_handicapped_maxes_racedAgainst_Beaten_Maxes_rpr,
          );
          const maxRaceHandicappedAveragesRacedAgainstBeatenRpr = max(
            raw_handicapped_averages_racedAgainst_Beaten_rpr,
          );
          const maxRaceHandicappedAveragesRacedAgainstBeatenAveragesRpr = max(
            raw_handicapped_averages_racedAgainst_Beaten_Averages_rpr,
          );
          const maxRaceHandicappedAveragesRacedAgainstBeatenMaxesRpr = max(
            raw_handicapped_averages_racedAgainst_Beaten_Maxes_rpr,
          );

          const maxRaceHandicappedMostRecentFormRacedAgainstBeatenAveragesRpr =
            max(
              raw_handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr,
            );
          const maxRaceHandicappedMostRecentFormRacedAgainstBeatenMaxesRpr =
            max(raw_handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr);

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

            race_min_timePerFurlong: raceMin?.race_min_timePerFurlong + 0.5,

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

            race_averages_racedAgainstMaxes:
              raceMaxes?.race_averages_racedAgainstMaxes * thresholdValue,

            race_maxes_racedAgainstMaxes:
              raceMaxes?.race_maxes_racedAgainstMaxes * thresholdValue,

            race_formAverages_rpr:
              raceMaxes?.race_formAverages_rpr * thresholdValue,

            race_allBeatenHorsesNowGoneOntoStats_maxes_rpr:
              raceMaxes?.race_allBeatenHorsesNowGoneOntoStats_maxes_rpr *
              thresholdValue,
            race_allBeatenHorsesNowGoneOntoStats_maxes_or:
              raceMaxes?.race_allBeatenHorsesNowGoneOntoStats_maxes_or *
              thresholdValue,

            race_allBeatenHorsesNowGoneOntoStats_avgs_rpr:
              raceMaxes?.race_allBeatenHorsesNowGoneOntoStats_avgs_rpr *
              thresholdValue,
            race_allBeatenHorsesNowGoneOntoStats_avgs_or:
              raceMaxes?.race_allBeatenHorsesNowGoneOntoStats_avgs_or *
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

                  race_averages_racedAgainstMaxes: boolean;

                  race_maxes_racedAgainstMaxes: boolean;
                  race_formAverages_rpr: boolean;

                  race_allBeatenHorsesNowGoneOntoStats_maxes_rpr: boolean;
                  race_allBeatenHorsesNowGoneOntoStats_maxes_or: boolean;
                  race_allBeatenHorsesNowGoneOntoStats_avgs_rpr: boolean;
                  race_allBeatenHorsesNowGoneOntoStats_avgs_or: boolean;
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
                      horseFormAverages?.racedAgainst_Beaten_Averages?.rpr,
                    ) &&
                    horseFormAverages.racedAgainst_Beaten_Averages.rpr >=
                      raceThresholds.race_averages_racedAgainst_Beaten_Averages,

                  race_maxes_racedAgainst_Beaten_Averages:
                    Boolean(
                      horseFormMaxes?.racedAgainst_Beaten_Averages?.rpr,
                    ) &&
                    horseFormMaxes.racedAgainst_Beaten_Averages.rpr >=
                      raceThresholds.race_maxes_racedAgainst_Beaten_Averages,

                  race_mostRecentForm_racedAgainst_Beaten_Averages:
                    Boolean(
                      horse.mostRecentForm?.racedAgainst_BeatenInfo?.averages
                        ?.rpr,
                    ) &&
                    (horse.mostRecentForm?.racedAgainst_BeatenInfo?.averages
                      ?.rpr || 0) >=
                      raceThresholds.race_mostRecentForm_racedAgainst_Beaten_Averages,

                  race_mostRecentForm_racedAgainst_Beaten_Maxes:
                    Boolean(
                      horse.mostRecentForm?.racedAgainst_BeatenInfo?.maxes?.rpr,
                    ) &&
                    (horse.mostRecentForm?.racedAgainst_BeatenInfo?.maxes
                      ?.rpr || 0) >=
                      raceThresholds.race_mostRecentForm_racedAgainst_Beaten_Maxes,

                  race_min_timePerFurlong:
                    Boolean(horseFormMin?.timePerFurlong) &&
                    horseFormMin.timePerFurlong <=
                      raceThresholds.race_min_timePerFurlong,

                  race_handicapped_rpr: !Boolean(
                    raceThresholds.race_handicapped_rpr,
                  )
                    ? true
                    : Boolean(handicappedRpr) &&
                      (handicappedRpr || 0) >=
                        raceThresholds.race_handicapped_rpr,

                  handicapped_maxes_racedAgainst_Beaten_rpr: !Boolean(
                    raceThresholds.race_handicapped_maxes_racedAgainst_Beaten_rpr,
                  )
                    ? true
                    : Boolean(
                        handicappedStats.handicapped_maxes_racedAgainst_Beaten_rpr,
                      ) &&
                      (handicappedStats.handicapped_maxes_racedAgainst_Beaten_rpr ||
                        0) >=
                        raceThresholds.race_handicapped_maxes_racedAgainst_Beaten_rpr,

                  handicapped_maxes_racedAgainst_Beaten_Averages_rpr: !Boolean(
                    raceThresholds.race_handicapped_maxes_racedAgainst_Beaten_Averages_rpr,
                  )
                    ? true
                    : Boolean(
                        handicappedStats.handicapped_maxes_racedAgainst_Beaten_Averages_rpr,
                      ) &&
                      (handicappedStats.handicapped_maxes_racedAgainst_Beaten_Averages_rpr ||
                        0) >=
                        raceThresholds.race_handicapped_maxes_racedAgainst_Beaten_Averages_rpr,

                  handicapped_maxes_racedAgainst_Beaten_Maxes_rpr: !Boolean(
                    raceThresholds.race_handicapped_maxes_racedAgainst_Beaten_Maxes_rpr,
                  )
                    ? true
                    : Boolean(
                        handicappedStats.handicapped_maxes_racedAgainst_Beaten_Maxes_rpr,
                      ) &&
                      (handicappedStats.handicapped_maxes_racedAgainst_Beaten_Maxes_rpr ||
                        0) >=
                        raceThresholds.race_handicapped_maxes_racedAgainst_Beaten_Maxes_rpr,

                  handicapped_averages_racedAgainst_Beaten_rpr: !Boolean(
                    raceThresholds.race_handicapped_averages_racedAgainst_Beaten_rpr,
                  )
                    ? true
                    : Boolean(
                        handicappedStats.handicapped_averages_racedAgainst_Beaten_rpr,
                      ) &&
                      (handicappedStats.handicapped_averages_racedAgainst_Beaten_rpr ||
                        0) >=
                        raceThresholds.race_handicapped_averages_racedAgainst_Beaten_rpr,

                  handicapped_averages_racedAgainst_Beaten_Averages_rpr:
                    !Boolean(
                      raceThresholds.race_handicapped_averages_racedAgainst_Beaten_Averages_rpr,
                    )
                      ? true
                      : Boolean(
                          handicappedStats.handicapped_averages_racedAgainst_Beaten_Averages_rpr,
                        ) &&
                        (handicappedStats.handicapped_averages_racedAgainst_Beaten_Averages_rpr ||
                          0) >=
                          raceThresholds.race_handicapped_averages_racedAgainst_Beaten_Averages_rpr,

                  handicapped_averages_racedAgainst_Beaten_Maxes_rpr: !Boolean(
                    raceThresholds.race_handicapped_averages_racedAgainst_Beaten_Maxes_rpr,
                  )
                    ? true
                    : Boolean(
                        handicappedStats.handicapped_averages_racedAgainst_Beaten_Maxes_rpr,
                      ) &&
                      (handicappedStats.handicapped_averages_racedAgainst_Beaten_Maxes_rpr ||
                        0) >=
                        raceThresholds.race_handicapped_averages_racedAgainst_Beaten_Maxes_rpr,

                  handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr:
                    !Boolean(
                      raceThresholds.race_handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr,
                    )
                      ? true
                      : Boolean(
                          handicappedStats.handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr,
                        ) &&
                        (handicappedStats.handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr ||
                          0) >=
                          raceThresholds.race_handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr,

                  handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr:
                    !Boolean(
                      raceThresholds.race_handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr,
                    )
                      ? true
                      : Boolean(
                          handicappedStats.handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr,
                        ) &&
                        (handicappedStats.handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr ||
                          0) >=
                          raceThresholds.race_handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr,

                  race_averages_racedAgainstMaxes:
                    Boolean(horseFormAverages?.racedAgainst_Maxes?.rpr) &&
                    horseFormAverages.racedAgainst_Maxes.rpr >=
                      raceThresholds.race_averages_racedAgainstMaxes,

                  race_maxes_racedAgainstMaxes:
                    Boolean(horseFormMaxes?.racedAgainst_Maxes?.rpr) &&
                    horseFormMaxes.racedAgainst_Maxes.rpr >=
                      raceThresholds.race_maxes_racedAgainstMaxes,

                  race_formAverages_rpr:
                    Boolean(horseFormAverages?.rpr) &&
                    horseFormAverages.rpr >=
                      raceThresholds.race_formAverages_rpr,

                  race_allBeatenHorsesNowGoneOntoStats_maxes_rpr:
                    Boolean(
                      horse.allBeatenHorsesNowGoneOntoStats?.maxes?.rpr,
                    ) &&
                    (horse.allBeatenHorsesNowGoneOntoStats?.maxes?.rpr || 0) >=
                      raceThresholds.race_allBeatenHorsesNowGoneOntoStats_maxes_rpr,

                  race_allBeatenHorsesNowGoneOntoStats_maxes_or:
                    Boolean(horse.allBeatenHorsesNowGoneOntoStats?.maxes?.or) &&
                    (horse.allBeatenHorsesNowGoneOntoStats?.maxes?.or || 0) >=
                      raceThresholds.race_allBeatenHorsesNowGoneOntoStats_maxes_or,

                  race_allBeatenHorsesNowGoneOntoStats_avgs_rpr:
                    Boolean(horse.allBeatenHorsesNowGoneOntoStats?.avgs?.rpr) &&
                    (horse.allBeatenHorsesNowGoneOntoStats?.avgs?.rpr || 0) >=
                      raceThresholds.race_allBeatenHorsesNowGoneOntoStats_avgs_rpr,

                  race_allBeatenHorsesNowGoneOntoStats_avgs_or:
                    Boolean(horse.allBeatenHorsesNowGoneOntoStats?.avgs?.or) &&
                    (horse.allBeatenHorsesNowGoneOntoStats?.avgs?.or || 0) >=
                      raceThresholds.race_allBeatenHorsesNowGoneOntoStats_avgs_or,
                };

                const avgGoingCodes = horseFormInfo?.averages?.goingCodes;
                const avgJockeys = horseFormInfo?.averages?.jockeys;
                const avgDistanceF = horseFormInfo?.averages?.distanceF;
                const avgRaceTypeCodes = horseFormInfo?.averages?.raceTypeCodes;

                const horseFormAveragesStatsGood = {
                  distance: distanceOkay(avgDistanceF, distanceF),
                  goingCode:
                    Boolean(avgGoingCodes) &&
                    compareTwoGoingCodeArrays(goingCodes, avgGoingCodes),

                  jockey:
                    Boolean(avgJockeys) &&
                    avgJockeys?.some(
                      (x) => horseNameToKey(x) === horseNameToKey(jockey),
                    ),

                  raceTypeCode:
                    Boolean(avgRaceTypeCodes) &&
                    avgRaceTypeCodes?.some((x) =>
                      matchRaceTypeCode(x, raceTypeCode),
                    ),
                };

                const horseRacedWith = {
                  track: form
                    ?.map((x) => courseNameToTrackId(x.trackId))
                    .includes(courseNameToTrackId(meeting.trackId)),
                  jockey: form
                    ?.map((x) => horseNameToKey(x.jockey))
                    .includes(horseNameToKey(jockey)),
                  goingCode: form
                    ?.map((f) =>
                      compareTwoGoingCodeArrays(goingCodes, f.goingCodes),
                    )
                    .some((x) => x),
                  lastRan: Boolean(horse.lastRan) && horse.lastRan <= 60,
                  distance: form
                    ?.map((f) => distanceOkay(f.distanceF, distanceF))
                    .some((x) => x),
                  raceTypeCode: form
                    ?.map((f) =>
                      matchRaceTypeCode(f.raceTypeCode, raceTypeCode),
                    )
                    .some((x) => x),
                };

                const horseMostRecentForm = {
                  type: matchRaceTypeCode(
                    horse.mostRecentForm?.raceTypeCode,
                    raceTypeCode,
                  ),
                  distance: distanceOkay(
                    horse.mostRecentForm?.distanceF,
                    distanceF,
                  ),
                  going: compareTwoGoingCodeArrays(
                    horse.mostRecentForm?.goingCodes || [],
                    goingCodes,
                  ),
                };

                const total =
                  [
                    horseBetterThanRaceTheshold?.race_averages_racedAgainstMaxes
                      ? weights.race_averages_racedAgainstMaxes
                      : 0,
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

                    horseFormAveragesStatsGood?.raceTypeCode
                      ? weights.hfa_raceTypeCode
                      : 0,

                    horseRacedWith?.jockey ? weights.hrw_jockey : 0,
                    horseRacedWith?.goingCode ? weights.hrw_goingCode : 0,
                    horseRacedWith?.lastRan ? weights.hrw_lastRan : 0,
                    horseRacedWith?.distance ? weights.hrw_distance : 0,
                    horseRacedWith?.raceTypeCode ? weights.hrw_raceTypeCode : 0,

                    horseMostRecentForm?.type ? weights.hrf_type : 0,
                    horseMostRecentForm?.distance ? weights.hrf_distance : 0,
                    horseMostRecentForm?.going ? weights.hrf_going : 0,
                  ]
                    ?.filter(Boolean)
                    .reduce<number>((a, b) => a + b, 0) || 0;

                const totalScorePossible = Object.values(weights).reduce(
                  (a, b) => a + b,
                  0,
                );

                const scoreObj: ScoreObj = {
                  total: (total / totalScorePossible) * 100,
                  horseRacedWith,
                  horseBetterThanRaceTheshold,
                  horseFormAveragesStatsGood,
                  horseMostRecentForm,

                  raw_data: {
                    raw_handicapped_rpr,
                    raw_handicapped_maxes_racedAgainst_Beaten_rpr,
                    raw_handicapped_maxes_racedAgainst_Beaten_Averages_rpr,
                    raw_handicapped_maxes_racedAgainst_Beaten_Maxes_rpr,
                    raw_handicapped_averages_racedAgainst_Beaten_rpr,
                    raw_handicapped_averages_racedAgainst_Beaten_Averages_rpr,
                    raw_handicapped_averages_racedAgainst_Beaten_Maxes_rpr,
                    raw_handicapped_mostRecentForm_racedAgainst_Beaten_Averages_rpr,
                    raw_handicapped_mostRecentForm_racedAgainst_Beaten_Maxes_rpr,
                  },
                };

                // console.log(
                //   "horse scoreObj",
                //   horse.name,
                //   scoreObj,
                //   handicappedStats,
                //   raceThresholds
                // );
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

  if (results) {
    console.log("🏇 Results found", results);

    const resultsArrScoreObjs = results.results?.map((result) => {
      const matchingRaceHorses = dataWithScoreObj
        .flatMap(
          (meeting) =>
            meeting.races.find(
              (race) => normalizeTime(race.time) === normalizeTime(result.time),
            )?.horses,
        )
        .filter((x) => x);

      const matchingWinner =
        matchingRaceHorses &&
        matchingRaceHorses?.find(
          (horse) =>
            horse &&
            horseNameToKey(horse.name) === horseNameToKey(result.winner.name),
        );

      const matchingPlacedHorses =
        matchingRaceHorses &&
        matchingRaceHorses?.filter(
          (horse) =>
            horse &&
            result.placedHorses.find(
              (placedHorse) =>
                horseNameToKey(placedHorse.name) === horseNameToKey(horse.name),
            ),
        );

      const matchingWinnerScoreObj = matchingWinner?.scoreObj;
      const matchingPlacedScoreObjs = matchingPlacedHorses
        ?.map((horse) => horse?.scoreObj)
        .filter((x) => x);

      // Create weighted score object combining winner and placed horses
      const combinedScoreObj: Record<string, number> = {};

      // Add winner scores with 5x weight
      if (matchingWinnerScoreObj) {
        Object.entries(
          matchingWinnerScoreObj.horseBetterThanRaceTheshold,
        ).forEach(([key, value]) => {
          const newKey = key;
          if (value === true) {
            combinedScoreObj[newKey] = (combinedScoreObj[newKey] || 0) + 5;
          }
        });
        Object.entries(
          matchingWinnerScoreObj.horseFormAveragesStatsGood,
        ).forEach(([key, value]) => {
          const newKey = `hfa_${key}`;
          if (value === true) {
            combinedScoreObj[newKey] = (combinedScoreObj[newKey] || 0) + 5;
          }
        });
        Object.entries(matchingWinnerScoreObj.horseRacedWith).forEach(
          ([key, value]) => {
            const newKey = `hrw_${key}`;
            if (value === true) {
              combinedScoreObj[newKey] = (combinedScoreObj[newKey] || 0) + 5;
            }
          },
        );

        Object.entries(matchingWinnerScoreObj.horseMostRecentForm).forEach(
          ([key, value]) => {
            const newKey = `hrf_${key}`;
            if (value === true) {
              combinedScoreObj[newKey] = (combinedScoreObj[newKey] || 0) + 5;
            }
          },
        );
      }

      // Add placed horses scores with 1x weight
      if (matchingPlacedScoreObjs?.length) {
        matchingPlacedScoreObjs.forEach((scoreObj) => {
          if (scoreObj) {
            // Add null check
            Object.entries(scoreObj.horseBetterThanRaceTheshold).forEach(
              ([key, value]) => {
                const newKey = key;
                if (value === true) {
                  combinedScoreObj[newKey] =
                    (combinedScoreObj[newKey] || 0) + 1;
                }
              },
            );
            Object.entries(scoreObj.horseFormAveragesStatsGood).forEach(
              ([key, value]) => {
                const newKey = `hfa_${key}`;
                if (value === true) {
                  combinedScoreObj[newKey] =
                    (combinedScoreObj[newKey] || 0) + 1;
                }
              },
            );
            Object.entries(scoreObj.horseRacedWith).forEach(([key, value]) => {
              const newKey = `hrw_${key}`;
              if (value === true) {
                combinedScoreObj[newKey] = (combinedScoreObj[newKey] || 0) + 1;
              }
            });
            Object.entries(scoreObj.horseMostRecentForm).forEach(
              ([key, value]) => {
                const newKey = `hrf_${key}`;
                if (value === true) {
                  combinedScoreObj[newKey] =
                    (combinedScoreObj[newKey] || 0) + 1;
                }
              },
            );
          }
        });
      }

      // console.log("🏇 Combined score object loop", {
      //   matchingWinner,
      //   matchingPlacedHorses,
      //   matchingWinnerScoreObj,
      //   matchingPlacedScoreObjs,
      //   combinedScoreObj,
      // });

      return combinedScoreObj;
    });

    resultsArrScoreObjs?.push(weights);

    const combinedResults = resultsArrScoreObjs.reduce(
      (acc, scoreObj) => {
        Object.entries(scoreObj).forEach(([key, value]) => {
          acc[key] = (acc[key] || 0) + value;
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    const highestScore = Object.values(combinedResults).reduce(
      (a, b) => (a > b ? a : b),
      0,
    );

    const combinedResultsPercentage = Object.entries(combinedResults).map(
      ([key, value]) => {
        return {
          [key]: (value / highestScore) * 100,
        };
      },
    );

    const combinedResultsPercentageGroups = {
      low: combinedResultsPercentage.filter(
        (item) => Object.values(item)[0] < 25,
      ),
      midLow: combinedResultsPercentage.filter(
        (item) => Object.values(item)[0] >= 25 && Object.values(item)[0] < 50,
      ),
      medium: combinedResultsPercentage.filter(
        (item) => Object.values(item)[0] >= 50 && Object.values(item)[0] < 75,
      ),
      high: combinedResultsPercentage.filter(
        (item) => Object.values(item)[0] >= 75,
      ),
    };

    console.log("🏇 NEW WEIGHT OBJECT", combinedResults);

    console.log("🏇 Combined score object  Results array", {
      resultsArrScoreObjs,
      combinedResults,
      combinedResultsPercentage,
      combinedResultsPercentageGroups,
    });
  }

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
      <div className="mb-4 p-4 bg-gray-800 rounded-lg">
        <label className="block text-white mb-2">
          Threshold Value: {thresholdValue.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={thresholdValue}
          onChange={(e) => setThresholdValue(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>1</span>
        </div>
      </div>
      {dataWithScoreObj
        ?.filter((x) => {
          const hasARaceWithHorseScoreMax = x.races.some((race) => {
            const { ratioWithFormsGood, ratioWithHorsesAbove3YearsOldGood } =
              getRaceToShowStats(race);

            const someHorseHasMaxScore = race.horses.some((horse) => {
              const requiredStatsGood = horseHasRequiredStats(horse, race);
              return requiredStatsGood;
            });

            const raceHasFinsihed =
              date === new Date().toISOString().split("T")[0] &&
              new Date(
                `${date} ${normalizeTime(race.time).split(":").join(":")}`,
              ).getTime() < new Date().getTime();

            return (
              ratioWithFormsGood &&
              ratioWithHorsesAbove3YearsOldGood &&
              someHorseHasMaxScore &&
              !raceHasFinsihed
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
