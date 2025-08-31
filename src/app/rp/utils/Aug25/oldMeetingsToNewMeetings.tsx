import { Meeting as OldMeeting } from "@/types/racing";
import {
  Horse,
  Meeting,
  Race,
  FormObj,
  FormInfo,
  RaceHorsesInfo,
  RacedAgainstForm,
  RacedAgainstInfo,
} from "@/types/raceday";
import {
  analyseSentimentFromComment,
  avg,
  courseNameToTrackId,
  matchRaceTypeCode,
  max,
  min,
  mostFrequentString,
  normaliseGoingToGoingCode,
} from "@/lib/utils";
import { horseNameToKey } from "@/lib/racing/scores/funcs";

export function oldMeetingsToNewMeetings(oldMeetings: OldMeeting[]): Meeting[] {
  const meetingData: Meeting[] = oldMeetings.map((oldMeeting) => {
    const trackId = courseNameToTrackId(oldMeeting?.venue || "-") || "-";

    const races: Race[] = oldMeeting.races.map((oldRace) => {
      const id = oldRace.id || "-";
      const distanceF = oldRace.distance;
      const goingCodes =
        oldRace.going
          ?.split("/")
          ?.map((code) => normaliseGoingToGoingCode(code)) || [];
      const raceClass = oldRace.class;
      const raceTypeCode = oldRace.raceTypeCode || "-";
      const time = oldRace.time;
      const title = oldRace.title;
      const bettingForecast = oldRace.bettingForecast || [];

      const horses: Horse[] = oldRace.horses.map((oldHorse) => {
        const idStr = oldHorse?.profileUrl;
        const id = idStr.split("horse/")[1].split("/")[0] || "-";
        const name = oldHorse?.name || "-";
        const jockey = oldHorse?.jockey?.name || "-";
        const rpr = parseInt(oldHorse?.rating || "0", 10);
        const or = parseInt(oldHorse?.officialRating || "0", 10);

        const removedWrongRaceTypes = (
          oldHorse.allValidFormRowsStatsDataStats?.raw || []
        )?.filter((x) =>
          matchRaceTypeCode(x.matchingFormObj?.raceTypeCode, raceTypeCode)
        );

        const form: FormObj[] = removedWrongRaceTypes?.map((oldForm) => {
          const {
            matchingFormObj,
            formRowValidDate,
            lastFormRowDistanceFurlongAccurate,
            lastRaceStatsObj,
          } = oldForm;

          const { info } = lastRaceStatsObj || {};

          const {
            raceInstanceUid,
            raceTypeCode,
            courseName,
            goingTypeServicesDesc,
            raceOutcomeCode,
            raceClass,
            jockeyStyleName,
            rpPostmark,
            rpCloseUpComment,
          } = matchingFormObj || {};

          const { runners_beaten, runners_all } = lastRaceStatsObj || {};

          const id = raceInstanceUid?.toString() || "-";

          const racedAgainstRaw: RacedAgainstForm[] = (runners_all || [])?.map(
            (runner) => ({
              id: runner?.name || "-",
              name: runner?.name || "-",
              position: runner?.position || 0,
              distanceToWinner: runner?.distanceBeaten || 0,
              rpr: runner?.rpr || 0,
            })
          );

          const rawRprData =
            (runners_all || [])?.map((runner) => runner?.rpr).filter(Boolean) ||
            [];
          const racedAgainstInfo: RacedAgainstInfo = {
            rawData: {
              rpr: rawRprData || [],
            },
            averages: {
              rpr: avg(rawRprData),
            },
            maxes: {
              rpr: max(rawRprData),
            },
          };

          const racedAgainst_Beaten: RacedAgainstForm[] = (
            runners_beaten || []
          )?.map((runner) => ({
            id: runner?.name || "-",
            name: runner?.name || "-",
            position: runner?.position || 0,
            distanceToWinner: runner?.distanceBeaten || 0,
            rpr: runner?.rpr || 0,
          }));

          const rawRprData_Beaten =
            (runners_beaten || [])
              ?.map((runner) => runner?.rpr)
              .filter(Boolean) || [];

          const racedAgainst_BeatenInfo: RacedAgainstInfo = {
            rawData: {
              rpr: rawRprData_Beaten || [],
            },
            averages: {
              rpr: avg(rawRprData_Beaten),
            },
            maxes: {
              rpr: max(rawRprData_Beaten),
            },
          };

          return {
            id,
            raceDate: formRowValidDate || "-",
            trackId: courseNameToTrackId(courseName || "-"),
            goingCodes:
              goingTypeServicesDesc
                ?.split("/")
                ?.map((code) => normaliseGoingToGoingCode(code)) || [],
            position: parseInt(raceOutcomeCode || "0", 10),
            distanceF: lastFormRowDistanceFurlongAccurate || 0,
            jockey: jockeyStyleName || "-",
            raceClass: raceClass || 0,

            timePerFurlong: info?.timePerFurlong || 0,
            totalRaceTime: info?.winningTimeSeconds || 0,
            raceType: raceTypeCode || "-",
            raceTypeCode: raceTypeCode || "-",

            rpr: rpPostmark || 0,

            racedAgainstRaw,
            racedAgainstInfo,
            racedAgainst_Beaten,
            racedAgainst_BeatenInfo,
            comment: rpCloseUpComment || "-",
            commentMatchedTerms:
              analyseSentimentFromComment(rpCloseUpComment || "")
                .matchedTerms || {},
          };
        });

        const rawRprData = form?.map((form) => form.rpr).filter(Boolean) || [];
        const rawDistanceFData =
          form?.map((form) => form.distanceF).filter(Boolean) || [];
        const rawTrackIdData =
          form
            ?.map((form) => courseNameToTrackId(form.trackId || "-"))
            .filter(Boolean) || [];
        const rawGoingCodesData =
          form?.flatMap((form) => form.goingCodes).filter(Boolean) || [];
        const rawJockeyData =
          form?.map((form) => form.jockey).filter(Boolean) || [];
        const rawTimePerFurlongData =
          form?.map((form) => form.timePerFurlong).filter(Boolean) || [];

        const rawRprData_RacedAgainst =
          form
            ?.flatMap((form) => form.racedAgainstInfo?.rawData?.rpr)
            .filter(Boolean) || [];

        const rawRprData_RacedAgainst_Beaten =
          form
            ?.flatMap((form) => form.racedAgainst_BeatenInfo?.rawData?.rpr)
            .filter(Boolean) || [];

        const rawRprAveragesData_RacedAgainst =
          form
            ?.map((form) => form.racedAgainstInfo?.averages?.rpr)
            .filter(Boolean) || [];

        const rawRprAveragesData_RacedAgainst_Beaten =
          form
            ?.map((form) => form.racedAgainst_BeatenInfo?.averages?.rpr)
            .filter(Boolean) || [];

        const rawRprMaxesData_RacedAgainst =
          form
            ?.map((form) => form.racedAgainstInfo?.maxes?.rpr)
            .filter(Boolean) || [];
        const rawRprMaxesData_RacedAgainst_Beaten =
          form
            ?.map((form) => form.racedAgainst_BeatenInfo?.maxes?.rpr)
            .filter(Boolean) || [];

        const formInfo: FormInfo = {
          averages: {
            rpr: avg(rawRprData),
            distanceF: avg(rawDistanceFData),
            trackIds: mostFrequentString(rawTrackIdData),
            goingCodes: mostFrequentString(rawGoingCodesData),
            jockeys: mostFrequentString(rawJockeyData),

            racedAgainst: {
              rpr: avg(rawRprData_RacedAgainst),
            },
            racedAgainst_Beaten: {
              rpr: avg(rawRprData_RacedAgainst_Beaten),
            },

            racedAgainst_Averages: {
              rpr: avg(rawRprAveragesData_RacedAgainst),
            },
            racedAgainst_Beaten_Averages: {
              rpr: avg(rawRprAveragesData_RacedAgainst_Beaten),
            },
            racedAgainst_Maxes: {
              rpr: max(rawRprMaxesData_RacedAgainst),
            },
            racedAgainst_Beaten_Maxes: {
              rpr: avg(rawRprMaxesData_RacedAgainst_Beaten),
            },
          },
          maxes: {
            rpr: max(rawRprData),

            racedAgainst: {
              rpr: max(rawRprData_RacedAgainst),
            },
            racedAgainst_Beaten: {
              rpr: max(rawRprData_RacedAgainst_Beaten),
            },
            racedAgainst_Averages: {
              rpr: max(rawRprAveragesData_RacedAgainst),
            },
            racedAgainst_Beaten_Averages: {
              rpr: max(rawRprAveragesData_RacedAgainst_Beaten),
            },
            racedAgainst_Maxes: {
              rpr: max(rawRprMaxesData_RacedAgainst),
            },
            racedAgainst_Beaten_Maxes: {
              rpr: max(rawRprMaxesData_RacedAgainst_Beaten),
            },
          },
          min: {
            timePerFurlong: min(rawTimePerFurlongData),
          },
          rawData: {
            rpr: rawRprData || [],
            timePerFurlong: rawTimePerFurlongData || [],
            distanceF: rawDistanceFData || [],
            trackIds: rawTrackIdData || [],
            goingCodes: rawGoingCodesData || [],
            jockeys: rawJockeyData || [],
            racedAgainst: {
              rpr: rawRprData_RacedAgainst || [],
            },
            racedAgainst_Beaten: {
              rpr: rawRprData_RacedAgainst_Beaten || [],
            },
            racedAgainst_Averages: {
              rpr: rawRprAveragesData_RacedAgainst || [],
            },
            racedAgainst_Beaten_Averages: {
              rpr: rawRprAveragesData_RacedAgainst_Beaten || [],
            },
            racedAgainst_Maxes: {
              rpr: rawRprMaxesData_RacedAgainst || [],
            },
            racedAgainst_Beaten_Maxes: {
              rpr: rawRprMaxesData_RacedAgainst_Beaten || [],
            },
          },
        };

        const mostRecentForm =
          form.length > 0
            ? form?.sort((a, b) => {
                const aDate = new Date(a.raceDate);
                const bDate = new Date(b.raceDate);
                return bDate.getTime() - aDate.getTime();
              })[0]
            : undefined;

        const lastRanDate =
          form.length > 0
            ? form?.sort((a, b) => {
                const aDate = new Date(a.raceDate);
                const bDate = new Date(b.raceDate);
                return bDate.getTime() - aDate.getTime();
              })[0].raceDate
            : undefined;

        const lastRan = lastRanDate
          ? Math.floor(
              (new Date().getTime() - new Date(lastRanDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0;

        const horse: Horse = {
          form,
          formInfo,
          id,
          jockey,
          name,
          rpr,
          or,
          mostRecentForm,
          oddsDecimal:
            bettingForecast?.find(
              (bet) => horseNameToKey(bet.horseName) === horseNameToKey(name)
            )?.decimalOdds || 0,
          lastRan,
        };
        return horse;
      });

      const raw_race_rpr =
        horses?.map((horse) => horse.rpr || 0).filter(Boolean) || [];

      const raw_race_min_timePerFurlong =
        horses
          ?.map((horse) => horse.formInfo.min.timePerFurlong || 0)
          .filter(Boolean) || [];

      const raw_race_averages_racedAgainst =
        horses
          ?.map((horse) => horse.formInfo?.averages?.racedAgainst?.rpr || 0)
          .filter(Boolean) || [];

      const raw_race_maxes_racedAgainst =
        horses
          ?.map((horse) => horse.formInfo?.maxes?.racedAgainst?.rpr || 0)
          .filter(Boolean) || [];

      const raw_race_averages_racedAgainst_Averages =
        horses
          ?.map(
            (horse) => horse.formInfo?.averages?.racedAgainst_Averages?.rpr || 0
          )
          .filter(Boolean) || [];

      const raw_race_maxes_racedAgainst_Averages =
        horses
          ?.map(
            (horse) => horse.formInfo?.maxes?.racedAgainst_Averages?.rpr || 0
          )
          .filter(Boolean) || [];

      const raw_race_averages_racedAgainst_Beaten =
        horses
          ?.map(
            (horse) => horse.formInfo?.averages?.racedAgainst_Beaten?.rpr || 0
          )
          .filter(Boolean) || [];

      const raw_race_maxes_racedAgainst_Beaten =
        horses
          ?.map((horse) => horse.formInfo?.maxes?.racedAgainst_Beaten?.rpr || 0)
          .filter(Boolean) || [];

      const raw_race_averages_racedAgainst_Beaten_Averages =
        horses
          ?.map(
            (horse) =>
              horse.formInfo?.averages?.racedAgainst_Beaten_Averages?.rpr || 0
          )
          .filter(Boolean) || [];

      const raw_race_maxes_racedAgainst_Beaten_Averages =
        horses
          ?.map(
            (horse) =>
              horse.formInfo?.maxes?.racedAgainst_Beaten_Averages?.rpr || 0
          )
          .filter(Boolean) || [];

      const raw_race_mostRecentForm_racedAgainst_Beaten_Averages =
        horses
          ?.map(
            (horse) =>
              horse.mostRecentForm?.racedAgainst_BeatenInfo?.averages?.rpr || 0
          )
          .filter(Boolean) || [];

      const raw_race_mostRecentForm_racedAgainst_Beaten_Maxes =
        horses
          ?.map(
            (horse) =>
              horse.mostRecentForm?.racedAgainst_BeatenInfo?.maxes?.rpr || 0
          )
          .filter(Boolean) || [];

      const raw_race_or =
        horses?.map((horse) => horse.or || 0).filter(Boolean) || [];

      const raw_race_data = {
        raw_race_rpr,
        raw_race_or,
        raw_race_min_timePerFurlong,
        raw_race_averages_racedAgainst,
        raw_race_maxes_racedAgainst,
        raw_race_averages_racedAgainst_Averages,
        raw_race_maxes_racedAgainst_Averages,
        raw_race_averages_racedAgainst_Beaten,
        raw_race_maxes_racedAgainst_Beaten,
        raw_race_averages_racedAgainst_Beaten_Averages,
        raw_race_maxes_racedAgainst_Beaten_Averages,
        raw_race_mostRecentForm_racedAgainst_Beaten_Averages,
        raw_race_mostRecentForm_racedAgainst_Beaten_Maxes,
      };

      const raw_race_data_avg = {
        race_rpr: avg(raw_race_data.raw_race_rpr),
        race_or: avg(raw_race_data.raw_race_or),
        race_min_timePerFurlong: avg(raw_race_data.raw_race_min_timePerFurlong),
        race_averages_racedAgainst: avg(
          raw_race_data.raw_race_averages_racedAgainst
        ),
        race_maxes_racedAgainst: avg(raw_race_data.raw_race_maxes_racedAgainst),
        race_averages_racedAgainst_Averages: avg(
          raw_race_data.raw_race_averages_racedAgainst_Averages
        ),
        race_maxes_racedAgainst_Averages: avg(
          raw_race_data.raw_race_maxes_racedAgainst_Averages
        ),
        race_averages_racedAgainst_Beaten: avg(
          raw_race_data.raw_race_averages_racedAgainst_Beaten
        ),
        race_maxes_racedAgainst_Beaten: avg(
          raw_race_data.raw_race_maxes_racedAgainst_Beaten
        ),
        race_averages_racedAgainst_Beaten_Averages: avg(
          raw_race_data.raw_race_averages_racedAgainst_Beaten_Averages
        ),
        race_maxes_racedAgainst_Beaten_Averages: avg(
          raw_race_data.raw_race_maxes_racedAgainst_Beaten_Averages
        ),
        race_mostRecentForm_racedAgainst_Beaten_Averages: avg(
          raw_race_data.raw_race_mostRecentForm_racedAgainst_Beaten_Averages
        ),
        race_mostRecentForm_racedAgainst_Beaten_Maxes: avg(
          raw_race_data.raw_race_mostRecentForm_racedAgainst_Beaten_Maxes
        ),
      };

      const raw_race_data_maxes = {
        race_rpr: max(raw_race_data.raw_race_rpr),
        race_or: max(raw_race_data.raw_race_or),
        race_min_timePerFurlong: max(raw_race_data.raw_race_min_timePerFurlong),
        race_averages_racedAgainst: max(
          raw_race_data.raw_race_averages_racedAgainst
        ),
        race_maxes_racedAgainst: max(raw_race_data.raw_race_maxes_racedAgainst),
        race_averages_racedAgainst_Averages: max(
          raw_race_data.raw_race_averages_racedAgainst_Averages
        ),
        race_maxes_racedAgainst_Averages: max(
          raw_race_data.raw_race_maxes_racedAgainst_Averages
        ),
        race_averages_racedAgainst_Beaten: max(
          raw_race_data.raw_race_averages_racedAgainst_Beaten
        ),
        race_maxes_racedAgainst_Beaten: max(
          raw_race_data.raw_race_maxes_racedAgainst_Beaten
        ),
        race_averages_racedAgainst_Beaten_Averages: max(
          raw_race_data.raw_race_averages_racedAgainst_Beaten_Averages
        ),
        race_maxes_racedAgainst_Beaten_Averages: max(
          raw_race_data.raw_race_maxes_racedAgainst_Beaten_Averages
        ),
        race_mostRecentForm_racedAgainst_Beaten_Averages: max(
          raw_race_data.raw_race_mostRecentForm_racedAgainst_Beaten_Averages
        ),
        race_mostRecentForm_racedAgainst_Beaten_Maxes: max(
          raw_race_data.raw_race_mostRecentForm_racedAgainst_Beaten_Maxes
        ),
      };

      const raw_race_data_min = {
        race_min_timePerFurlong: min(raw_race_data.raw_race_min_timePerFurlong),
      };

      const horsesInfo: RaceHorsesInfo = {
        averages: raw_race_data_avg,
        maxes: raw_race_data_maxes,
        min: raw_race_data_min,
        rawData: raw_race_data,
      };

      const race: Race = {
        distanceF,
        goingCodes,
        horsesInfo,
        id,
        raceClass,
        raceTypeCode,
        time,
        title,
        horses: horses.map((horse) => {
          const { or: horseOr, rpr: horseRpr } = horse;
          const maxRaceOr = horsesInfo.maxes.race_or;

          const handicapBonus = horseOr && maxRaceOr ? maxRaceOr - horseOr : 0;

          return {
            ...horse,
            handicapBonus,
            handicappedRpr: horseRpr + handicapBonus,
          };
        }),
      };
      return race;
    });

    const meeting: Meeting = {
      races,
      trackId,
    };
    return meeting;
  });

  return meetingData;
}
