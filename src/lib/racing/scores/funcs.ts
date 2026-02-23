import { avg, max } from "@/lib/utils";
import { FormObj, HorseStats } from "@/types/racing";

// Add helper function
export function calculateVariance(numbers: number[]): number {
  const mean = avg(numbers);
  const squareDiffs = numbers.map((n) => Math.pow(n - mean, 2));
  return avg(squareDiffs);
}

export function calculateDaysOff(raceDate?: string): number {
  if (!raceDate) return 0;
  const raceTime = new Date(raceDate).getTime();
  const now = new Date().getTime();
  return Math.floor((now - raceTime) / (1000 * 60 * 60 * 24));
}

export const horseNameToKey = (horse_name: string) => {
  const input = horse_name?.trim();
  const output = input
    ?.toLowerCase()
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/[(]*nap[)]*$/gi, "")
    .replace(/'/gi, "")
    .replace(/\d+/g, "")
    .replace(/\s+/g, "")
    .trim();

  return output;
};
export const placeToPlaceKey = (m_place: string) => {
  let place_out = m_place;
  if (m_place) {
    place_out = m_place
      .toLowerCase()
      .trim()
      .replace("_on_dee", "")
      .replace("-on-dee", "")
      .replace(" (aw)", "-aw")
      .replace(" (a.w)", "-aw")
      .replace("-aw", "")
      .replace("_", "-")
      .replace(" (july)", "")
      .replace("-july", "")
      .replace("-city", "")
      .replace("-(ireland)", "")
      .replace(" (ireland)", "")
      .replace("(ireland)", "")
      .replace("-(ire)", "")
      .replace(" (ire)", "")
      .replace("(ire)", "")
      .replace("-ire", "")
      .replace(" ire", "")
      .replace(/-$/g, "")

      .replace(/\s+/g, "-")
      .trim();
  }
  return place_out;
};
export function parseDistance(distance: string): number {
  const miles = distance.match(/(\d+)m/);
  const furlongs = distance.match(/(\d+(?:½|¼|¾)?)f/);

  let totalFurlongs = 0;
  if (miles) totalFurlongs += parseInt(miles[1]) * 8;
  if (furlongs) {
    const furlongValue = furlongs[1];
    if (furlongValue.includes("½")) {
      totalFurlongs += parseInt(furlongValue) + 0.5;
    } else if (furlongValue.includes("¼")) {
      totalFurlongs += parseInt(furlongValue) + 0.25;
    } else if (furlongValue.includes("¾")) {
      totalFurlongs += parseInt(furlongValue) + 0.75;
    } else {
      totalFurlongs += parseInt(furlongValue);
    }
  }

  return totalFurlongs;
}

