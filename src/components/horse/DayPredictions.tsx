"use client";

import { useState, useEffect } from "react";
import { MeetingAccordion } from "./MeetingAccordion";
import { ExpansionProvider } from "./context/ExpansionContext";
import { ViewToggle } from "./controls/ViewToggle";
import {
  DayTips,
  GytoTip,
  Horse,
  Meeting,
  Race,
  RaceResults,
  NapsTableTip,
} from "@/types/racing";
import { HorseRow } from "./HorseRow";
import { cleanName } from "@/app/rp/utils/fetchRaceAccordion";
import React from "react";
import { avg } from "@/lib/utils";
import { RACING_SCORE_WEIGHTS } from "@/lib/racing/scores/weights";
import { HorseScore } from "@/lib/racing/scores/types";
import { calculateROI } from "@/lib/racing/calculateROI";
import { horseNameToKey } from "@/lib/racing/scores/funcs";
import { CompactRaceRow } from "./rows/CompactRaceRow";
import { PicksRaceRow } from "./rows/PicksRaceRow";

export type ViewMode = "list" | "table" | "compact" | "detailed" | "picks";

interface DayPredictionsProps {
  meetings: Meeting[];
  date: string;
  results: RaceResults | undefined;

  tips: DayTips | null;
  gytoTips: GytoTip[] | undefined;
  napsTableTips: NapsTableTip[] | undefined;
}

export const normalizeTime = (time: string) => {
  // Convert "1:35" to "13:35" format
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  if (hour < 12) {
    return `${hour + 12}:${minutes}`;
  }
  return time;
};

