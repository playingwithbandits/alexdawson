"use client";

import { useState, useEffect } from "react";
import { Meeting } from "@/lib/generator/predictions";
import { AccordionButton } from "./accordions/AccordionButton";
import { AccordionContent } from "./accordions/AccordionContent";
import { RaceAccordion } from "./RaceAccordion";
import { useExpansion } from "./context/ExpansionContext";

interface MeetingAccordionProps {
  meeting: Meeting;
}

function sortRacesByTime(races: Meeting["races"]) {
  return [...races].sort((a, b) => {
    const timeA = Number(a.time.replace(":", ""));
    const timeB = Number(b.time.replace(":", ""));
    return timeA - timeB;
  });
}

export function MeetingAccordion({ meeting }: MeetingAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { expandAll } = useExpansion();
  const sortedRaces = sortRacesByTime(meeting.races);

  useEffect(() => {
    setIsExpanded(expandAll);
  }, [expandAll]);

  return (
    <div className="predictions-table">
      <AccordionButton
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="meeting-name">{meeting.name}</h3>
      </AccordionButton>
      <AccordionContent isExpanded={isExpanded}>
        {sortedRaces.map((race, race_i) => (
          <RaceAccordion key={race.time + race_i} race={race} />
        ))}
      </AccordionContent>
    </div>
  );
}
