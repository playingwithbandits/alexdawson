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

export function oldMeetingsToNewMeetings(oldMeetings: OldMeeting[]): Meeting[] {
  const meetingData: Meeting[] = oldMeetings.map((oldMeeting) => {
    const trackId = oldMeeting?.venue || "-";

    const races: Race[] = oldMeeting.races.map((oldRace) => {
      const id = oldRace.id || "-";
      const distanceF = oldRace.distance;
      const goingCodes =
        oldRace.going?.split("/")?.map((code) => code.toLowerCase().trim()) ||
        [];
      const raceClass = oldRace.class;
      const raceTypeCode = oldRace.raceTypeCode || "-";
      const time = oldRace.time;
      const title = oldRace.title;

      const horses: Horse[] = oldRace.horses.map((oldHorse) => {
        const idStr = oldHorse?.profileUrl;
        const id = idStr.split("horse/")[1].split("/")[0] || "-";
        const name = oldHorse?.name || "-";
        const jockey = oldHorse?.jockey?.name || "-";
        const rpr = parseInt(oldHorse?.rating || "0", 10);

        const form: FormObj[] = (
          oldHorse.allValidFormRowsStatsDataStats?.raw || []
        )?.map((oldForm) => {
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
            goingTypeCode,
            raceOutcomeCode,
            raceClass,
            jockeyShortName,
            rpPostmark,
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
          const racedAgainstInfo: RacedAgainstInfo = {
            rawData: {
              rpr: (runners_all || [])?.map((runner) => runner?.rpr) || [],
            },
            averages: {
              rpr:
                (runners_all || [])?.reduce(
                  (acc, runner) => acc + runner?.rpr,
                  0
                ) / (runners_all || []).length || 0,
            },
            maxes: {
              rpr:
                (runners_all || [])?.reduce(
                  (acc, runner) => acc + runner?.rpr,
                  0
                ) / (runners_all || []).length || 0,
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
          const racedAgainst_BeatenInfo: RacedAgainstInfo = {
            rawData: {
              rpr: (runners_beaten || [])?.map((runner) => runner?.rpr) || [],
            },
            averages: {
              rpr:
                (runners_beaten || [])?.reduce(
                  (acc, runner) => acc + runner?.rpr,
                  0
                ) / (runners_beaten || []).length || 0,
            },
            maxes: {
              rpr:
                (runners_beaten || [])?.reduce(
                  (acc, runner) => acc + runner?.rpr,
                  0
                ) / (runners_beaten || []).length || 0,
            },
          };

          return {
            id,
            raceDate: formRowValidDate || "-",
            trackId: courseName || "-",
            goingCodes:
              goingTypeCode
                ?.split("/")
                ?.map((code) => code.toLowerCase().trim()) || [],
            position: parseInt(raceOutcomeCode || "0", 10),
            distanceF: lastFormRowDistanceFurlongAccurate || 0,
            jockey: jockeyShortName || "-",
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
          };
        });

        const formInfo: FormInfo = {
          averages: {
            rpr:
              form?.filter(Boolean)?.reduce((acc, form) => acc + form.rpr, 0) /
                (form?.filter(Boolean)?.length || 1) || 0,
            distanceF:
              form
                ?.filter(Boolean)
                ?.reduce((acc, form) => acc + form.distanceF, 0) /
                (form?.filter(Boolean)?.length || 1) || 0,
            trackId:
              form
                ?.filter(Boolean)
                ?.reduce(
                  (acc, form, i, arr) =>
                    acc + form.trackId + (i < arr.length - 1 ? "," : ""),
                  ""
                ) || "",
            goingCode:
              form
                ?.filter(Boolean)
                ?.reduce(
                  (acc, form, i, arr) =>
                    acc +
                    form.goingCodes.join(",") +
                    (i < arr.length - 1 ? "," : ""),
                  ""
                ) || "",
            jockey:
              form
                ?.filter(Boolean)
                ?.reduce(
                  (acc, form, i, arr) =>
                    acc + form.jockey + (i < arr.length - 1 ? "," : ""),
                  ""
                ) || "",
            racedAgainst: {
              rpr:
                form
                  ?.filter(Boolean)
                  ?.flatMap((form) =>
                    form.racedAgainstInfo.rawData.rpr.filter(Boolean)
                  )
                  .reduce((acc, rpr) => acc + rpr, 0) /
                  (form?.filter(Boolean)?.length || 1) || 0,
            },
            racedAgainst_Beaten: {
              rpr:
                form
                  ?.filter(Boolean)
                  ?.flatMap((form) =>
                    form.racedAgainst_BeatenInfo.rawData.rpr.filter(Boolean)
                  )
                  .reduce((acc, rpr) => acc + rpr, 0) /
                  (form?.filter(Boolean)?.length || 1) || 0,
            },
          },
          maxes: {
            rpr: Math.max(
              ...(form
                ?.filter(Boolean)
                ?.map((form) => form.rpr)
                .filter(Boolean) || [0])
            ),
            racedAgainst: {
              rpr: Math.max(
                ...(form
                  ?.filter(Boolean)
                  ?.flatMap((form) =>
                    form.racedAgainstInfo.rawData.rpr.filter(Boolean)
                  ) || [0])
              ),
            },
            racedAgainst_Beaten: {
              rpr: Math.max(
                ...(form
                  ?.filter(Boolean)
                  ?.flatMap((form) =>
                    form.racedAgainst_BeatenInfo.rawData.rpr.filter(Boolean)
                  ) || [0])
              ),
            },
          },
          min: {
            timePerFurlong: Math.min(
              ...(form
                ?.filter(Boolean)
                ?.map((form) => form.timePerFurlong)
                .filter(Boolean) || [0])
            ),
          },
          rawData: {
            rpr:
              form
                ?.filter(Boolean)
                ?.map((form) => form.rpr)
                .filter(Boolean) || [],
            timePerFurlong:
              form
                ?.filter(Boolean)
                ?.map((form) => form.timePerFurlong)
                .filter(Boolean) || [],
            distanceF:
              form
                ?.filter(Boolean)
                ?.map((form) => form.distanceF)
                .filter(Boolean) || [],
            trackId:
              form
                ?.filter(Boolean)
                ?.map((form) => form.trackId)
                .filter(Boolean) || [],
            goingCodes:
              form
                ?.filter(Boolean)
                ?.flatMap((form) => form.goingCodes.filter(Boolean)) || [],
            jockey:
              form
                ?.filter(Boolean)
                ?.map((form) => form.jockey)
                .filter(Boolean) || [],
            racedAgainst: {
              rpr:
                form
                  ?.filter(Boolean)
                  ?.flatMap((form) =>
                    form.racedAgainstInfo.rawData.rpr.filter(Boolean)
                  ) || [],
            },
            racedAgainst_Beaten: {
              rpr:
                form
                  ?.filter(Boolean)
                  ?.flatMap((form) =>
                    form.racedAgainst_BeatenInfo.rawData.rpr.filter(Boolean)
                  ) || [],
            },
          },
        };

        const horse: Horse = {
          form,
          formInfo,
          id,
          jockey,
          name,
          rpr,
        };
        return horse;
      });

      const horsesInfo: RaceHorsesInfo = {
        averages: {
          rpr: 0,
          racedAgainst: {
            rpr: 0,
          },
          racedAgainst_Beaten: {
            rpr: 0,
          },
        },
        maxes: {
          rpr: 0,
          racedAgainst: {
            rpr: 0,
          },
          racedAgainst_Beaten: {
            rpr: 0,
          },
        },
        min: {
          timePerFurlong: 0,
        },
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
        horses,
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
