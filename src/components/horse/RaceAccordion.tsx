"use client";

import { Race } from "@/types/racing";
import { useEffect, useState } from "react";
import { AccordionButton } from "./accordions/AccordionButton";
import { AccordionContent } from "./accordions/AccordionContent";
import { useExpansion } from "./context/ExpansionContext";
import { HorseRow } from "./HorseRow";

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
    <>
      <div className="predictions-table">
        <AccordionButton
          isExpanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="race-time">{race.time}</h3>
        </AccordionButton>
        <AccordionContent isExpanded={isExpanded}>
          {race.horses.map((horse) => (
            <HorseRow key={horse.name} horse={horse} score={horse.score} />
          ))}
        </AccordionContent>
      </div>
    </>
    // <div className="space-y-2">
    //   <div className="grid grid-cols-8 gap-2 px-4 text-sm font-medium text-muted-foreground">
    //     <div>No.</div>
    //     <div className="col-span-2">Horse</div>
    //     <div>Age</div>
    //     <div>Weight</div>
    //     <div>Jockey</div>
    //     <div>Trainer</div>
    //     <div>Score</div>
    //   </div>
    //   {race.horses.map((horse) => (
    //     <HorseRow key={horse.name} horse={horse} score={horse.score} />
    //   ))}
    // </div>
  );
}
