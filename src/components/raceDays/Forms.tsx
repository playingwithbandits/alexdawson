import {
  FormObj,
  Horse as HorseType,
  Race as RaceType,
  Meeting as MeetingType,
} from "@/types/raceday";
import { FormRow } from "./FormRow";

interface FormProps {
  forms: FormObj[];
  horse: HorseType;
  race: RaceType;
  meeting: MeetingType;
}

export function Forms({ forms, horse, race, meeting }: FormProps) {
  return (
    <div className="mb-4">
      <table className="text-sm">
        <thead>
          <tr>
            <td className="px-4 py-2 " colSpan={9}>
              Form
            </td>
            <td className="px-4 py-2 " colSpan={2}>
              Raced Against
            </td>
            <td className="px-4 py-2 " colSpan={2}>
              Beaten
            </td>
          </tr>
          <tr>
            <td className="px-4 py-2 ">Date</td>
            <td className="px-4 py-2 ">Track</td>
            <td className="px-4 py-2 ">Position</td>
            <td className="px-4 py-2 ">Type</td>
            <td className="px-4 py-2 ">Going</td>
            <td className="px-4 py-2 ">Jockey</td>
            <td className="px-4 py-2 ">Distance</td>
            <td className="px-4 py-2 ">TPF</td>
            <td className="px-4 py-2 ">Rpr</td>
            <td className="px-4 py-2 ">Avg</td>
            <td className="px-4 py-2 ">Max</td>
            <td className="px-4 py-2 ">Avg</td>
            <td className="px-4 py-2 ">Max</td>
            <td className="px-4 py-2 ">Comment</td>
          </tr>
        </thead>
        <tbody>
          {forms?.map((form) => (
            <FormRow
              key={form.id}
              form={form}
              horse={horse}
              race={race}
              meeting={meeting}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
