"use client";

import { useState } from "react";
import { Race as RaceType } from "@/types/racing";
import { Horse as HorseComponent } from "./Horse";

export interface RaceProps {
  race: RaceType;
}

export const Race = ({ race }: RaceProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);

  const formatTime = (time: string) => {
    return time.replace(":", ".");
  };

  const formatDistance = (distance: number) => {
    if (distance < 8) {
      return `${distance}f`;
    } else {
      const miles = Math.floor(distance / 8);
      const furlongs = distance % 8;
      if (furlongs === 0) {
        return `${miles}m`;
      } else {
        return `${miles}m ${furlongs}f`;
      }
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
      <div
        className="px-4 py-3 cursor-pointer hover:bg-gray-700 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold text-blue-400">
              {formatTime(race.time)}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">{race.title}</h3>
              <div className="flex items-center space-x-3 mt-1 text-sm text-gray-400">
                <span>{formatDistance(race.distance)}</span>
                <span>Class {race.class}</span>
                <span>{race.ageRestriction}</span>
                <span>{race.runners} runners</span>
                {race.prize && (
                  <span className="text-green-400 font-medium">
                    {race.prize}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {race.horses.length} horse{race.horses.length !== 1 ? "s" : ""}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-600 bg-gray-700">
          <div className="px-4 py-3">
            <div className="grid grid-cols-1 gap-3">
              {race.horses.map((horse, index) => (
                <HorseComponent key={`${horse.name}-${index}`} horse={horse} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
