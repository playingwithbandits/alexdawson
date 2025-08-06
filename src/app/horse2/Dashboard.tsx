import { Meeting, ScoreObj } from "@/types/raceday";
import { Meeting as MeetingComponent } from "@/components/raceDays/Meeting";

export function Dashboard({ data }: { data: Meeting[] }) {
  console.log("Dashboard", data);

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
          const { horsesInfo, goingCodes, distanceF } = race;
          const {
            averages: raceAverages,
            maxes: raceMaxes,
            min: raceMin,
          } = horsesInfo;

          const raceThresholds = {
            rpr: raceMaxes?.rpr * 0.9,

            timePerFurlong: raceMin?.timePerFurlong * 1.1,
            distanceFMin: distanceF * 0.9,
            distanceFMax: distanceF * 1.1,
          };

          return {
            ...race,
            horses: race.horses
              .map((horse) => {
                const {
                  rpr: horseRpr,

                  formInfo: horseFormInfo,
                } = horse;

                const horseBetterThanRaceAverage = {
                  rpr: Boolean(horseRpr) && horseRpr >= raceAverages?.rpr,
                };

                const horseBetterThanRaceTheshold = {
                  rpr: Boolean(horseRpr) && horseRpr >= raceThresholds.rpr,
                  timePerFurlong:
                    Boolean(horseFormInfo?.min?.timePerFurlong) &&
                    horseFormInfo?.min?.timePerFurlong >=
                      raceThresholds.timePerFurlong,
                };

                const horseFormRacedAgainstBeatenBetterThanRaceRacedAgainstBeatenAverage =
                  {
                    rpr:
                      Boolean(
                        horseFormInfo?.averages?.racedAgainst_Beaten?.rpr
                      ) &&
                      horseFormInfo?.averages?.racedAgainst_Beaten?.rpr >
                        raceAverages?.racedAgainst_Beaten?.rpr,
                  };

                const horseFormAveragesStatsGood = {
                  distance:
                    Boolean(horseFormInfo?.averages?.distanceF) &&
                    horseFormInfo?.averages?.distanceF >=
                      raceThresholds.distanceFMin &&
                    horseFormInfo?.averages?.distanceF <=
                      raceThresholds.distanceFMax,
                  goingCode:
                    Boolean(horseFormInfo?.averages?.goingCode) &&
                    goingCodes.includes(horseFormInfo?.averages?.goingCode),
                };

                const total = [
                  ...Object.values(horseBetterThanRaceAverage),
                  ...Object.values(horseBetterThanRaceTheshold),
                  ...Object.values(
                    horseFormRacedAgainstBeatenBetterThanRaceRacedAgainstBeatenAverage
                  ),
                  ...Object.values(horseFormAveragesStatsGood),
                ].filter(Boolean).length;

                const scoreObj: ScoreObj = {
                  total,
                  horseBetterThanRaceAverage,
                  horseBetterThanRaceTheshold,
                  horseFormRacedAgainstBeatenBetterThanRaceRacedAgainstBeatenAverage,
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
      <h1 className="text-2xl font-bold text-white mb-6">Race Day Dashboard</h1>
      {dataWithScoreObj?.map((meeting) => (
        <MeetingComponent key={meeting.trackId} meeting={meeting} />
      ))}
    </div>
  );
}
