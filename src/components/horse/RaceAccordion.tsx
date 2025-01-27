"use client";

import { useState, useEffect } from "react";
import { Race, sortPredictions } from "@/lib/generator/predictions";
import { AccordionButton } from "./accordions/AccordionButton";
import { AccordionContent } from "./accordions/AccordionContent";
import { useExpansion } from "./context/ExpansionContext";
import { PredictionAccordion } from "./PredictionAccordion";

interface RaceAccordionProps {
  race: Race;
}

export function RaceAccordion({ race }: RaceAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { expandAll } = useExpansion();
  const sortedPredictions = sortPredictions(race.predictions);

  useEffect(() => {
    setIsExpanded(expandAll);
  }, [expandAll]);

  return (
    <div className="race-section">
      <AccordionButton
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4 className="race-time">{race.time}</h4>
      </AccordionButton>
      <AccordionContent isExpanded={isExpanded}>
        {sortedPredictions.map((prediction, index) => (
          <PredictionAccordion
            key={prediction.horseName + index}
            horseName={prediction.horseName}
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
      </AccordionContent>
    </div>
  );
}
