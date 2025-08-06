import { Meeting as MeetingType } from "@/types/raceday";

import { Race } from "./Race";

interface MeetingProps {
  meeting: MeetingType;
}

export function Meeting({ meeting }: MeetingProps) {
  return (
    <div className="meeting">
      <span className="font-semibold text-lg text-white">
        {meeting.trackId}
      </span>
      <div className="mt-4 space-y-4">
        {meeting.races.map((race) => (
          <Race key={race.id} race={race} meeting={meeting} />
        ))}
      </div>
    </div>
  );
}
