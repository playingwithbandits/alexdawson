"use client";

import { useState, useEffect } from "react";
import { Meeting as MeetingType } from "@/types/racing";
import { Meeting } from "./Meeting";

export interface RaceDayProps {
  date: string;
}

export const RaceDay = ({ date }: RaceDayProps) => {
  const [meetings, setMeetings] = useState<MeetingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaceData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/racing/${date}`);
        if (!response.ok) {
          throw new Error("Failed to fetch race data");
        }
        const data = await response.json();
        setMeetings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRaceData();
  }, [date]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-2 text-gray-300">Loading race data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 m-4">
        <h3 className="text-red-300 font-semibold">Error loading race data</h3>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 m-4">
        <h3 className="text-yellow-300 font-semibold">No races found</h3>
        <p className="text-yellow-400">No racing data available for {date}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Race Day - {date}</h1>
          <p className="text-gray-400 mt-1">
            {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} •{" "}
            {meetings.reduce(
              (total, meeting) => total + meeting.races.length,
              0
            )}{" "}
            races
          </p>
        </div>

        <div className="divide-y divide-gray-700">
          {meetings.map((meeting, index) => (
            <Meeting key={`${meeting.venue}-${index}`} meeting={meeting} />
          ))}
        </div>
      </div>
    </div>
  );
};
