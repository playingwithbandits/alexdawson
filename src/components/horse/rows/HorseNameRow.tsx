import { RaceResults } from "@/types/racing";
import { cleanName } from "@/app/rp/utils/fetchRaceAccordion";
import { normalizeTime } from "../DayPredictions";
import { HoverTooltip } from "@/components/ui/HoverTooltip";

interface HorseNameRowProps {
  horseName: string;
  results: RaceResults | undefined;
  time: string;
  odds: number;
  extraText?: string;
  oddsHighlight?: boolean;
  isNonRunner?: boolean;
  greyedOut?: boolean;
  highlight1?: boolean;
  highlight2?: boolean;
  title?: string;
  showOnlyBest: boolean;
  shownCountToBeHigherThan: boolean;
  highlight3?: boolean;
}

const getTrophy = (position: string) => {
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

const getHorsePosition = (
  horseName: string,
  results: RaceResults | undefined,
  time: string
) => {
  console.log("Getting position for horse:", horseName);
  const raceResult = results?.results.find(
    (r) => normalizeTime(r.time) === normalizeTime(time)
  );

  if (!raceResult) return "";

  if (cleanName(raceResult.winner.name) === cleanName(horseName)) {
    console.log("Horse was winner");
    return "1st";
  }

  const placed = raceResult.placedHorses.find(
    (h) => cleanName(h.name) === cleanName(horseName)
  );
  console.log("Horse placed:", placed?.position);
  return placed?.position || "";
};

export function HorseNameRow({
  horseName,
  results,
  time,
  odds,
  extraText,
  oddsHighlight,
  isNonRunner,
  greyedOut,
  highlight1,
  highlight2,
  title,
  showOnlyBest,
  shownCountToBeHigherThan,
  highlight3,
}: HorseNameRowProps) {
  if (showOnlyBest && !shownCountToBeHigherThan) {
    return <></>;
  }

  const isAGoodBet = highlight1 || highlight2;
  if (showOnlyBest && !isAGoodBet) {
    return <></>;
  }
  return (
    <HoverTooltip content={title || ""}>
      <div
        className={`flex justify-between ${greyedOut ? "text-gray-500" : ""} ${
          highlight1 && !highlight2 ? "text-[#f2f92c]" : ""
        } ${highlight2 ? "text-[#ff881f]" : ""} ${
          highlight3 ? "text-[#00ff00]" : ""
        }`}
      >
        <span>
          {getTrophy(getHorsePosition(horseName, results, time))}
          <span className={isNonRunner ? "line-through text-red-900" : ""}>
            {horseName}
          </span>
        </span>
        <span className={`flex gap-2 `}>
          <span>{extraText}</span>
          <span className={`${oddsHighlight ? "text-[#1EEAFF]" : ""}`}>
            {odds.toFixed(2)}
          </span>
        </span>
      </div>
    </HoverTooltip>
  );
}
