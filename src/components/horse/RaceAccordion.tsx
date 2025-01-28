"use client";

import { useState, useEffect } from "react";
import { FormEntry, Race, sortPredictions } from "@/lib/generator/predictions";
import { AccordionButton } from "./accordions/AccordionButton";
import { AccordionContent } from "./accordions/AccordionContent";
import { useExpansion } from "./context/ExpansionContext";
import { PredictionAccordion } from "./PredictionAccordion";

interface RaceAccordionProps {
  race: Race;
}

const convertDistanceToFurlongs = (distance: string): number => {
  const [value, unit] = distance.toLowerCase().split(/(?<=\d)(?=[a-z])/);
  const numValue = parseFloat(value);

  switch (unit) {
    case "f":
    case "fur":
    case "furlongs":
      return numValue;
    case "m":
    case "mile":
    case "miles":
      return numValue * 8;
    default:
      return 0;
  }
};
function calculateWinRate(races: FormEntry[]): number {
  const wins = races.filter((race) => race.position === 1).length;
  return (wins / races.length) * 100;
}

function calculatePlaceRate(races: FormEntry[]): number {
  const places = races.filter((race) => {
    if (race.totalRunners < 5) return race.position <= 1;
    if (race.totalRunners < 8) return race.position <= 2;
    if (race.totalRunners < 12) return race.position <= 3;
    return race.position <= 3;
  }).length;
  return (places / races.length) * 100;
}

export function RaceAccordion({ race }: RaceAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { expandAll } = useExpansion();
  const sortedPredictions = sortPredictions(race.predictions);

  // Calculate race averages
  const raceStats = {
    avgSpeedRating:
      race.predictions.reduce((sum, p) => sum + p.stats.avgSpeedRating, 0) /
      race.predictions.length,
    avgOfficialRating:
      race.predictions.reduce((sum, p) => sum + p.officialRating, 0) /
      race.predictions.length,
    raceDistance: race.distance,
    going: race.going,
    avgPrize:
      race.predictions.reduce((sum, p) => sum + p.form.prizeStats.avgPrize, 0) /
      race.predictions.length,
    avgTotalPrize:
      race.predictions.reduce(
        (sum, p) => sum + p.form.prizeStats.totalPrize,
        0
      ) / race.predictions.length,
  };

  useEffect(() => {
    setIsExpanded(expandAll);
  }, [expandAll]);

  function isDistanceWithinRange(
    bestDistance: string,
    raceDistance: string
  ): boolean {
    const optimal = convertDistanceToFurlongs(bestDistance);
    const race = convertDistanceToFurlongs(raceDistance);
    const diff = Math.abs(optimal - race);
    const threshold = race * 0.1; // 10% threshold
    return diff <= threshold;
  }

  return (
    <div className="race-section">
      <AccordionButton
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="race-header">
          <div className="race-time-info">
            <h4 className="race-time">{race.time}</h4>
            <span className="race-class">Class {race.class}</span>
          </div>
          <div className="race-details">
            <span className="race-type">{race.raceType}</span>
            <span className="race-distance">{race.distance}</span>
            <span className="race-surface">{race.surface}</span>
            <span className="race-going" title={race.trackCondition}>
              {race.going}
            </span>
            <span className="race-weather">{race.weather}</span>
            {race.drawBias && (
              <span className="race-draw" title="Draw Bias">
                {race.drawBias}
              </span>
            )}
            <span className="race-prize">{race.prize}</span>
            <span className="race-runners">{race.runners} runners</span>
          </div>
          <div className="race-stats">
            <span title="Average Speed Rating">
              <i className="fas fa-tachometer-alt"></i>
              Avg SR: {Math.round(raceStats.avgSpeedRating)}
            </span>
            <span title="Average Official Rating">
              <i className="fas fa-chart-line"></i>
              Avg OR: {Math.round(raceStats.avgOfficialRating)}
            </span>
            <span title="Average Prize Money">
              <i className="fas fa-pound-sign"></i>
              Avg Prize: £{Math.round(raceStats.avgPrize)}k
            </span>
            <span title="Average Total Prize Money">
              <i className="fas fa-trophy"></i>
              Total Prize: £{Math.round(raceStats.avgTotalPrize)}k
            </span>
          </div>
        </div>
      </AccordionButton>
      <AccordionContent isExpanded={isExpanded}>
        {sortedPredictions.map((prediction, index) => (
          <PredictionAccordion
            key={prediction.horseName + index}
            horseName={prediction.horseName}
            score={prediction.score}
            form={prediction.form}
            raceStats={raceStats}
            stats={{
              lastRaces: "1-3-2-4-1",
              winRate: {
                value: calculateWinRate(prediction.form.lastRaces),
                isHighlighted: calculateWinRate(prediction.form.lastRaces) > 30,
              },
              placeRate: {
                value: calculatePlaceRate(prediction.form.lastRaces),
                isHighlighted:
                  calculatePlaceRate(prediction.form.lastRaces) > 50,
              },
              preferredGoing: {
                value: prediction.form.goingStats.preferredGoing.join(", "),
                isHighlighted: prediction.form.goingStats.preferredGoing.some(
                  (going) =>
                    going.toLowerCase().includes(race.going.toLowerCase())
                ),
              },
              bestDistance: {
                value: prediction.form.distanceStats.avgDistance.toString(),
                isHighlighted: isDistanceWithinRange(
                  prediction.form.distanceStats.avgDistance.toString(),
                  race.distance
                ),
              },
              avgSpeedRating: {
                value: prediction.stats.avgSpeedRating,
                isHighlighted:
                  prediction.stats.avgSpeedRating > raceStats.avgSpeedRating,
              },
              topSpeedRating: { value: 92, isHighlighted: false },
              weightCarried: "9-2",
              officialRating: {
                value: prediction.officialRating,
                isHighlighted:
                  prediction.officialRating > raceStats.avgOfficialRating,
              },
              classRecord: "Class 2: 3 wins from 5 runs",
              trainer: "John Smith",
              jockey: "Ryan Moore",
              trainerForm: { value: "23% last 14 days", isHighlighted: false },
              jockeyForm: { value: "18% last 14 days", isHighlighted: false },
            }}
          />
        ))}
      </AccordionContent>
    </div>
  );
}
