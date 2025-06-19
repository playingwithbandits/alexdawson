"use client";

import { useState } from "react";
import { Meeting as MeetingType } from "@/types/racing";
import { Race as RaceComponent } from "./Race";

export interface MeetingProps {
  meeting: MeetingType;
}

export const Meeting = ({ meeting }: MeetingProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <div className="bg-gray-900">
      <div
        className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">
              {meeting.venue}
            </h2>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {meeting.surface}
              </span>
              <span>Going: {meeting.going}</span>
              <span>{meeting.raceCount} races</span>
              <span>
                {meeting.firstRace} - {meeting.lastRace}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {meeting.races.length} race{meeting.races.length !== 1 ? "s" : ""}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
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
        <div className="border-t border-gray-700 bg-gray-800">
          <div className="px-6 py-4 space-y-4">
            {meeting.races.map((race, index) => (
              <RaceComponent key={`${race.time}-${index}`} race={race} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
