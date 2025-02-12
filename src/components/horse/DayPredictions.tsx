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

export type ViewMode = "list" | "table" | "compact" | "detailed";

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
  const isToday = date === today;

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

  const gytoRoi = calculateROI({
    meetings,
    results,
    picks: gytoTips?.map((tip) => ({
      time: tip.time,
      horse: tip.horse,
    })),
  });

  const napsRoi = calculateROI({
    meetings,
    results,
    picks: napsTableTips?.map((tip) => ({
      time: tip.time,
      horse: tip.horse,
    })),
  });

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
        odds: race.bettingForecast?.find((b) => b.horseName)?.odds,
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
                      isToday={isToday}
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

    Object.entries(RACING_SCORE_WEIGHTS).forEach(([key, value]) => {
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
      Object.entries(tempObj).filter(([key, value]) => value < 0.2)
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
                      isToday={isToday}
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

function CompactRaceRow({
  isToday,
  index,
  race,
  meeting,
  results,
  tips,
  gytoTips,
  napsTableTips,
}: {
  isToday: boolean;
  index: number;
  race: Race;
  meeting: Meeting;

  results: RaceResults | undefined;
  tips: DayTips | null;
  gytoTips: GytoTip[] | undefined;
  napsTableTips: NapsTableTip[] | undefined;
}) {
  // Add helper function to normalize time format
  //console.log("tips", tips);
  //console.log("napsTableTips", napsTableTips);
  //console.log("gytoTips", gytoTips);
  // Get top prediction by score
  //console.log("Getting top scorer for race:", race.time);

  const topScorer = race.horses.sort(
    (a, b) =>
      (b.score?.total?.percentage || 0) - (a.score?.total?.percentage || 0)
  )[0];
  //console.log("Top scorer:", topScorer?.name);

  // Get top model prediction
  //console.log("Getting model predictions");
  const sortedPredictions = Object.values(race.predictions || {}).sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  const topPrediction = sortedPredictions[0];
  const topPredictionNum = topPrediction?.score || 0;
  const secondPredictionNum = sortedPredictions[1]?.score || 0;
  //console.log("Top prediction:", topPrediction?.name);

  const predictionGap = topPredictionNum - secondPredictionNum;
  //console.log("Prediction gap:", predictionGap);

  // Get verdict selection
  //console.log("Getting verdict selection");
  const verdictPick = race.raceExtraInfo?.verdict?.selection;
  const isNap = race.raceExtraInfo?.verdict?.isNap;
  //console.log("Verdict pick:", verdictPick, "Is nap:", isNap);

  // Get ATR tip for this race
  //console.log("Getting ATR tip");
  const atrTipSelections = tips?.atrTips
    ?.flatMap((m) => m.races)
    ?.find(
      (r) => normalizeTime(r.time) === normalizeTime(race.time)
    )?.selections;

  const atrTipSelectionObj = atrTipSelections?.[0];
  const atrTipSelection = atrTipSelectionObj?.horse;
  const atrTipSelectionOdds = atrTipSelection
    ? race.bettingForecast?.find(
        (x) => cleanName(x.horseName) === cleanName(atrTipSelection)
      )?.decimalOdds
    : 0;

  const timeformTipSelections = tips?.timeformTips
    ?.flatMap((m) => m.races)
    ?.find(
      (r) => normalizeTime(r.time) === normalizeTime(race.time)
    )?.selections;

  //console.log("timeformTipSelections", timeformTipSelections);
  const timeformTipSelectionObj = timeformTipSelections?.[0];
  const timeformTipSelection = timeformTipSelectionObj?.horse;
  const timeformTipSelectionOdds = timeformTipSelection
    ? race.bettingForecast?.find(
        (x) => cleanName(x.horseName) === cleanName(timeformTipSelection)
      )?.decimalOdds
    : 0;

  //console.log("Getting GYTO tip", gytoTips);
  const gytoTipSelectionObj = gytoTips?.find(
    (r) => normalizeTime(r.time) === normalizeTime(race.time)
  );
  const gytoTipSelection = gytoTipSelectionObj?.horse;
  //console.log("GYTO tip selection:", gytoTipSelection);

  //console.log("Getting GYTO tip odds");
  const gytoTipSelectionOdds = gytoTipSelection
    ? race.bettingForecast?.find(
        (x) => cleanName(x.horseName) === cleanName(gytoTipSelection)
      )?.decimalOdds
    : 0;
  //console.log("GYTO tip odds:", gytoTipSelectionOdds);

  //console.log("Getting Naps Table tip");
  const napsTableTipSelections = napsTableTips?.filter(
    (r) => normalizeTime(r.time) === normalizeTime(race.time)
  );
  //console.log("Naps Table tip selections:", napsTableTipSelections);

  const napsTableTipSelectionObj = napsTableTipSelections?.sort(
    (a, b) => (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0)
  )[0];
  const napsTableTipSelection = napsTableTipSelectionObj?.horse;
  //console.log("Naps Table tip selection:", napsTableTipSelection);
  const napsTableTipSelectionOdds = napsTableTipSelection
    ? race.bettingForecast?.find(
        (x) => cleanName(x.horseName) === cleanName(napsTableTipSelection)
      )?.decimalOdds
    : 0;
  //console.log("Naps Table tip odds:", napsTableTipSelectionOdds);

  // Find matching result for this race
  // Find matching result for this race
  //console.log("Finding race result", race.time, results?.results);

  const raceResult = results?.results.find(
    (r) => normalizeTime(r.time) === normalizeTime(race.time)
  );
  //console.log("Race result found:", raceResult, !!raceResult);

  // Helper function to get trophy emoji
  const getTrophy = (position: string) => {
    //console.log("Getting trophy for position:", position);
    switch (position.toLowerCase()) {
      case "1st":
        return "🏆";
      case "2nd":
        return "🥈";
      case "3rd":
        return "🥉";
      default:
        return "";
    }
  };

  // Helper function to get position for a horse
  const getHorsePosition = (horseName: string) => {
    //console.log("Getting position for horse:", horseName);
    if (!raceResult) return "";

    if (cleanName(raceResult.winner.name) === cleanName(horseName)) {
      //console.log("Horse was winner");
      return "1st";
    }

    const placed = raceResult.placedHorses.find(
      (h) => cleanName(h.name) === cleanName(horseName)
    );
    //console.log("Horse placed:", placed?.position);
    return placed?.position || "";
  };

  // Update allTheSame check to include GG tip

  const allPredictionsPicks = [
    topPrediction?.name,
    topScorer?.name,
    verdictPick,
    atrTipSelection,
    timeformTipSelection,
    gytoTipSelection,
    napsTableTipSelection,
  ];
  const allTheSame = allPredictionsPicks
    .filter((x) => x)

    .map((name) => (name ? cleanName(name) : ""))
    .every((val, _, arr) => val === arr[0]);

  // Check if 3 or more picks match
  const matchCount = [
    topPrediction?.name,
    verdictPick,
    atrTipSelection,
    timeformTipSelection,
    gytoTipSelection,
    napsTableTipSelection,
  ]
    .filter((x) => x)
    .map((name) => (name ? cleanName(name) : ""))
    .filter((x) => x === cleanName(topScorer?.name))
    .reduce((count, val, _, arr) => {
      const matches = arr.filter((x) => x === val).length;
      return matches >= count ? matches : count;
    }, 0);

  const threeOrMoreMatch = matchCount >= 2;
  // console.log(
  //   "Three or more picks match:",
  //   topScorer?.name,
  //   matchCount,
  //   [
  //     topPrediction?.name,
  //     verdictPick,
  //     atrTipSelection,
  //     timeformTipSelection,
  //     gytoTipSelection,
  //     napsTableTipSelection,
  //   ],
  //   threeOrMoreMatch
  // );
  // Update someTheSame to include GG tip
  const someTheSame = [
    topPrediction?.name,
    verdictPick,
    atrTipSelection,
    timeformTipSelection,
    gytoTipSelection,
    napsTableTipSelection,
  ]
    .filter((x) => x)
    .map((name) => (name ? cleanName(name) : ""))

    .some((val) => val === cleanName(topScorer?.name));
  //console.log("Some picks match:", someTheSame);

  //console.log("Getting odds");
  const verdictOdds = race.bettingForecast?.find(
    (x) => cleanName(x.horseName) === cleanName(verdictPick || "")
  )?.decimalOdds;

  const topScorerOdds = race.bettingForecast?.find(
    (x) => cleanName(x.horseName) === cleanName(topScorer?.name)
  )?.decimalOdds;

  const topPredictionOdds = race.bettingForecast?.find(
    (x) => cleanName(x.horseName) === cleanName(topPrediction?.name)
  )?.decimalOdds;

  //console.log("Verdict odds:", verdictOdds);
  //console.log("Top scorer odds:", topScorerOdds);
  //console.log("Top prediction odds:", topPredictionOdds);

  // Get positions and trophies for each pick
  //console.log("Getting positions and trophies");
  const topScorerPosition = topScorer ? getHorsePosition(topScorer.name) : "";
  const topScorerTrophy = getTrophy(topScorerPosition);
  const topPredictionPosition = topPrediction
    ? getHorsePosition(topPrediction.name)
    : "";
  const topPredictionTrophy = getTrophy(topPredictionPosition);
  const verdictPosition = verdictPick ? getHorsePosition(verdictPick) : "";
  const verdictTrophy = getTrophy(verdictPosition);

  const atrTipPosition = atrTipSelection
    ? getHorsePosition(atrTipSelection)
    : "";
  const atrTipTrophy = getTrophy(atrTipPosition);

  const timeformTipPosition = timeformTipSelection
    ? getHorsePosition(timeformTipSelection)
    : "";
  const timeformTipTrophy = getTrophy(timeformTipPosition);

  const gytoTipPosition = gytoTipSelection
    ? getHorsePosition(gytoTipSelection)
    : "";
  const gytoTipTrophy = getTrophy(gytoTipPosition);

  const napsTableTipPosition = napsTableTipSelection
    ? getHorsePosition(napsTableTipSelection)
    : "";
  const napsTableTipTrophy = getTrophy(napsTableTipPosition);

  return (
    <div
      className={`flex justify-between p-1 rounded ${
        index % 2 === 0 ? "bg-[#222440]" : ""
      }`}
    >
      <div className="flex gap-[0.1rem] w-20 items-center">
        <span className="font-semibold w-8 text-xs">{race.time}</span>
        {someTheSame && (
          <span className="text-yellow-400" title="Some picks agree">
            ★
          </span>
        )}
        {threeOrMoreMatch && (
          <span className="text-yellow-400" title="Some picks agree">
            ★
          </span>
        )}

        {allTheSame && (
          <span className="text-yellow-400" title="All picks agree">
            ★
          </span>
        )}
        {someTheSame && (topScorerOdds || 0) >= 6 && (
          <span className="text-blue-400" title="High odds agreement">
            ★
          </span>
        )}
      </div>

      <div
        className={`w-full flex-1 grid ${
          isToday ? "grid-cols-7" : "grid-cols-5"
        } gap-2 items-baseline text-sm`}
      >
        {topScorer && (
          <div
            className="flex items-center gap-2"
            title={"Top Scorer: " + race?.raceComment}
          >
            <span
              className={`font-medium ${
                (topScorer.score?.total?.percentage || 0) >= 50
                  ? "text-yellow-400 font-bold"
                  : (topScorer.score?.total?.percentage || 0) < 40
                  ? "text-[#626262]"
                  : "*:"
              }`}
            >
              {topScorer.name} {topScorerTrophy}{" "}
              {topScorer.score?.total?.percentage.toFixed(1)}{" "}
              {(topScorerOdds || 0) >= 6 ? (
                <span
                  className={(topScorerOdds || 0) >= 6 ? "text-blue-400" : ""}
                >
                  {topScorerOdds}
                </span>
              ) : (
                <></>
              )}
            </span>
          </div>
        )}

        {topPrediction && (
          <div
            className="flex items-center gap-2"
            title={
              "RP Prediction: " +
              sortedPredictions
                ?.map((x) => x.name + ":" + x.score?.toFixed(1))
                ?.join(", ")
            }
          >
            <span
              className={`font-medium ${
                predictionGap >= 10 ? "text-yellow-400 font-bold" : ""
              }`}
            >
              {topPrediction?.name} {topPredictionTrophy}
              {(topPredictionOdds || 0) >= 6 ? (
                <span
                  className={
                    (topPredictionOdds || 0) >= 6 ? "text-blue-400" : ""
                  }
                >
                  {topPredictionOdds}
                </span>
              ) : (
                <></>
              )}
            </span>
          </div>
        )}
        {verdictPick && (
          <div
            className="flex items-center gap-2"
            title={"RP Verdict: " + race.raceExtraInfo?.verdict?.comment}
          >
            <span
              className={`font-medium ${
                isNap ? "text-yellow-400 font-bold" : ""
              }`}
            >
              {verdictPick} {verdictTrophy}{" "}
              {(verdictOdds || 0) >= 6 ? (
                <span
                  className={(verdictOdds || 0) >= 6 ? "text-blue-400" : ""}
                >
                  {verdictOdds}
                </span>
              ) : (
                <></>
              )}
            </span>
          </div>
        )}
        {atrTipSelection && (
          <div
            className="flex items-center gap-2"
            title={"ATR: " + atrTipSelectionObj?.comment}
          >
            <span className="font-medium">
              {atrTipSelection} {atrTipTrophy}{" "}
              {(atrTipSelectionOdds || 0) >= 6 ? (
                <span
                  className={
                    (atrTipSelectionOdds || 0) >= 6 ? "text-blue-400" : ""
                  }
                >
                  {atrTipSelectionOdds}
                </span>
              ) : (
                <></>
              )}
            </span>
          </div>
        )}

        {timeformTipSelection && (
          <div
            className="flex items-center gap-2"
            title={"Timeform: " + timeformTipSelectionObj?.comment}
          >
            <span className="font-medium">
              {timeformTipSelectionObj?.horse} {timeformTipTrophy}{" "}
              {(timeformTipSelectionOdds || 0) >= 6 ? (
                <span
                  className={
                    (timeformTipSelectionOdds || 0) >= 6 ? "text-blue-400" : ""
                  }
                >
                  {timeformTipSelectionOdds}
                </span>
              ) : (
                <></>
              )}
            </span>
          </div>
        )}
        {gytoTipSelection && (
          <div className="flex items-center gap-2" title={"GYTP"}>
            <span
              className={`font-medium ${
                gytoTipSelectionObj?.isNap ? "text-yellow-400 font-bold" : ""
              }`}
            >
              {gytoTipSelection} {gytoTipTrophy}{" "}
              {(gytoTipSelectionOdds || 0) >= 6 ? (
                <span className="text-blue-400">{gytoTipSelectionOdds}</span>
              ) : (
                <></>
              )}
            </span>
          </div>
        )}
        {napsTableTipSelection && (
          <div className="flex items-center gap-2" title={"Naps Table"}>
            <span
              className={`font-medium ${
                parseFloat(napsTableTipSelectionObj?.score) >= 0
                  ? "text-yellow-400 font-bold"
                  : ""
              }`}
            >
              {napsTableTipSelection} {napsTableTipTrophy}{" "}
              {(napsTableTipSelectionOdds || 0) >= 6 ? (
                <span className="text-blue-400">
                  {napsTableTipSelectionOdds}
                </span>
              ) : (
                <></>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailedRaceRow({
  isToday,
  race,
  meeting,
  results,
  tips,
  gytoTips,
  napsTableTips,
}: {
  isToday: boolean;
  race: Race;
  meeting: Meeting;
  results: RaceResults | undefined;
  tips: DayTips | null;
  gytoTips: GytoTip[] | undefined;
  napsTableTips: NapsTableTip[] | undefined;
}) {
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
