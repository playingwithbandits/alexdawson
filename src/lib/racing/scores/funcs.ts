import { avg } from "@/lib/utils";
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
    .replace(/[(]*nap[)]*$/gi, "")
    .replace(/'/gi, "")
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
      .replace("-aw", "")
      .replace("_", "-")
      .replace("-city", "")
      .replace(/\s+/g, "-")
      .trim();
  }
  return place_out;
};

export function parseDistance(distance: string): number {
  const miles = distance.match(/(\d+)m/);
  const furlongs = distance.match(/(\d+)f/);

  let totalFurlongs = 0;
  if (miles) totalFurlongs += parseInt(miles[1]) * 8;
  if (furlongs) totalFurlongs += parseInt(furlongs[1]);

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
  avgDistance: number
): "sprinter" | "middle" | "stayer" {
  if (avgDistance <= 7) return "sprinter";
  if (avgDistance <= 12) return "middle";
  return "stayer";
}

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

const badResultCodes = ["NR", "VOI", "RR", "WDU", "REF"];

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
        evalStr
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
  trackConfig: string
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
        `ERROR: Unable to determine draw bias for track config: ${trackConfig}`
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
  form: FormObj["form"]
): HorseStats["runStyle"] {
  const recentRaces = form?.slice(0, 6) || [];
  const comments = recentRaces.map(
    (r) => r.rpCloseUpComment?.toLowerCase() || ""
  );

  // Count running style indicators
  const leadCount = comments.filter(
    (c) => c.includes("made all") || c.includes("led") || c.includes("front")
  ).length;

  const prominentCount = comments.filter(
    (c) =>
      c.includes("prominent") || c.includes("tracked") || c.includes("pressed")
  ).length;

  const heldUpCount = comments.filter(
    (c) => c.includes("held up") || c.includes("behind") || c.includes("rear")
  ).length;

  // Determine predominant style
  if (leadCount >= 2) return "leader";
  if (prominentCount >= 2) return "prominent";
  if (heldUpCount >= 2) return "held up";

  // Log if no clear running style found
  if (leadCount === 0 && prominentCount === 0 && heldUpCount === 0) {
    console.log(
      "ERROR: Unable to determine running style from comments:",
      comments
    );
  }

  return "midfield"; // default if no clear pattern
}

export function isWithinTenPercent(
  distance: number,
  targetDistance: number
): boolean {
  const tenPercent = targetDistance * 0.1;
  return Math.abs(distance - targetDistance) <= tenPercent;
}
