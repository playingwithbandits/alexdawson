"use client";

import { useState, useEffect } from "react";
import { SortOption, FilterOption } from "@/lib/generator/predictions";
import { MeetingAccordion } from "./MeetingAccordion";
import { PredictionControls } from "./controls/PredictionControls";
import { ExpansionProvider } from "./context/ExpansionContext";
import { ExpandAllToggle } from "./controls/ExpandAllToggle";
import { ViewToggle } from "./controls/ViewToggle";
import { Horse, Meeting } from "@/types/racing";
import { HorseRow } from "./HorseRow";

interface DayPredictionsProps {
  meetings: Meeting[];
  date: string;
}

export function DayPredictions({ meetings, date }: DayPredictionsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("off");
  const [filterRating, setFilterRating] = useState<FilterOption>(null);
  const [view, setView] = useState<"list" | "table">("table");
  //const data = generatePredictions(meetings);

  const handleViewChange = (newView: "list" | "table") => {
    console.log("Changing view to:", newView);
    setView(newView);
  };

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
  const filteredMeetings = meetings
    .map((meeting) => ({
      ...meeting,
      races: meeting.races.filter((race) => race.horses.length > 0),
    }))
    .filter((meeting) => meeting.races.length > 0);

  console.log("filteredMeetings", filteredMeetings);

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
            <ViewToggle view={view} onViewChange={handleViewChange} />
            <ExpandAllToggle />
          </div>

          {filteredMeetings.map((meeting, meeting_i) => (
            <MeetingAccordion
              key={meeting.venue + meeting_i}
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
      race.horses.map((horse) => ({
        ...horse,
        time: race.time,
      }))
    )
  );

  // Sort the flattened list
  const sortedPredictions: Horse[] = [...allPredictions].sort((a, b) => {
    if (sortBy === "rating") {
      return (b.score || 0) - (a.score || 0);
    }
    // Sort by time
    const timeA = Number(a.time.replace(":", ""));
    const timeB = Number(b.time.replace(":", ""));
    return timeA - timeB;
  });

  console.log("view", view);

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
          <ViewToggle view={view} onViewChange={handleViewChange} />
          <ExpandAllToggle />
        </div>
        {sortedPredictions.map((horse) => (
          <HorseRow
            key={horse.name}
            horse={horse}
            score={horse.score}
            race={filteredMeetings
              ?.flatMap((x) => x.races)
              .find((x) => x.horses?.map((h) => h.name).includes(horse.name))}
          />
        ))}
      </div>
    </ExpansionProvider>
  );
}