export function getSeasonFromDate(dateStr?: string): string {
  if (!dateStr) return "unknown";
  const month = new Date(dateStr).getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

export function calculateDistancePreference(
  avgDistance: number,
): "sprinter" | "middle" | "stayer" {
  if (avgDistance <= 7) return "sprinter";
  if (avgDistance <= 12) return "middle";
  return "stayer";
}

interface RaceCodeMap {
  [name: string]: string;
}
export const raceCodeToText = (code?: string | null) => {
  const decoder: RaceCodeMap = {
    H: "Hurdle",
    C: "Chase",
    U: "Chase",
    F: "T Flat",
    B: "T NH Flat",
    W: "AW NH Flat",
    X: "AW Flat",
    P: "PTP",
  };
  const decoder_res = code ? decoder[code] || null : null;
  if (!decoder_res) {
    console.log("Sort out: " + code);
  }
  return decoder_res ? decoder_res : code;
};

export function getRaceType(formRaceCode: string | undefined) {
  if (!formRaceCode) return null;
  switch (formRaceCode) {
    case "P":
    case "H":
      return "hurdle";
    case "C":
    case "U":
      return "chase";
    case "F":
    case "B":
      return "flat";
    case "W":
    case "X":
      return "aw";
    default:
      console.log(`ERROR: Unknown race type code: ${formRaceCode}`);
      return null;
  }
}

export function isValidOutcome(raceOutcomeCode: string | undefined): boolean {
  if (!raceOutcomeCode) return false;

  const parsed = parseInt(raceOutcomeCode);
  if (isNaN(parsed)) {
    //console.log(`Invalid race outcome code: ${raceOutcomeCode}`);
    return false;
  }

  return true;
}

export const distanceToWinnerStrToFloat = (code: string) => {
  let result = 0;
  if (code && code != "undefined" && code != "null") {
    code = "" + code;
    const evalStr = code
      .replace("snse", "+0.05")
      .replace("nse", "+0.1")
      .replace("sht", "+0.2")
      .replace("shd", "+0.2")
      .replace("shd", "+0.2")
      .replace("snk", "+0.25")
      .replace("hd", "+0.25")
      .replace("nk", "+0.3")
      .replace("½", "+0.5")
      .replace("⅓", "+0.33")
      .replace("⅔", "+0.66")
      .replace("¼", "+0.25")
      .replace("¾", "+0.75")
      .replace("⅕", "+0.20")
      .replace("⅖", "+0.40")
      .replace("⅗", "+0.60")
      .replace("⅘", "+0.80")
      .replace("+L", "")
      .replace("L", "")
      .replace("dht", "+0");
    let evaled = null;
    try {
      evaled = eval(evalStr);
    } catch (e) {
      console.log(
        "ERROR: parsing distance:",
        e,
        "Input:",
        code,
        "Evaluated:",
        evalStr,
      );
    }
    result = parseFloat(evaled) || 0;
  }
  return result;
};

export function isBadDraw(
  draw: number,
  totalRunners: number,
  distance: number,
  trackConfig: string,
): boolean {
  if (!draw || !totalRunners) return false;

  const drawPercentile = (draw / totalRunners) * 100;

  // Sprint races (less than 8f)
  if (distance < 8) {
    if (trackConfig?.toLowerCase().includes("straight")) {
      return drawPercentile > 80; // High draws often disadvantaged
    }
    if (
      !trackConfig?.toLowerCase().includes("right") &&
      !trackConfig?.toLowerCase().includes("left")
    ) {
      console.log(
        `ERROR: Unable to determine draw bias for track config: ${trackConfig}`,
      );
      return false;
    }
    return trackConfig?.toLowerCase().includes("right")
      ? drawPercentile < 20
      : drawPercentile > 80;
  }

  // Longer races - wide draws generally disadvantaged
  return drawPercentile > 80;
}

export function determineRunStyle(
  form: FormObj["form"],
): HorseStats["runStyle"] {
  const recentRaces = form?.slice(0, 12) || [];
  const comments = recentRaces.map(
    (r) => r.rpCloseUpComment?.toLowerCase() || "",
  );

  // Enhanced running style indicators with weights
  const styleIndicators = {
    leader: {
      strong: [
        "made all",
        "led throughout",
        "set steady pace",
        "set pace",
        "always led",
        "made running",
        "led from start",
        "led early",
        "led from outset",
        "soon led",
        "led after",
        "made virtually all",
      ],
      medium: [
        "led",
        "disputed lead",
        "pressed leader",
        "front",
        "soon led",
        "went on",
        "set out to make all",
        "disputed",
        "made the running",
        "set the pace",
        "led narrowly",
        "led briefly",
        "went clear",
      ],
      weak: [
        "went clear",
        "tracked leader",
        "went on",
        "made running",
        "chased leader",
        "pressed pace",
        "tracked pace",
        "disputed early lead",
        "led momentarily",
        "vied for lead",
        "shared lead",
      ],
    },
    prominent: {
      strong: [
        "prominent",
        "tracked leaders",
        "chased leaders",
        "disputed",
        "pressed leaders",
        "always prominent",
        "up with pace",
        "close up",
        "tracked pace",
        "chased pace",
        "disputed second",
        "raced freely",
      ],
      medium: [
        "close up",
        "tracked pace",
        "handy",
        "towards fore",
        "up with pace",
        "pressed pace",
        "tracked leader",
        "chased leader",
        "second throughout",
        "disputed third",
        "raced keenly",
        "well placed",
      ],
      weak: [
        "within touch",
        "not far away",
        "disputed third",
        "went second",
        "tracked main group",
        "with leaders",
        "near pace",
        "close to pace",
        "followed leaders",
        "on heels of leaders",
        "prominent early",
      ],
    },
    midfield: {
      strong: [
        "midfield",
        "mid division",
        "middle",
        "tracked main body",
        "mid pack",
        "in touch",
        "covered up",
        "settled midfield",
        "central",
        "tracked main group",
        "covered up midfield",
        "always midfield",
      ],
      medium: [
        "in touch",
        "covered up",
        "settled",
        "tracked main group",
        "with main group",
        "tracked majority",
        "amongst rivals",
        "within touch",
        "settled well",
        "took closer order",
        "well placed",
        "good position",
      ],
      weak: [
        "waited with",
        "took time",
        "steady pace",
        "off the pace",
        "settled behind",
        "tracked others",
        "with others",
        "in company",
        "behind leaders",
        "held position",
        "maintained position",
      ],
    },
    heldUp: {
      strong: [
        "held up",
        "in rear",
        "behind",
        "last",
        "back of field",
        "at rear",
        "always last",
        "well back",
        "far back",
        "dropped out",
        "outpaced",
        "always behind",
      ],
      medium: [
        "towards rear",
        "dropped out",
        "detached",
        "waited with",
        "at back",
        "behind rivals",
        "never near",
        "never involved",
        "well off pace",
        "lost touch",
        "lost contact",
        "tailed off",
      ],
      weak: [
        "patiently ridden",
        "off the pace",
        "dropped back",
        "outpaced",
        "steadied",
        "restrained",
        "held back",
        "waited tactics",
        "bided time",
        "gradually back",
        "never showed",
        "never on terms",
      ],
    },
  };

  // Calculate weighted scores for each style
  const scores = {
    leader: 0,
    prominent: 0,
    midfield: 0,
    heldUp: 0,
  };

  comments.forEach((comment, index) => {
    // Weight more recent races higher (last 3 races get 2x weight)
    const weight = index < 3 ? 2 : 1;

    Object.entries(styleIndicators).forEach(([style, patterns]) => {
      // Strong indicators (3 points)
      if (patterns.strong.some((pattern) => comment.includes(pattern))) {
        scores[style as keyof typeof scores] += 3 * weight;
      }
      // Medium indicators (2 points)
      if (patterns.medium.some((pattern) => comment.includes(pattern))) {
        scores[style as keyof typeof scores] += 2 * weight;
      }
      // Weak indicators (1 point)
      if (patterns.weak.some((pattern) => comment.includes(pattern))) {
        scores[style as keyof typeof scores] += 1 * weight;
      }
    });
  });

  // Find the predominant style
  const maxScore = max(Object.values(scores) as number[]);
  const predominantStyles = Object.entries(scores)
    .filter(([, score]) => score === maxScore)
    .map(([style]) => style);

  // If there's a clear winner, return it
  if (predominantStyles.length === 1) {
    return predominantStyles[0] as HorseStats["runStyle"];
  }

  // If no clear pattern or tied scores
  if (maxScore === 0 || predominantStyles.length > 1) {
    // Bias towards midfield when uncertain
    return "midfield";
  }

  return "midfield"; // Default fallback
}

export function isWithinTenPercent(
  distance: number,
  targetDistance: number,
): boolean {
  const tenPercent = targetDistance * 0.1;
  return Math.abs(distance - targetDistance) <= tenPercent;
}

export const distanceBeatenLengthsThreshold = (
  raceDistance: number | undefined,
) => {
  if (!raceDistance) return 0;

  if (raceDistance <= 6.5) {
    return 2;
  }
  if (raceDistance <= 8.5) {
    return 3;
  }
  if (raceDistance <= 11.5) {
    return 4;
  }
  if (raceDistance <= 19.5) {
    return 5;
  }
  if (raceDistance <= 22.5) {
    return 6;
  }
  return 7;
};

export const isGoodDistanceToWinner = (
  raceDistance: number | undefined,
  distanceCode: string | undefined,
) => {
  if (!raceDistance || !distanceCode) return false;

  const distanceToWinnerFloat = distanceToWinnerStrToFloat(distanceCode || "");
  const distanceBeatenLengthsThreshold2 =
    distanceBeatenLengthsThreshold(raceDistance);

  return distanceToWinnerFloat <= distanceBeatenLengthsThreshold2;
};
