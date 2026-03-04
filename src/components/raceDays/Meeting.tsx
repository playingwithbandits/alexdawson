import { Meeting as MeetingType } from "@/types/raceday";

import { Race } from "./Race";
import { RaceResults } from "@/types/racing";
import { normalizeTime } from "../horse/DayPredictions";
import { getWarningMessage, horseHasRequiredStats } from "./Horse";

interface MeetingProps {
  meeting: MeetingType;
  results: RaceResults | undefined;
  showInfo: boolean;
  date: string;
  missingLenThreshold: number;
}

export function Meeting({
  meeting,
  results,
  showInfo,
  date,
  missingLenThreshold,
}: MeetingProps) {
  return (
    <div className="meeting">
      <span className="font-semibold text-lg text-white">
        {meeting.trackId}
      </span>
      <div className="mt-4 space-y-4">
        {meeting.races
          ?.filter((x) => {
            // const { ratioWithFormsGood, ratioWithHorsesAbove3YearsOldGood } =
            //   getRaceToShowStats(x);

            const raceHasHorseScoreMax = x.horses.some((horse) => {
              const missingStats = getWarningMessage(horse, x).missingStats;

              const missingLen = missingStats.length;
              return missingLen <= missingLenThreshold;
            });

            const raceHasFinsihed =
              date === new Date().toISOString().split("T")[0] &&
              new Date(
                `${date} ${normalizeTime(x.time).split(":").join(":")}`,
              ).getTime() < new Date().getTime();

            return showInfo ? !raceHasFinsihed && raceHasHorseScoreMax : true;
          })
          .map((race, index) => (
            <Race
              key={race.id + index}
              race={race}
              meeting={meeting}
              results={results}
              showInfo={showInfo}
              date={date}
              missingLenThreshold={missingLenThreshold}
            />
          ))}
      </div>
    </div>
  );
}
