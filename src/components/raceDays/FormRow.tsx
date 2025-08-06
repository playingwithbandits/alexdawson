import {
  FormObj,
  Horse as HorseType,
  Race as RaceType,
  Meeting as MeetingType,
} from "@/types/raceday";
import { time } from "console";
import { twMerge } from "tailwind-merge";

interface FormProps {
  form: FormObj;
  horse: HorseType;
  race: RaceType;
  meeting: MeetingType;
}

export function FormRow({ form, horse, race, meeting }: FormProps) {
  const { trackId } = meeting;
  const { goingCodes, distanceF, raceTypeCode, raceClass } = race;

  const {
    distanceF: formDistanceF,
    goingCodes: formGoingCodes,
    id,
    jockey,
    raceClass: formRaceClass,
    raceTypeCode: formRaceRaceCode,
    racedAgainstInfo,
    racedAgainstRaw,
    racedAgainst_Beaten,
    racedAgainst_BeatenInfo,
    rpr,
    timePerFurlong,
    totalRaceTime,
    trackId: formTrackId,
    raceDate,
    position,
  } = form;

  return (
    <tr className="">
      <td className="px-4 py-2 ">{raceDate}</td>
      <td className={"px-4 py-2"}>{formTrackId}</td>
      <td className="px-4 py-2 ">
        {position} | {racedAgainstRaw?.length}
      </td>
      <td className="px-4 py-2 ">{formRaceRaceCode}</td>
      <td className="px-4 py-2 ">{formGoingCodes}</td>
      <td className="px-4 py-2 ">{jockey}</td>

      <td className="px-4 py-2 ">{formDistanceF?.toFixed(2)}</td>
      <td className="px-4 py-2 ">{timePerFurlong?.toFixed(2)}</td>

      <td className="px-4 py-2 ">{rpr}</td>

      <td className="px-4 py-2 ">
        {racedAgainstInfo.averages.rpr?.toFixed(2)}
      </td>
      <td className="px-4 py-2 ">{racedAgainstInfo.maxes.rpr?.toFixed(2)}</td>
      <td className="px-4 py-2 ">
        {racedAgainst_BeatenInfo.averages.rpr?.toFixed(2)}
      </td>
      <td className="px-4 py-2 ">
        {racedAgainst_BeatenInfo.maxes.rpr?.toFixed(2)}
      </td>
    </tr>
  );
}
