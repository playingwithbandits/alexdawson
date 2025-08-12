import { Meeting as MeetingType } from "@/types/raceday";

import { getRaceToShowStats, Race } from "./Race";
import { RaceResults } from "@/types/racing";

interface MeetingProps {
  meeting: MeetingType;
  results: RaceResults | undefined;
  showInfo: boolean;
}

export function Meeting({ meeting, results, showInfo }: MeetingProps) {
  return (
    <div className="meeting">
      <span className="font-semibold text-lg text-white">
        {meeting.trackId}
      </span>
      <div className="mt-4 space-y-4">
        {meeting.races
          ?.filter((x) => {
            const { ratioWithFormsGood, scoreToBeBetterThan } =
              getRaceToShowStats(x);

            const raceHasHorseScoreMax = x.horses.some((horse) => {
              return (horse.scoreObj?.total || 0) >= scoreToBeBetterThan;
            });
            return showInfo ? ratioWithFormsGood && raceHasHorseScoreMax : true;
          })
          .map((race) => (
            <Race
              key={race.id}
              race={race}
              meeting={meeting}
              results={results}
              showInfo={showInfo}
            />
          ))}
      </div>
    </div>
  );
}