export function DayPredictions({
  meetings,
  date,
  results,
  tips,
  gytoTips,
  napsTableTips,
}: DayPredictionsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [view, setView] = useState<ViewMode>("compact");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  //const data = generatePredictions(meetings);

  const today = new Date().toISOString().split("T")[0];
  const isTodayOrPast = date === today || date < today;

  const handleViewChange = (newView: ViewMode) => {
    //console.log("Changing view to:", newView);
    setView(newView);
  };

  const aiRoi = calculateROI({
    meetings,
    results,
    picks: meetings?.flatMap((place) =>
      place.races?.flatMap((race) => {
        const topScorer = race.horses.sort(
          (a, b) =>
            (b.score?.total?.percentage || 0) -
            (a.score?.total?.percentage || 0)
        )[0];

        const selection = horseNameToKey(topScorer.name);
        return {
          time: race.time,
          horse: selection,
        };
      })
    ),
  });

  const aiLargeRoi = calculateROI({
    meetings,
    results,
    picks: meetings
      ?.flatMap((place) =>
        place.races?.flatMap((race) => {
          const topPercentage = race?.horses?.sort(
            (a, b) =>
              (b.score?.total?.percentage || 0) -
              (a.score?.total?.percentage || 0)
          )?.[0]?.score?.total?.percentage;
          const fivePercentOffTop = topPercentage
            ? topPercentage * 0.95
            : undefined;

          const topScorer = race.horses
            ?.filter((x) => {
              const odds = race.bettingForecast?.find(
                (y) => cleanName(y.horseName) === cleanName(x.name)
              )?.decimalOdds;

              return (
                fivePercentOffTop &&
                x.score?.total?.percentage &&
                x.score?.total?.percentage >= fivePercentOffTop &&
                Boolean(odds) &&
                odds &&
                odds >= 10
              );
            })
            .sort(
              (a, b) =>
                (b.score?.total?.percentage || 0) -
                (a.score?.total?.percentage || 0)
            )[0];

          const selection = horseNameToKey(topScorer?.name);
          return {
            time: race.time,
            horse: selection,
          };
        })
      )
      .filter((x) => Boolean(x.horse)),
  });

  const predictionsRoi = calculateROI({
    meetings,
    results,
    picks: meetings?.flatMap((place) =>
      place.races?.flatMap((race) => {
        const sortedPrediction = Object.values(race.predictions || {}).sort(
          (a, b) => (b.score || 0) - (a.score || 0)
        )?.[0];

        const selection = horseNameToKey(sortedPrediction?.name || "");
        return {
          time: race.time,
          horse: selection,
        };
      })
    ),
  });

  const rpPicks = calculateROI({
    meetings,
    results,
    picks: meetings?.flatMap((place) =>
      place.races?.flatMap((race) => {
        const selection = horseNameToKey(
          race.raceExtraInfo?.verdict?.selection || ""
        );
        return {
          time: race.time,
          horse: selection,
        };
      })
    ),
  });

  const atrRoi = calculateROI({
    meetings,
    results,
    picks: tips?.atrTips?.flatMap((tip) =>
      tip.races?.flatMap((race) => ({
        time: race.time,
        horse: race.selections?.[0]?.horse,
      }))
    ),
  });

  const timeformRoi = calculateROI({
    meetings,
    results,
    picks: tips?.timeformTips?.flatMap((tip) =>
      tip.races?.flatMap((race) => ({
        time: race.time,
        horse: race.selections?.[0]?.horse,
      }))
    ),
  });

  console.log("gyto Tips", gytoTips);
  const gytoRoi = calculateROI({
    meetings,
    results,
    picks: gytoTips?.map((tip) => ({
      time: tip.time,
      horse: tip.horse,
    })),
  });

  console.log("gyto Roi", gytoRoi);
  console.log("naps TableTips", napsTableTips);
  const napsRoi = calculateROI({
    meetings,
    results,
    picks: napsTableTips?.map((tip) => ({
      time: tip.time,
      horse: tip.horse,
    })),
  });
  console.log("naps Roi", napsRoi);

  const handleSaveRoi = async () => {
    const roiData = {
      date,
      sources: {
        ai: aiRoi,
        predictions: predictionsRoi,
        atr: atrRoi,
        timeform: timeformRoi,
        gyto: gytoRoi,
        naps: napsRoi,
        rp: rpPicks,
        aiLarge: aiLargeRoi,
      },
    };

    if (!results || results.results.length === 0) {
      alert("No results available to save ROI");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/racing/roi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roiData),
      });

      if (!response.ok) {
        throw new Error("Failed to save ROI");
      }

      alert("ROI saved successfully");
    } catch (error) {
      console.error("Error saving ROI:", error);
      alert("Failed to save ROI");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResults = async () => {
    if (!results || results.results.length === 0) {
      alert("No results available to delete");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete the results for this day? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/racing/results/${date}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete results");
      }

      alert("Results deleted successfully");
      window.location.reload(); // Refresh to show updated state
    } catch (error) {
      console.error("Error deleting results:", error);
      alert("Failed to delete results");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderHeader = () => {
    const { roi, wins, total, totalReturns, totalBets, noResults } = aiRoi;

    return (
      <div className="mb-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Predictions for{" "}
            {new Date(date).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h2>
        </div>

        {noResults ? (
          <div className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
              <span className="text-red-400 font-semibold text-lg">
                No results found for this day
              </span>
            </div>
            <div className="flex gap-4">
              <ViewToggle view={view} onViewChange={handleViewChange} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat-card p-4">
                <h4 className="text-gray-400 text-sm">Total Staked</h4>
                <div className="text-xl font-bold">
                  £{totalBets?.toLocaleString()}
                </div>
              </div>
              <div className="stat-card p-4">
                <h4 className="text-gray-400 text-sm">Total Returns</h4>
                <div className="text-xl font-bold">
                  £{totalReturns?.toLocaleString()}
                </div>
              </div>
              <div className="stat-card p-4">
                <h4 className="text-gray-400 text-sm">ROI</h4>
                <div
                  className={`text-xl font-bold ${
                    roi >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {roi >= 0 ? "+" : ""}
                  {roi.toFixed(1)}%
                </div>
              </div>
              <div className="stat-card p-4">
                <h4 className="text-gray-400 text-sm">Strike Rate</h4>
                <div className="text-xl font-bold">
                  {wins}/{total} ({((wins / total) * 100).toFixed(1)}%)
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <ViewToggle view={view} onViewChange={handleViewChange} />
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  onClick={handleSaveRoi}
                  disabled={isSaving || noResults}
                >
                  {isSaving ? "Saving..." : "Save ROI"}
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  onClick={handleDeleteResults}
                  disabled={isDeleting || noResults}
                >
                  {isDeleting ? "Deleting..." : "Delete Results"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  //console.log("filteredMeetings", filteredMeetings);

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
      <ExpansionProvider>
        <div className="container day-predictions space-y-6">
          {renderHeader()}
          <div className=" space-y-6">
            {meetings.map((meeting) => (
              <div key={meeting.venue} className="rounded-lg shadow-sm p-4">
                <div className="border-b pb-2 mb-4">
                  <h3 className="font-bold text-lg">{meeting.venue}</h3>
                  <p className="text-sm ">
                    {meeting.races.length} races • {meeting.surface} •{" "}
                    {meeting.going}
                  </p>
                </div>
                <div className="space-y-1">
                  {meeting.races.map((race, index) => (
                    <CompactRaceRow
                      key={race.time}
                      isTodayOrPast={isTodayOrPast}
                      index={index}
                      race={race}
                      meeting={meeting}
                      results={results}
                      tips={tips}
                      gytoTips={gytoTips}
                      napsTableTips={napsTableTips}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ExpansionProvider>
    );
  }

  if (view === "picks") {
    return (
      <ExpansionProvider>
        <div className="day-predictions space-y-6">
          {renderHeader()}
          <div className=" space-y-6">
            {meetings.map((meeting) => (
              <div key={meeting.venue} className="rounded-lg shadow-sm p-4">
                <div className="border-b pb-2 mb-4">
                  <h3 className="font-bold text-lg">{meeting.venue}</h3>
                  <p className="text-sm ">
                    {meeting.races.length} races • {meeting.surface} •{" "}
                    {meeting.going}
                  </p>
                </div>
                <div className="space-y-1">
                  {meeting.races.map((race, index) => (
                    <PicksRaceRow
                      key={race.time}
                      isTodayOrPast={isTodayOrPast}
                      index={index}
                      race={race}
                      meeting={meeting}
                      results={results}
                      tips={tips}
                      gytoTips={gytoTips}
                      napsTableTips={napsTableTips}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
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
    return (
      (b.score?.total?.percentage || 0) - (a.score?.total?.percentage || 0)
    );
  });

  // Add detailed view case
  if (view === "detailed") {
    const anExample = meetings?.flatMap((x) =>
      x.races?.flatMap((x) => x.horses?.flatMap((x) => x.score?.components))
    )[0];
    const test = meetings?.flatMap((x) =>
      x.races?.flatMap((x) => x.horses?.flatMap((x) => x.score?.components))
    );

    const tempObj = {} as Record<keyof HorseScore["components"], number>;

    Object.entries(RACING_SCORE_WEIGHTS).forEach(([key]) => {
      tempObj[key as keyof HorseScore["components"]] = parseFloat(
        (
          avg(
            test?.flatMap((x) =>
              key ? x?.[key as keyof HorseScore["components"]].score || 0 : 0
            )
          ) /
          (anExample?.[key as keyof HorseScore["components"]]?.maxScore || 1)
        ).toFixed(2)
      );
    });

    console.log(
      "SORT THIS OUT!:",
      tempObj,
      Object.entries(tempObj).filter(([, value]) => value < 0.2)
    );

    return (
      <ExpansionProvider>
        <div className="container day-predictions space-y-6">
          {renderHeader()}
          <div className="space-y-6">
            {meetings.map((meeting) => (
              <div key={meeting.venue} className="rounded-lg shadow-sm p-4">
                <div className="border-b pb-2 mb-4">
                  <h3 className="font-bold text-lg">{meeting.venue}</h3>
                  <p className="text-sm">
                    {meeting.races.length} races • {meeting.surface} •{" "}
                    {meeting.going}
                  </p>
                </div>
                <div className="divide-y">
                  {meeting.races.map((race) => (
                    <DetailedRaceRow
                      key={race.time}
                      isTodayOrPast={isTodayOrPast}
                      race={race}
                      meeting={meeting}
                      results={results}
                      tips={tips}
                      gytoTips={gytoTips}
                      napsTableTips={napsTableTips}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ExpansionProvider>
    );
  }

  return (
    <ExpansionProvider>
      <div className="day-predictions">
        {renderHeader()}
        {sortedPredictions.map((horse) => (
          <HorseRow
            key={horse.name}
            horse={horse}
            score={horse.score}
            mode="list"
            meeting={filteredMeetings?.find((x) =>
              x.races.find((r) =>
                r.horses.map((h) => h.name).includes(horse.name)
              )
            )}
            race={filteredMeetings
              ?.flatMap((x) => x.races)
              .find((x) => x.horses?.map((h) => h.name).includes(horse.name))}
          />
        ))}
      </div>
    </ExpansionProvider>
  );
}

function DetailedRaceRow({
  isTodayOrPast,
  race,
  meeting,
  results,
  tips,
  gytoTips,
  napsTableTips,
}: {
  isTodayOrPast: boolean;
  race: Race;
  meeting: Meeting;
  results: RaceResults | undefined;
  tips: DayTips | null;
  gytoTips: GytoTip[] | undefined;
  napsTableTips: NapsTableTip[] | undefined;
}) {
  console.log("DetailedRaceRow", {
    isTodayOrPast,
    race,
    meeting,
    results,
    tips,
    gytoTips,
    napsTableTips,
  });

  const topScorer = race.horses
    .sort(
      (a, b) =>
        (b.score?.total?.percentage || 0) - (a.score?.total?.percentage || 0)
    )
    .at(0);

  if (!topScorer?.score) return null;

  return (
    <div className="p-4 border-b hover:bg-gray-50/5">
      <div className="flex items-center gap-4 mb-2">
        <span className="font-semibold text-sm">{race.time}</span>
        <span className="font-medium">{topScorer.name}</span>
        <span className="text-yellow-400">
          {topScorer.score.total.score.toFixed(1)} /{" "}
          {topScorer.score.total.maxScore.toFixed(1)}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs text-gray-400">
        {Object.entries(topScorer.score.components).map(([key, value]) => (
          <div key={key} className="flex items-center gap-1">
            <span>{key}:</span>
            <span className={value.score > 75 ? "text-yellow-400" : ""}>
              {value.score.toFixed(1)}
            </span>
            <span className={value.maxScore > 75 ? "text-yellow-400" : ""}>
              {value.maxScore.toFixed(1)}
            </span>
            <span className={value.percentage > 75 ? "text-yellow-400" : ""}>
              {value.percentage.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
