"use client";

import { Meeting, Race } from "@/types/racing";
import { useEffect, useState } from "react";
import { AccordionButton } from "./accordions/AccordionButton";
import { AccordionContent } from "./accordions/AccordionContent";
import { useExpansion } from "./context/ExpansionContext";
import { HorseRow } from "./HorseRow";
import { calculateDrawBias } from "@/lib/racing/calculateDrawBias";

interface RaceAccordionProps {
  race: Race;
  meeting: Meeting;
}

export function RaceAccordion({ race, meeting }: RaceAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { expandAll } = useExpansion();

  const drawBiasInfo = calculateDrawBias(
    race.raceStats?.courseStats?.leftHanded
      ? ("left-handed" as const)
      : race.raceStats?.courseStats?.rightHanded
      ? ("right-handed" as const)
      : race.raceStats?.courseStats?.straight
      ? ("straight" as const)
      : undefined,
    race.distance,
    race.going
  );

  useEffect(() => {
    setIsExpanded(expandAll);
  }, [expandAll]);

  return (
    <div className="predictions-table">
      <AccordionButton
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="race-time">{race.time}</h3>
      </AccordionButton>
      <AccordionContent isExpanded={isExpanded}>
        {/* Race Information */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{race.title}</h3>
              <div className="text-sm text-gray-400">
                {race.class} • {race.distance} • {race.ageRestriction} •{" "}
                {race.tv}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{race.prize}</div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>{race.runners} runners</div>
                {race.ewTerms && <div>{race.ewTerms}</div>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-400">Course Details</div>
              <div className="grid gap-1">
                <div>
                  <span className="text-gray-400">Going:</span>{" "}
                  <span className="font-medium">
                    {race.going || "Not available"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Surface:</span>{" "}
                  <span className="font-medium">
                    {meeting.surface || "Not available"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Type:</span>{" "}
                  <span className="font-medium">
                    {meeting.type || "Not available"}
                  </span>
                </div>
                {race.stalls && (
                  <div>
                    <span className="text-gray-400">Stalls:</span>{" "}
                    <span className="font-medium">{race.stalls}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-400">Track Configuration</div>
              <div className="grid gap-1">
                <div>
                  <span className="text-gray-400">Layout:</span>{" "}
                  <span className="font-medium capitalize">
                    {race.trackConfig || "Not available"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Draw Bias:</span>{" "}
                  <span className="font-medium">{drawBiasInfo.bias}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {drawBiasInfo.explanation}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-400">Meeting Info</div>
              <div className="grid gap-1">
                <div>
                  <span className="text-gray-400">Going:</span>{" "}
                  <span className="font-medium">{meeting.going}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Predictions List */}
        {race.predictions && Object.keys(race.predictions).length > 0 && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm text-gray-400">Predictions</h3>
              {race.raceExtraInfo?.verdict.selection && (
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    Selection:{" "}
                    <span className="font-semibold text-primary">
                      {race.raceExtraInfo.verdict.selection}
                      {race.raceExtraInfo.verdict.isNap && " (NAP)"}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.values(race.predictions)
                .sort((a, b) => b.score - a.score)
                .map((prediction) => (
                  <div
                    key={prediction.id}
                    className="px-3 py-1 bg-gray-800 rounded-full text-sm flex items-center gap-2"
                  >
                    <span className="font-medium">{prediction.name}</span>
                    <span className="text-primary">
                      {prediction.score.toFixed(1)}
                    </span>
                  </div>
                ))}
            </div>
            {race.raceExtraInfo?.verdict.comment && (
              <div className="mt-4 text-sm text-gray-300">
                <p className="mb-2">{race.raceExtraInfo.verdict.comment}</p>
                {race.raceExtraInfo.verdict.allNamed.length > 0 && (
                  <div className="text-xs text-gray-400">
                    Mentioned: {race.raceExtraInfo.verdict.allNamed.join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Race Stats */}
        {race.raceStats && (
          <div className="p-4 border-b border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-400">Average Ratings</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">OR:</span>{" "}
                  <span className="font-medium">
                    {race.raceStats.avgOfficialRating.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">RPR:</span>{" "}
                  <span className="font-medium">
                    {race.raceStats.avgRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-400">Form Trends</div>
              <div className="grid grid-cols-1 gap-1 text-sm">
                <div>
                  <span className="text-green-400">↑</span>{" "}
                  <span className="font-medium">
                    {race.raceStats.formTrends.improving} Improving
                  </span>
                </div>
                <div>
                  <span className="text-red-400">↓</span>{" "}
                  <span className="font-medium">
                    {race.raceStats.formTrends.declining} Declining
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-400">Distance Range</div>
              <div className="text-sm">
                <span className="font-medium">
                  {race.raceStats.distanceRange.min}f -{" "}
                  {race.raceStats.distanceRange.max}f
                </span>
                <div className="text-gray-400">
                  Avg: {race.raceStats.distanceRange.avg.toFixed(1)}f
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-400">Performance</div>
              <div className="grid grid-cols-1 gap-1 text-sm">
                <div>
                  <span className="text-gray-400">Win Rate:</span>{" "}
                  <span className="font-medium">
                    {race.raceStats.avgWinRate.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Place Rate:</span>{" "}
                  <span className="font-medium">
                    {race.raceStats.avgPlaceRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {[...race.horses]
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .map((horse) => (
            <HorseRow
              key={horse.name}
              horse={horse}
              score={horse.score}
              race={race}
            />
          ))}
      </AccordionContent>
    </div>
  );
}
