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

export function MeetingAccordion({ meeting }: MeetingAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { expandAll } = useExpansion();

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
        {meeting.races.map((race, race_i) => (
          <RaceAccordion key={race.time + race_i} race={race} />
        ))}
      </AccordionContent>
    </div>
  );
}
