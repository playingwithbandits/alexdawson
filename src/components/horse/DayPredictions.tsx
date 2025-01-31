"use client";

import { useState, useEffect } from "react";
import { MeetingAccordion } from "./MeetingAccordion";
import { ExpansionProvider } from "./context/ExpansionContext";
import { ExpandAllToggle } from "./controls/ExpandAllToggle";
import { ViewToggle } from "./controls/ViewToggle";
import { Horse, Meeting, Race } from "@/types/racing";
import { HorseRow } from "./HorseRow";

type ViewMode = "list" | "table" | "compact";

interface DayPredictionsProps {
  meetings: Meeting[];
  date: string;
}

export function DayPredictions({ meetings, date }: DayPredictionsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [view, setView] = useState<ViewMode>("compact");
  //const data = generatePredictions(meetings);

  const handleViewChange = (newView: "list" | "table" | "compact") => {
    console.log("Changing view to:", newView);
    setView(newView);
  };

  const renderHeader = () => (
    <>
      <h2>
        Predictions for{" "}
        {new Date(date).toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </h2>
      <div className="flex justify-center gap-4 mb-6">
        <ViewToggle view={view} onViewChange={handleViewChange} />
        {view !== "compact" && <ExpandAllToggle />}
      </div>
    </>
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getTopSelections = (race: Race) => {
    if (!race.horses?.length) return null;
    const sorted = [...race.horses].sort(
      (a, b) =>
        (b.score?.total?.percentage || 0) - (a.score?.total?.percentage || 0)
    );
    const topScore = sorted[0].score?.total?.percentage || 0;
    const threshold = topScore * 0.95; // Within 10% of top score

    return sorted
      .filter((h) => (h.score?.total?.percentage || 0) >= threshold)
      .map((horse) => ({
        horse,
        odds: race.bettingForecast?.find((b) => b.horseName === horse.name)
          ?.odds,
      }));
  };

  if (!isMounted) {
    return <div className="day-predictions">{renderHeader()}</div>;
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
  if (view === "table") {
    return (
      <ExpansionProvider>
        <div className="day-predictions">
          {renderHeader()}
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

  if (view === "compact") {
    return (
      <div className="day-predictions space-y-6">
        {renderHeader()}
        <div className="container space-y-6">
          {meetings.map((meeting) => (
            <div key={meeting.venue} className="rounded-lg shadow-sm p-4">
              <div className="border-b pb-2 mb-4">
                <h3 className="font-bold text-lg">{meeting.venue}</h3>
                <p className="text-sm ">
                  {meeting.races.length} races • {meeting.surface} •{" "}
                  {meeting.going}
                </p>
              </div>
              <div className="space-y-2">
                {meeting.races.map((race) => {
                  const selections = getTopSelections(race);
                  if (!selections?.length) return null;
                  return (
                    <div
                      key={race.time}
                      className="flex justify-between p-2 rounded"
                    >
                      <div className="flex gap-4 flex-1">
                        <span className="font-semibold w-12">{race.time}</span>
                        <span className="hidden md:block text-sm text-gray-400">
                          {race.distance} • {race.class}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 ">
                        {selections.map((sel) => (
                          <div
                            key={sel.horse.name}
                            className="flex gap-3 items-center justify-end"
                          >
                            <span className="font-medium">
                              {sel.horse.name}
                            </span>
                            <span className="hidden md:block text-sm text-gray-400 w-16">
                              {sel.odds || "SP"}
                            </span>
                            <span
                              className={`text-sm font-medium w-12 ${
                                (sel.horse.score?.total?.percentage || 0) > 50
                                  ? "text-yellow-600"
                                  : ""
                              }`}
                            >
                              {sel.horse.score?.total?.percentage?.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
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
    return (
      (b.score?.total?.percentage || 0) - (a.score?.total?.percentage || 0)
    );
  });

  return (
    <ExpansionProvider>
      <div className="day-predictions">
        {renderHeader()}
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
