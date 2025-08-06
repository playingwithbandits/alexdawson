import { Race as RaceType, Meeting as MeetingType } from "@/types/raceday";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Horse } from "./Horse";

interface RaceProps {
  race: RaceType;
  meeting: MeetingType;
}

export function Race({ race, meeting }: RaceProps) {
  // Calculate

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={race.id}>
        <AccordionTrigger className="">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-blue-400">{race.time}</span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="mb-4">
            <table className="text-sm">
              <thead>
                <tr>
                  <td className="px-4 py-2 bg-gray-800" colSpan={3}>
                    About Race
                  </td>
                  <td className="px-4 py-2" colSpan={2}>
                    Horses (Avg | Max)
                  </td>
                  <td className="px-4 py-2 bg-gray-800" colSpan={1}>
                    Raced Against (Avg | Max)
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 bg-gray-800">Distance</td>
                  <td className="px-4 py-2 bg-gray-800">Going</td>
                  <td className="px-4 py-2 bg-gray-800">Type</td>
                  <td className="px-4 py-2">RPR</td>
                  <td className="px-4 py-2">TPF</td>
                  <td className="px-4 py-2 bg-gray-800">RPR</td>
                </tr>
              </thead>
              <tbody>
                <tr className="">
                  <td className="px-4 py-2 bg-gray-800">{race.distanceF}F</td>
                  <td className="px-4 py-2 bg-gray-800 ">
                    {race.goingCodes.join(", ")}
                  </td>
                  <td className="px-4 py-2 bg-gray-800">{race.raceTypeCode}</td>
                  <td className="px-4 py-2">
                    {race.horsesInfo.averages.rpr} | {race.horsesInfo.maxes.rpr}
                  </td>

                  <td className="px-4 py-2">
                    {race.horsesInfo.min.timePerFurlong.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 bg-gray-800">
                    {race.horsesInfo.averages.racedAgainst.rpr} |{" "}
                    {race.horsesInfo.maxes.racedAgainst.rpr}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Horses */}
          <div className="space-y-2">
            {race.horses.map((horse) => (
              <Horse
                key={horse.id}
                horse={horse}
                race={race}
                meeting={meeting}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
