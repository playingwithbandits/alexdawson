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

  const maxScore = race.horses.reduce(
    (max, horse) => Math.max(max, horse.scoreObj?.total || 0),
    0
  );
  const maxScoreThreshold = maxScore * 0.9;
  const scoreToBeBetterThan =
    maxScoreThreshold && maxScore > 7 ? maxScoreThreshold : 7;

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={race.id}>
        <AccordionTrigger className="">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-blue-400">{race.time}</span>
              <div className="flex flex-wrap gap-2">
                {race.horses
                  .filter(
                    (horse) =>
                      (horse.scoreObj?.total || 0) >= scoreToBeBetterThan
                  )
                  ?.map((horse) => (
                    <span
                      key={horse.id}
                      className="px-2 py-1 text-sm bg-blue-900 rounded-full"
                    >
                      {horse.name} {horse.scoreObj?.total}
                    </span>
                  ))}
              </div>
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
                  <td className="px-4 py-2" colSpan={1}>
                    Horses
                  </td>
                  <td className="px-4 py-2 " colSpan={2}>
                    Beaten
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 bg-gray-800">Distance</td>
                  <td className="px-4 py-2 bg-gray-800">Going</td>
                  <td className="px-4 py-2 bg-gray-800">Type</td>
                  <td className="px-4 py-2">TPF</td>
                  <td className="px-4 py-2 ">Avg</td>
                  <td className="px-4 py-2 ">T_Max</td>
                  <td className="px-4 py-2 ">Max Recent Form</td>
                </tr>
              </thead>
              <tbody>
                <tr className="">
                  <td className="px-4 py-2 bg-gray-800">
                    {race.distanceF?.toFixed(2)}F
                  </td>
                  <td className="px-4 py-2 bg-gray-800 ">
                    {race.goingCodes.join(", ")}
                  </td>
                  <td className="px-4 py-2 bg-gray-800">{race.raceTypeCode}</td>

                  <td className="px-4 py-2">
                    {race.horsesInfo.min.timePerFurlong.toFixed(2)}
                  </td>

                  <td className="px-4 py-2 ">
                    {race.horsesInfo.maxes.racedAgainst_Beaten_Averages.rpr.toFixed(
                      2
                    )}
                  </td>
                  <td className="px-4 py-2 ">
                    {race.horsesInfo.maxes.racedAgainst_Beaten_Maxes.rpr.toFixed(
                      2
                    )}
                  </td>
                  <td className="px-4 py-2 ">
                    {race.horsesInfo.maxes.mostRecentForm.rpr.toFixed(2)}
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
