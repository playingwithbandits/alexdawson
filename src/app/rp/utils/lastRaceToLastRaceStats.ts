import {
  distanceBeatenLengthsThreshold,
  distanceToWinnerStrToFloat,
  horseNameToKey,
} from "@/lib/racing/scores/funcs";
import { LastRaceRunner, LastRaceStats } from "@/lib/racing/scores/types";
import { avg, max } from "@/lib/utils";

export async function lastRaceToLastRaceStats(
  lastRaceEle: string,
  input_name: string,
  distanceF: number,
  lastRaceTypeCode: string,
): Promise<LastRaceStats> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(lastRaceEle, "text/html");

  const horseTableEle = doc.querySelector(".rp-horseTable__table");

  const runners: LastRaceRunner[] = [];

  const rows = horseTableEle?.querySelectorAll("tr.rp-horseTable__mainRow");
  rows?.forEach((row) => {
    // Get position number without draw
    const posText =
      row.querySelector(".rp-horseTable__pos__number")?.textContent?.trim() ||
      "";
    const position = parseInt(posText);

    // Get draw number
    const drawText =
      row
        .querySelector(".rp-horseTable__pos__draw")
        ?.textContent?.replace(/[()]/g, "")
        .trim() || "";
    const draw = parseInt(drawText);

    // Get horse name
    const horseName =
      row.querySelector(".rp-horseTable__horse__name")?.textContent?.trim() ||
      "";
    const name = horseNameToKey(horseName);

    // Get odds
    const oddsText =
      row.querySelector(".rp-horseTable__horse__price")?.textContent?.trim() ||
      "";
    const oddsFraction = oddsText.replace("F", "").split("/");
    const oddsDec =
      oddsFraction.length === 2
        ? parseInt(oddsFraction[0]) / parseInt(oddsFraction[1]) + 1
        : 0;

    // Get ratings
    const or =
      parseInt(
        row.querySelector('td[data-ending="OR"]')?.textContent?.trim() || "0",
      ) || 0;
    const rpr =
      parseInt(
        row.querySelector('td[data-ending="RPR"]')?.textContent?.trim() || "0",
      ) || 0;
    const ts =
      parseInt(
        row.querySelector('td[data-ending="TS"]')?.textContent?.trim() || "0",
      ) || 0;

    // Get age
    const age =
      parseInt(
        row
          .querySelector(".rp-horseTable__spanNarrow_age")
          ?.textContent?.trim() || "0",
      ) || 0;

    // Get trainer
    const trainer =
      row
        .querySelector('[data-prefix="T:"] .rp-horseTable__human__link')
        ?.textContent?.trim() || "";

    // Get jockey
    const jockeyText =
      row
        .querySelector('[data-prefix="J:"] .rp-horseTable__human__link')
        ?.textContent?.trim() || "";
    const jockey = parseInt(jockeyText) || 0;

    // Get beaten distance
    const distanceText =
      row
        .querySelector(".rp-horseTable__pos__length span:last-child")
        ?.textContent?.trim()
        .replace(/[\[\]]/g, "") || "";
    const distanceBeaten = distanceToWinnerStrToFloat(distanceText) || 0;

    const profileUrl_grab =
      row.querySelector(".rp-horseTable__horse__name")?.getAttribute("href") ||
      "";
    const profileUrl = profileUrl_grab
      ? "https://www.racingpost.com" + profileUrl_grab
      : "";
    runners.push({
      name,
      profileUrl,
      position,
      or,
      rpr,
      ts,
      draw,
      age,
      trainer,
      jockey,
      oddsDec,
      distanceBeaten,
    });
  });

  const currentHorse = runners.find((r) => r.name === input_name);

  const distanceBeaten = currentHorse?.distanceBeaten || 0;

  const distanceBeatenThreshold =
    currentHorse?.position === 1
      ? 0
      : distanceBeaten - distanceBeatenLengthsThreshold(distanceF);

  const distanceBeatenThreshold2 = distanceBeaten + 15;

  const runners_beaten: LastRaceRunner[] = [];

  runners.forEach((r) => {
    if (
      r.distanceBeaten <= distanceBeatenThreshold2 &&
      r.distanceBeaten >= distanceBeatenThreshold
    ) {
      runners_beaten.push(r);
    }
  });

  //if all runners are grouped up then all - if there's a big gap then closest 3

  // Calculate averages
  const averages = {
    or: runners.length
      ? avg(runners.map((r) => r.or)?.filter(Boolean)) || 0
      : 0,
    rpr: runners.length
      ? avg(runners.map((r) => r.rpr)?.filter(Boolean)) || 0
      : 0,
    ts: runners.length
      ? avg(runners.map((r) => r.ts)?.filter(Boolean)) || 0
      : 0,
    draw: runners.length
      ? avg(runners.map((r) => r.draw)?.filter(Boolean)) || 0
      : 0,
    age: runners.length
      ? avg(runners.map((r) => r.age)?.filter(Boolean)) || 0
      : 0,
  };

  const averages_beaten = {
    or: runners_beaten.length
      ? avg(runners_beaten.map((r) => r.or)?.filter(Boolean)) || 0
      : 0,
    rpr: runners_beaten.length
      ? avg(runners_beaten.map((r) => r.rpr)?.filter(Boolean)) || 0
      : 0,
    ts: runners_beaten.length
      ? avg(runners_beaten.map((r) => r.ts)?.filter(Boolean)) || 0
      : 0,
    draw: runners_beaten.length
      ? avg(runners_beaten.map((r) => r.draw)?.filter(Boolean)) || 0
      : 0,
    age: runners_beaten.length
      ? avg(runners_beaten.map((r) => r.age)?.filter(Boolean)) || 0
      : 0,
  };
  // Calculate maxes
  const maxes = {
    or: max(runners.map((r) => r.or)?.filter(Boolean)) || 0,
    rpr: max(runners.map((r) => r.rpr)?.filter(Boolean)) || 0,
    ts: max(runners.map((r) => r.ts)?.filter(Boolean)) || 0,
    draw: max(runners.map((r) => r.draw)?.filter(Boolean)) || 0,
    age: max(runners.map((r) => r.age)?.filter(Boolean)) || 0,
  };

  const maxes_beaten = {
    or: max(runners_beaten.map((r) => r.or)?.filter(Boolean)) || 0,
    rpr: max(runners_beaten.map((r) => r.rpr)?.filter(Boolean)) || 0,
    ts: max(runners_beaten.map((r) => r.ts)?.filter(Boolean)) || 0,
    draw: max(runners_beaten.map((r) => r.draw)?.filter(Boolean)) || 0,
    age: max(runners_beaten.map((r) => r.age)?.filter(Boolean)) || 0,
  };

  const raceInfoEle = doc.querySelector(".rp-raceInfo");
  // Find winning time info
  const winningTimeText = Array.from(raceInfoEle?.querySelectorAll("li") || [])
    .find((li) => li.textContent?.includes("Winning time:"))
    ?.querySelectorAll(".rp-raceInfo__value")[2]
    ?.textContent?.trim();

  // Parse winning time and status
  let winningTimeSeconds = 0;
  let winningTimeStatus = "";

  if (winningTimeText) {
    // Extract time value (e.g. "1m 10.20s" or "57.53s")
    const timeMatchMinutes = winningTimeText.match(/(\d+)m\s+(\d+\.\d+)s/);
    const timeMatchSeconds = winningTimeText.match(/^(\d+\.\d+)s/);

    if (timeMatchMinutes) {
      const minutes = parseInt(timeMatchMinutes[1]);
      const seconds = parseFloat(timeMatchMinutes[2]);
      winningTimeSeconds = minutes * 60 + seconds;
    } else if (timeMatchSeconds) {
      winningTimeSeconds = parseFloat(timeMatchSeconds[1]);
    }

    // Extract status (e.g. "(standard time)" or "(slow by 0.93s)")
    const statusMatch = winningTimeText.match(/\((.*?)\)/);
    if (statusMatch) {
      winningTimeStatus = statusMatch[1];
    }
  }

  let timePerFurlong = 0;
  timePerFurlong =
    winningTimeSeconds && distanceF ? winningTimeSeconds / distanceF : 0;

  if (
    currentHorse?.position &&
    currentHorse?.position > 1 &&
    distanceBeaten > 0 &&
    timePerFurlong > 0
  ) {
    const distanceBeatenInFurlongs = distanceBeaten / 11;

    timePerFurlong =
      timePerFurlong * (1 + distanceBeatenInFurlongs / distanceF);
  }

  const info = {
    winningTimeSeconds,
    winningTimeStatus,
    distanceF,
    timePerFurlong,
  };

  // console.log(
  //   "🏁 Last Race To Last Race Stats",
  //   {
  //     input_name,
  //     distanceF,
  //     distanceBeaten,
  //     distanceBeatenThreshold,
  //   },
  //   {
  //     runners,
  //     averages,
  //     maxes,
  //     runners_beaten,
  //     averages_beaten,
  //     maxes_beaten,
  //   }
  // );

  if (!horseTableEle) {
    console.error("🏁 lastRaceToLastRaceStats - No horse table element found");
  }
  if (!rows || rows.length === 0) {
    console.error("🏁 lastRaceToLastRaceStats - No rows found");
  }

  // console.log("🏁 lastRaceToLastRaceStats - Last Race To Last Race Stats", {
  //   raceTypeCode: lastRaceTypeCode,
  //   runners_all: runners,
  //   averages_all: averages,
  //   maxes_all: maxes,
  //   runners_beaten,
  //   averages_beaten,
  //   maxes_beaten,
  //   info,
  //   doc,
  // });
  return {
    raceTypeCode: lastRaceTypeCode,
    runners_all: runners,
    averages_all: averages,
    maxes_all: maxes,
    runners_beaten,
    averages_beaten,
    maxes_beaten,
    info,
  };
}
