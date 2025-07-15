import { RaceResults } from "@/types/racing";
import { cleanName } from "@/app/rp/utils/fetchRaceAccordion";
import { normalizeTime } from "../DayPredictions";
import { HoverTooltip } from "@/components/ui/HoverTooltip";
import { twMerge } from "tailwind-merge";

export type StarTitle =
  | "countGood"
  | "bestBeatenRprGood"
  | "bestBeatenRprMaxGood"
  | "bestBeatenOrGood"
  | "bestBeatenTsGood"
  | "rprBeatenToRaceBeatenAvgDiffGood"
  | "rprBeatenToRaceBeatenAvgDiffMaxGood"
  | "aiGood"
  | "rpPredGood"
  | "mentionedByTipster"
  | "sharpRatingGood"
  | "hasOlbgComment"
  | "hasOlbgNap"
  | "hasOlbgExpert"
  | "hasNotes";

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
  shownCountToBeHigherThan?: boolean;
  starsToBeHigherThan?: number;
  highlight3?: boolean;
  highlight4?: boolean;
  bg?: string;
  stars?: {
    title: StarTitle;
    value: boolean;
  }[];
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
  //console.log("Getting position for horse:", horseName);
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
  starsToBeHigherThan,
  highlight3,
  highlight4,
  bg,
  stars,
}: HorseNameRowProps) {
  if (showOnlyBest && !shownCountToBeHigherThan) {
    return <></>;
  }

  const isAGoodBet = highlight1 || highlight2 || highlight3 || highlight4;
  if (showOnlyBest && !isAGoodBet) {
    return <></>;
  }

  const isHighlight4 = highlight4;
  const isHighlight3 = highlight3 && !isHighlight4;
  const isHighlight2 = highlight2 && (!isHighlight3 || !isHighlight4);
  const isHighlight1 =
    highlight1 && (!isHighlight3 || !isHighlight2 || !isHighlight4);

  const totalStars =
    stars?.reduce((acc, star) => {
      if (star.value) {
        acc++;
      }
      return acc;
    }, 0) || 0;
  const starsTable =
    stars?.map(({ title, value }) => (value ? "⭐" : "☆")).join("|") || "";

  if (starsToBeHigherThan && totalStars < starsToBeHigherThan) {
    return <></>;
  }

  return (
    <HoverTooltip content={(title || "") + "\n" + starsTable}>
      <div
        className={twMerge(
          "flex justify-between",
          greyedOut ? "text-gray-500" : "",
          isHighlight1 ? "text-white" : "",
          isHighlight2 ? "text-[#f2f92c]" : "",
          isHighlight3 ? "text-[#ff881f]" : "",
          isHighlight4 ? "text-[#2df8ff]" : ""
        )}
        style={{ backgroundColor: bg }}
      >
        <span>
          {getTrophy(getHorsePosition(horseName, results, time))}
          <span className={isNonRunner ? "line-through text-red-900" : ""}>
            {horseName}
          </span>
        </span>

        <span className={`flex gap-2 text-white `}>
          <span>{extraText}</span>
          {/* <span className={`${oddsHighlight ? "text-[#1EEAFF]" : ""}`}>
            {odds.toFixed(2)}
          </span> */}
          <span className={`${totalStars >= 10 ? "text-[#1EEAFF]" : ""}`}>
            {totalStars}
          </span>
        </span>
      </div>
    </HoverTooltip>
  );
}
