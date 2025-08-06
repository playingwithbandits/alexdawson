import { Meeting, ScoreObj } from "@/types/raceday";
import { Meeting as MeetingComponent } from "@/components/raceDays/Meeting";
import { horseNameToKey } from "@/lib/racing/scores/funcs";

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
          const { horsesInfo, goingCodes, distanceF, trackId } = race;
          const { maxes: raceMaxes, min: raceMin } = horsesInfo;

          const raceThresholds = {
            rpr_racedAgainst_Beaten_Averages:
              raceMaxes?.racedAgainst_Beaten_Averages?.rpr * 0.95,
            rpr_racedAgainst_Beaten_Maxes:
              raceMaxes?.racedAgainst_Beaten_Maxes?.rpr * 0.95,

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
                  jockey,
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
                };

                const avgGoingCode = horseFormInfo?.averages?.goingCode;
                const avgJockey = horseFormInfo?.averages?.jockey;
                const avgDistanceF = horseFormInfo?.averages?.distanceF;

                const horseFormAveragesStatsGood = {
                  distance:
                    Boolean(avgDistanceF) &&
                    avgDistanceF >= raceThresholds.distanceFMin &&
                    avgDistanceF <= raceThresholds.distanceFMax,
                  goingCode:
                    Boolean(horseFormInfo?.averages?.goingCode) &&
                    goingCodes?.some((goingCode) => goingCode === avgGoingCode),

                  jockey:
                    Boolean(avgJockey) &&
                    horseNameToKey(avgJockey) === horseNameToKey(jockey),
                };

                const total = [
                  ...Object.values(horseBetterThanRaceTheshold),
                  ...Object.values(horseFormAveragesStatsGood),
                ].filter(Boolean).length;

                const scoreObj: ScoreObj = {
                  total,

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
      <h1 className="text-2xl font-bold text-white mb-6">Race Day Dashboard</h1>
      {dataWithScoreObj?.map((meeting) => (
        <MeetingComponent key={meeting.trackId} meeting={meeting} />
      ))}
    </div>
  );
}
