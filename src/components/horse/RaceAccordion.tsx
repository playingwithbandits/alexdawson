"use client";

import { useState, useEffect } from "react";
import { AccordionButton } from "./accordions/AccordionButton";
import { AccordionContent } from "./accordions/AccordionContent";
import { useExpansion } from "./context/ExpansionContext";
import { Race } from "@/types/racing";

interface RaceAccordionProps {
  race: Race;
}

export function RaceAccordion({ race }: RaceAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { expandAll } = useExpansion();

  useEffect(() => {
    setIsExpanded(expandAll);
  }, [expandAll]);

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
              Avg SR: {Math.round(race.avgSpeedRating || 0)}
            </span>
            <span title="Average Official Rating">
              <i className="fas fa-chart-line"></i>
              Avg OR: {Math.round(race.avgOfficialRating || 0)}
            </span>
            <span title="Average Prize Money">
              <i className="fas fa-pound-sign"></i>
              Avg Prize: £{Math.round(race.avgPrize || 0)}k
            </span>
            <span title="Average Total Prize Money">
              <i className="fas fa-trophy"></i>
              Total Prize: £{Math.round(race.avgTotalPrize || 0)}k
            </span>
          </div>
        </div>
      </AccordionButton>
      <AccordionContent isExpanded={isExpanded}>
        {race.horses.map((horse, i) => (
          <>
            {horse.name} {horse.score} |{" "}
          </>
          // <PredictionAccordion
          //   key={horse.name + i}
          //   horseName={horse.name}
          //   score={horse.score}
          //   form={horse.form}
          //   raceStats={{
          //     avgSpeedRating: parseInt(horse.topSpeed) || 0,
          //     avgOfficialRating: parseInt(horse.officialRating) || 0,
          //     raceDistance: race.distance || "",
          //     going: race.going || "",
          //     avgPrize: 0,
          //     avgTotalPrize: 0,
          //   }}
          //   stats={{
          //     lastRaces: horse.form || "",
          //     winRate: {
          //       value: 0,
          //       isHighlighted: false,
          //     },
          //     placeRate: {
          //       value: 0,
          //       isHighlighted: false,
          //     },
          //     preferredGoing: {
          //       value: race.going || "",
          //       isHighlighted: false,
          //     },
          //     bestDistance: {
          //       value: race.distance || "",
          //       isHighlighted: false,
          //     },
          //     avgSpeedRating: {
          //       value: parseInt(horse.topSpeed) || 0,
          //       isHighlighted: false,
          //     },
          //     topSpeedRating: {
          //       value: parseInt(horse.topSpeed) || 0,
          //       isHighlighted: false,
          //     },
          //     weightCarried: horse.weight.display,
          //     officialRating: {
          //       value: parseInt(horse.officialRating) || 0,
          //       isHighlighted: false,
          //     },
          //     classRecord: `Class ${race.class || "Unknown"}`,
          //     trainer: horse.trainer.name,
          //     jockey: horse.jockey.name,
          //     trainerForm: {
          //       value: horse.trainer.stats || "",
          //       isHighlighted: false,
          //     },
          //     jockeyForm: {
          //       value: horse.jockey.allowance || "",
          //       isHighlighted: false,
          //     },
          //   }}
          // />
        ))}
      </AccordionContent>
    </div>
  );
}
