"use client";

import { useState, useEffect } from "react";
import { SortOption, FilterOption } from "@/lib/generator/predictions";
import { MeetingAccordion } from "./MeetingAccordion";
import { PredictionControls } from "./controls/PredictionControls";
import { ExpansionProvider } from "./context/ExpansionContext";
import { ExpandAllToggle } from "./controls/ExpandAllToggle";
import { ViewToggle } from "./controls/ViewToggle";
import { Meeting } from "@/types/racing";

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
  const sortedPredictions = [...allPredictions].sort((a, b) => {
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

        {/* <div className="predictions-table">
          <div style={{ display: "none" }}>Current view: {view}</div>
          {view === "table" ? (
            <div className="predictions-list expanded">
              {sortedPredictions.map((prediction, index) => (
                <PredictionAccordion
                  key={`${prediction.meeting}-${prediction.time}-${index}`}
                  horseName={`${prediction.horseName} (${prediction.meeting} ${prediction.time})`}
                  score={prediction.score}
                  form={prediction.form}
                  raceStats={{
                    avgSpeedRating: 75,
                    avgOfficialRating: 75,
                    raceDistance: "1m",
                    going: "Good",
                    avgPrize: 20,
                    avgTotalPrize: 100,
                  }}
                  stats={{
                    lastRaces: "1-3-2-4-1",
                    winRate: {
                      value: 35,
                      isHighlighted: false,
                    },
                    placeRate: {
                      value: 65,
                      isHighlighted: false,
                    },
                    preferredGoing: {
                      value: "Good to Firm, Good",
                      isHighlighted: false,
                    },
                    bestDistance: {
                      value: "1m 2f",
                      isHighlighted: false,
                    },
                    avgSpeedRating: {
                      value: 85,
                      isHighlighted: false,
                    },
                    topSpeedRating: {
                      value: 92,
                      isHighlighted: false,
                    },
                    weightCarried: "9-2",
                    officialRating: {
                      value: 88,
                      isHighlighted: false,
                    },
                    classRecord: "Class 2: 3 wins from 5 runs",
                    trainer: "John Smith",
                    jockey: "Ryan Moore",
                    trainerForm: {
                      value: "23% last 14 days",
                      isHighlighted: false,
                    },
                    jockeyForm: {
                      value: "18% last 14 days",
                      isHighlighted: false,
                    },
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="predictions-simple-list">
              {sortedPredictions.map((prediction, index) => (
                <div
                  key={`${prediction.meeting}-${prediction.time}-${index}`}
                  className="simple-prediction-row"
                >
                  <span className="meeting">{prediction.meeting}</span>
                  <span className="time">{prediction.time}</span>
                  <span className="horse">{prediction.horseName}</span>
                  <StarRating score={prediction.score} />
                </div>
              ))}
            </div>
          )}
        </div> */}
      </div>
    </ExpansionProvider>
  );
}
