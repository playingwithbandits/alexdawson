"use client";

import { useState, useEffect } from "react";
import {
  generatePredictions,
  SortOption,
  FilterOption,
} from "@/lib/generator/predictions";
import { MeetingAccordion } from "./MeetingAccordion";
import { PredictionControls } from "./controls/PredictionControls";
import { ExpansionProvider } from "./context/ExpansionContext";
import { ExpandAllToggle } from "./controls/ExpandAllToggle";
import { PredictionAccordion } from "./PredictionAccordion";

interface DayPredictionsProps {
  date: string;
}

export function DayPredictions({ date }: DayPredictionsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("off");
  const [filterRating, setFilterRating] = useState<FilterOption>(null);
  const data = generatePredictions(date);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="day-predictions">
        <h2>
          Predictions for{" "}
          {new Date(date).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h2>
      </div>
    );
  }

  // First filter the predictions
  const filteredMeetings = data.meetings
    .map((meeting) => ({
      ...meeting,
      races: meeting.races
        .map((race) => ({
          ...race,
          predictions: race.predictions.filter(
            (p) => !filterRating || p.score >= filterRating
          ),
        }))
        .filter((race) => race.predictions.length > 0),
    }))
    .filter((meeting) => meeting.races.length > 0);

  // If sort is off, just filter and return meetings as is
  if (sortBy === "off") {
    return (
      <ExpansionProvider>
        <div className="day-predictions">
          <h2>
            Predictions for{" "}
            {new Date(date).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h2>

          <div className="controls-wrapper">
            <PredictionControls
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterRating={filterRating}
              onFilterChange={setFilterRating}
            />
            <ExpandAllToggle />
          </div>

          {filteredMeetings.map((meeting, meeting_i) => (
            <MeetingAccordion
              key={meeting.name + meeting_i}
              meeting={meeting}
            />
          ))}
        </div>
      </ExpansionProvider>
    );
  }

  // For time/rating sort, flatten all predictions into a single list
  const allPredictions = filteredMeetings.flatMap((meeting) =>
    meeting.races.flatMap((race) =>
      race.predictions.map((prediction) => ({
        meeting: meeting.name,
        time: race.time,
        ...prediction,
      }))
    )
  );

  // Sort the flattened list
  const sortedPredictions = [...allPredictions].sort((a, b) => {
    if (sortBy === "rating") {
      return b.score - a.score;
    }
    // Sort by time
    const timeA = Number(a.time.replace(":", ""));
    const timeB = Number(b.time.replace(":", ""));
    return timeA - timeB;
  });

  return (
    <ExpansionProvider>
      <div className="day-predictions">
        <h2>
          Predictions for{" "}
          {new Date(date).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h2>

        <div className="controls-wrapper">
          <PredictionControls
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterRating={filterRating}
            onFilterChange={setFilterRating}
          />
          <ExpandAllToggle />
        </div>

        {/* Show flat list when sorting is active */}
        <div className="predictions-table">
          <div className="predictions-list expanded">
            {sortedPredictions.map((prediction, index) => (
              <PredictionAccordion
                key={`${prediction.meeting}-${prediction.time}-${index}`}
                horseName={`${prediction.horseName} (${prediction.meeting} ${prediction.time})`}
                score={prediction.score}
                stats={{
                  lastRaces: "1-3-2-4-1",
                  winRate: 35,
                  placeRate: 65,
                  preferredGoing: ["Good to Firm", "Good"],
                  bestDistance: "1m 2f",
                  courseRecord: "2 wins from 3 runs",
                  avgSpeedRating: 85,
                  topSpeedRating: 92,
                  weightCarried: "9-2",
                  officialRating: 88,
                  classRecord: "Class 2: 3 wins from 5 runs",
                  trainer: "John Smith",
                  jockey: "Ryan Moore",
                  trainerForm: "23% last 14 days",
                  jockeyForm: "18% last 14 days",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </ExpansionProvider>
  );
}
