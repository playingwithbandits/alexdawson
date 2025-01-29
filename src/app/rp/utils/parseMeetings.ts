interface VideoDetail {
  ptvVideoId?: number;
  videoProvider?: string;
  completeRaceUid?: number;
  completeRaceStart?: number;
  completeRaceEnd?: number;
  finishRaceUid?: number;
  finishRaceStart?: number;
  finishRaceEnd?: number;
}

interface RaceTactics {
  actual?: {
    runnerAttribType?: null | string;
    runnerAttribDescription?: null | string;
  };
  predicted?: {
    runnerAttribType?: null | string;
    runnerAttribDescription?: null | string;
  };
}

interface FormEntry {
  raceInstanceUid?: number;
  raceGroupUid?: number;
  raceDatetime?: string;
  localMeetingRaceDatetime?: string;
  courseUid?: number;
  courseTypeCode?: string;
  courseName?: string;
  courseStyleName?: string;
  courseRegion?: string;
  countryCode?: string;
  raceInstanceTitle?: string;
  raceTypeCode?: string;
  courseRpAbbrev3?: string;
  courseRpAbbrev4?: string;
  courseCode?: string;
  courseComments?: string;
  goingTypeServicesDesc?: string;
  prizeSterling?: number;
  prizeEuro?: number;
  distanceYard?: number;
  distanceFurlong?: number;
  raceClass?: null | number;
  agesAllowedDesc?: string;
  rpBettingMovements?: string;
  raceGroupCode?: string;
  raceGroupDesc?: string;
  weightCarriedLbs?: number;
  weightAllowanceLbs?: number;
  noOfRunners?: number;
  rpCloseUpComment?: string;
  horseHeadGear?: string | null;
  firstTimeHeadgear?: boolean;
  oddsDesc?: string;
  oddsValue?: number;
  jockeyStyleName?: string;
  jockeyShortName?: string;
  jockeyUid?: number;
  jockeyPtpTypeCode?: string;
  officialRatingRanOff?: number;
  rpTopspeed?: number;
  rpPostmark?: number;
  videoDetail?: VideoDetail[];
  raceDescription?: string;
  distanceToWinner?: string | null;
  winningDistance?: string | null;
  goingTypeCode?: string;
  raceOutcomeCode?: string;
  otherHorse?: {
    styleName?: string;
    horseUid?: number;
    weightCarriedLbs?: number;
  };
  disqualificationUid?: null | number;
  disqualificationDesc?: null | string;
  rpStraightRoundJubileeDesc?: null | string;
  draw?: number;
  raceTactics?: RaceTactics;
}

interface RaceRecord {
  starts?: number;
  wins?: number;
  "2nds"?: number;
  "3rds"?: number;
  winnigs?: number;
  earnings?: number;
  totalPrize?: number;
  winPrize?: number;
  netTotalPrize?: number;
  netWinPrize?: number;
  euroWinPrize?: number;
  euroTotalPrize?: number;
  usdWinPrize?: number;
  usdTotalPrize?: number;
  bestTs?: number;
  bestRpr?: number;
  "or+"?: number;
  stake?: number;
  latestBhb?: number | null;
}

interface FormObj {
  form?: FormEntry[];
  raceRecords?: {
    lifetimeRecords?: {
      "All-weather"?: RaceRecord;
      "Rules Races"?: RaceRecord;
    };
    flatPlacings?: {
      [year: string]: number[];
    };
    jumpsPlacings?: null | unknown;
    flatFiguresCalculated?: Array<{
      formFigure?: string;
      raceTypeCode?: string | null;
    }>;
    jumpsFiguresCalculated?: null | unknown;
    surfaceRecord?: Array<{
      surfaceDesc: string;
      surfaceCode: string;
      runs: number | null;
      wins: number | null;
    }>;
  };
}

export interface Horse {
  name: string;
  profileUrl: string;
  formUrl: string;
  formObj?: FormObj;
  number: string;
  draw?: string;
  age: string;
  headGear?: {
    code: string;
    description: string;
  };
  weight: {
    pounds: number;
    display: string;
  };
  jockey: {
    name: string;
    allowance?: string;
  };
  trainer: {
    name: string;
    stats?: string;
  };
  owner: string;
  rating: string;
  officialRating: string;
  topSpeed: string;
  form?: string;
  lastRun?: string;
  score?: number;
}

export interface Bet {
  horseName: string;
  odds: string;
}

export interface RaceStats {
  avgOfficialRating: number;
  avgRating: number;
  avgTopSpeed: number;
  avgAge: number;
  avgWeight: number;
  avgLastRunDays: number;
  totalPrizeMoney: number;
  avgPrizeMoney: number;
}

export interface Race {
  time: string;
  title: string;
  runners: number;
  distance: string;
  class: string;
  ageRestriction: string;
  tv: string;
  prize?: string;
  url: string;
  going?: string;
  surface?: string;
  raceType?: string;
  trackCondition?: string;
  weather?: string;
  drawBias?: string;
  avgSpeedRating?: number;
  avgOfficialRating?: number;
  avgPrize?: number;
  avgTotalPrize?: number;
  avgRating?: number;
  stalls?: string;
  ewTerms?: string;
  raceVerdict?: string;
  bettingForecast?: Bet[];
  raceStats?: RaceStats;
  horses: Horse[];
}

export interface Meeting {
  venue: string;
  surface: string;
  firstRace: string;
  lastRace: string;
  type: string;
  raceCount: string;
  going: string;
  races: Race[];
}

async function fetchRaceDetails(url: string): Promise<string> {
  console.log("fetchRaceDetails", url);
  if (!url || url.trim() === "") {
    console.error("❌ No URL provided");
    return "";
  }
  const response = await fetch(`/getP.php?q=${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch race details: ${response.status}`);
  }
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const content = doc.querySelector(".js-RC-mainContent section");
  return content?.outerHTML || "";
}

async function parseRaceDetails(html: string): Promise<Partial<Race>> {
  console.log("🔄 Starting parseRaceDetails...");
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const headerBox = doc.querySelector(".RC-headerBox");
  const horses: Horse[] = [];

  console.log("📊 Parsing betting forecast...");
  // Parse betting forecast
  const bettingForecast: Bet[] = [];
  const forecastElement = doc.querySelector(".RC-bettingForecast");
  if (forecastElement) {
    const forecastText = forecastElement.textContent?.trim() || "";
    // Split on commas and parse each bet
    const bets = forecastText.split(",").map((bet) => bet.trim());
    bets.forEach((bet) => {
      // Format is typically "Horse Name 5/1"
      const match = bet.match(/(.+?)\s+(\d+(?:\/|\.)\d+)$/);
      if (match) {
        bettingForecast.push({
          horseName: match[1].trim(),
          odds: match[2].trim(),
        });
      }
    });
  }

  console.log("🐎 Parsing horses...");
  // Parse horses from runner rows
  const rowsElements = doc.querySelectorAll(".RC-runnerRow");
  const rows = Array.from(rowsElements).slice(0, 3);
  console.log(`Found ${rows.length} horses to parse`);

  for (const row of rows) {
    const horse: Horse = {
      name: row.querySelector(".RC-runnerName")?.textContent?.trim() || "",
      profileUrl: (() => {
        const profileLink = row.querySelector(
          ".RC-runnerName.ui-link"
        ) as HTMLAnchorElement;
        return profileLink?.href
          ? "https://www.racingpost.com" + new URL(profileLink.href).pathname
          : "";
      })(),
      formUrl: (() => {
        const profileLink = row.querySelector(
          ".RC-runnerName.ui-link"
        ) as HTMLAnchorElement;
        if (!profileLink?.href) return "";
        const path = new URL(profileLink.href).pathname;
        return (
          "https://www.racingpost.com" +
          path.replace("/profile/horse/", "/profile/tab/horse/") +
          "/form"
        );
      })(),
      formObj: await (async () => {
        const formLink = row.querySelector(
          ".RC-runnerName.ui-link"
        ) as HTMLAnchorElement;
        if (!formLink?.href) return undefined;
        const path = new URL(formLink.href).pathname;
        const formUrl =
          "https://www.racingpost.com" +
          path.replace("/profile/horse/", "/profile/tab/horse/") +
          "/form";
        try {
          const response = await fetch(
            `/getP.php?q=${encodeURIComponent(formUrl)}`
          );
          if (!response.ok) return undefined;
          return await response.json();
        } catch (error) {
          console.error("Failed to fetch form data:", error);
          return undefined;
        }
      })(),
      number:
        row.querySelector(".RC-runnerNumber__no")?.textContent?.trim() || "",
      draw: row
        .querySelector(".RC-runnerNumber__draw")
        ?.textContent?.replace(/[()]/g, "")
        .trim(),
      age: row.querySelector(".RC-runnerAge")?.textContent?.trim() || "",
      headGear: (() => {
        const code = row
          .querySelector(".RC-runnerHeadgearCode")
          ?.textContent?.trim();
        return code
          ? {
              code,
              description: code, // Removed mapHeadgear since it's undefined
            }
          : undefined;
      })(),
      weight: (() => {
        const wgtElement = row.querySelector(".RC-runnerWgt__carried");
        const pounds = Number(wgtElement?.getAttribute("data-order-wgt") || 0);
        const stone = Math.floor(pounds / 14);
        const remainingPounds = pounds % 14;
        const display = `${stone}-${remainingPounds}`;
        return {
          pounds,
          display: display,
        };
      })(),
      jockey: {
        name:
          row
            .querySelector(".RC-runnerInfo_jockey .RC-runnerInfo__name")
            ?.textContent?.trim() || "",
        allowance: row
          .querySelector(".RC-runnerInfo_jockey .RC-runnerInfo__count")
          ?.textContent?.trim(),
      },
      trainer: {
        name:
          row
            .querySelector(".RC-runnerInfo_trainer .RC-runnerInfo__name")
            ?.textContent?.trim() || "",
        stats: row
          .querySelector(".RC-runnerInfo_trainer .RC-runnerInfo__count")
          ?.textContent?.trim(),
      },
      owner:
        row
          .querySelector(".RC-runnerInfo_owner .RC-runnerInfo__name")
          ?.textContent?.trim() || "",
      rating: row.querySelector(".RC-runnerRpr")?.textContent?.trim() || "",
      officialRating:
        row.querySelector(".RC-runnerOr")?.textContent?.trim() || "",
      topSpeed: row.querySelector(".RC-runnerTs")?.textContent?.trim() || "",
      form: row.querySelector(".RC-runnerInfo__form")?.textContent?.trim(),
      lastRun: row
        .querySelector(".RC-runnerStats__lastRun")
        ?.textContent?.trim(),
    };
    horses.push(horse);
  }

  // Calculate relative scores for all horses in the race

  // Extract prize money from title or other elements
  const prizeMatch = doc
    .querySelector(".RC-header__prize")
    ?.textContent?.match(/£([\d,]+)/);
  const prizeMoney = prizeMatch ? parseInt(prizeMatch[1].replace(/,/g, "")) : 0;

  const resultPre = {
    time:
      doc.querySelector(".RC-courseHeader__time")?.textContent?.trim() || "",
    title:
      doc
        .querySelector(`[data-test-selector="RC-header__raceInstanceTitle"]`)
        ?.textContent?.trim() || "",
    runners: horses.length,
    distance:
      doc
        .querySelector(`[data-test-selector="RC-header__raceDistance"]`)
        ?.textContent?.trim() || "",
    class:
      doc
        .querySelector(`[data-test-selector="RC-header__raceClass"]`)
        ?.textContent?.trim() || "",
    ageRestriction:
      doc.querySelector(".RC-courseHeader__age")?.textContent?.trim() || "",
    tv: doc.querySelector(".RC-courseHeader__tv")?.textContent?.trim() || "",
    url: "", // This will be set by the caller
    going: headerBox
      ?.querySelector("[data-test-selector='RC-headerBox__going']")
      ?.textContent?.trim(),
    surface: doc
      .querySelector(".RC-courseHeader__surface")
      ?.textContent?.trim(),
    raceType: doc
      .querySelector(".RC-courseHeader__raceType")
      ?.textContent?.trim(),
    trackCondition: doc
      .querySelector(".RC-courseHeader__condition")
      ?.textContent?.trim(),
    weather: doc
      .querySelector(".RC-courseHeader__weather")
      ?.textContent?.trim(),
    drawBias: doc
      .querySelector(".RC-courseHeader__drawBias")
      ?.textContent?.trim(),
    prize: prizeMoney ? `£${prizeMoney.toLocaleString()}` : "",
    stalls: headerBox
      ?.querySelector("[data-test-selector='RC-headerBox__stalls']")
      ?.textContent?.trim(),
    ewTerms: headerBox
      ?.querySelector("[data-test-selector='RC-headerBox__terms']")
      ?.textContent?.trim(),
    raceVerdict: doc.querySelector(".RC-verdict")?.textContent?.trim(),
    bettingForecast,
    horses,
  };

  const raceStats = calculateRaceStats(resultPre);

  const result: Race = {
    ...resultPre,
    raceStats,
    horses: horses?.map((x) => ({
      ...x,
      score: calculateHorseScore(x, resultPre, raceStats),
    })),
  };

  console.log("🏁 Completed parseRaceDetails", result);
  return result;
}

export async function parseMeetings(elements: Element[]): Promise<Meeting[]> {
  return Promise.all(
    elements.map(async (element) => {
      // Get meeting venue and going
      const venueElement = element.querySelector(".RC-accordion__courseName");
      const surfaceElement = element.querySelector(".RC-accordion__surface");
      const firstRaceElement = element.querySelector(
        '[data-test-selector="RC-accordion__firstRaceTime"]'
      );
      const lastRaceElement = element.querySelector(
        '[data-test-selector="RC-accordion__lastRaceTime"]'
      );
      const typeElement = element.querySelector(
        '[data-test-selector="RC-accordion__meetingType"]'
      );
      const raceCountElement = element.querySelector(
        '[data-test-selector="RC-accordion__raceCount"]'
      );
      const goingElement = element.querySelector(
        '[data-test-selector="RC-courseDescription__info"]'
      );

      // Get all races for this meeting
      const raceElements = element.querySelectorAll(
        '[data-test-selector="RC-courseCards__raceRow"]'
      );

      console.log("Venue:", venueElement?.textContent);
      console.log("Races found:", raceElements.length);

      const races = await Promise.all(
        Array.from(raceElements)
          .slice(0, 1)
          .map(async (raceElement): Promise<Race> => {
            const linkElement = raceElement.querySelector(
              ".RC-meetingItem__link"
            ) as HTMLAnchorElement;
            const timeElement = raceElement.querySelector(
              '[data-test-selector="RC-courseCards__time"]'
            );
            const titleElement = raceElement.querySelector(
              '[data-test-selector="RC-courseCards__info"]'
            );
            const runnersElement = raceElement.querySelector(
              '[data-test-selector="RC-courseCards__runners"]'
            );
            const goingDataElement = raceElement.querySelector(
              '[data-test-selector="RC-courseCards__going"]'
            );
            const tvElement = raceElement.querySelector(
              '[data-test-selector="RC-meetingItem__tv"]'
            );

            // Parse going data text which contains class, age restriction and distance
            const goingData =
              goingDataElement?.textContent
                ?.trim()
                .split("\n")
                .map((s) => s.trim()) || [];
            const [classInfo, ageRestriction, distance] = goingData;

            // Extract the path from the full URL
            const raceUrl = linkElement?.href
              ? "https://www.racingpost.com" +
                new URL(linkElement.href).pathname
              : "";

            let details = "";
            let additionalDetails: Partial<Race> = { horses: [] };

            try {
              console.log(`Processing race at ${raceUrl}`);
              details = await fetchRaceDetails(raceUrl);
              if (details) {
                console.log("📝 Got race details, starting parse...");
                additionalDetails = await parseRaceDetails(details);
                console.log(`✨ Parsed race details for ${raceUrl}:`, {
                  horsesCount: additionalDetails.horses?.length,
                  going: additionalDetails.going,
                  surface: additionalDetails.surface,
                });
              }
            } catch (error) {
              console.error(
                `Failed to fetch/parse details for race at ${raceUrl}:`,
                error
              );
            }

            console.log(`📊 Race details for ${raceUrl}:`, {
              horsesCount: additionalDetails.horses?.length,
              hasGoing: !!additionalDetails.going,
              hasSurface: !!additionalDetails.surface,
              hasBettingForecast: !!additionalDetails.bettingForecast?.length,
            });
            return {
              time: timeElement?.textContent?.trim() || "",
              title: titleElement?.textContent?.trim() || "",
              runners: parseInt(
                runnersElement?.textContent?.trim().split(" ")[0] || "0",
                10
              ),
              distance: distance || "",
              class: classInfo || "",
              ageRestriction: ageRestriction || "",
              tv: tvElement?.textContent?.trim() || "",
              url: raceUrl,
              horses: [],
              ...additionalDetails,
            };
          })
      );

      return {
        venue: venueElement?.textContent?.trim() || "",
        surface: surfaceElement?.textContent?.trim() || "",
        firstRace: firstRaceElement?.textContent?.trim() || "",
        lastRace:
          lastRaceElement?.textContent?.trim().replace(/[&nbsp;-]*/g, "") || "",
        type: typeElement?.textContent?.trim() || "",
        raceCount: raceCountElement?.textContent?.trim() || "",
        going:
          goingElement?.textContent?.trim().replace(/^GOING\s*/i, "") || "",
        races,
      };
    })
  );
}

export function calculateRaceStats(race: Partial<Race>): RaceStats {
  const horses = race.horses || [];
  return {
    avgOfficialRating: avg(horses.map((h) => parseInt(h.officialRating) || 0)),
    avgRating: avg(horses.map((h) => parseInt(h.rating) || 0)),
    avgTopSpeed: avg(horses.map((h) => parseInt(h.topSpeed) || 0)),
    avgAge: avg(horses.map((h) => parseInt(h.age) || 0)),
    avgWeight: avg(horses.map((h) => h.weight.pounds || 0)),
    avgLastRunDays: avg(
      horses.map((h) => parseInt(h.lastRun?.split(" ")[0] || "0"))
    ),
    totalPrizeMoney: parseInt(race.prize?.replace(/[£,]/g, "") || "0"),
    avgPrizeMoney:
      parseInt(race.prize?.replace(/[£,]/g, "") || "0") / (horses.length || 1),
  };
}

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b) / nums.length : 0;
}

export function calculateHorseScore(
  horse: Horse,
  race: Partial<Race>,
  stats: RaceStats
): number {
  const weights = {
    rating: 0.3,
    officialRating: 0.25,
    topSpeed: 0.2,
    age: 0.1,
    weight: 0.1,
    lastRun: 0.05,
  };

  const scores = {
    rating: normalize(parseInt(horse.rating) || 0, stats.avgRating),
    officialRating: normalize(
      parseInt(horse.officialRating) || 0,
      stats.avgOfficialRating
    ),
    topSpeed: normalize(parseInt(horse.topSpeed) || 0, stats.avgTopSpeed),
    age: normalize(parseInt(horse.age) || 0, stats.avgAge),
    weight: normalize(horse.weight.pounds, stats.avgWeight),
    lastRun: normalize(
      parseInt(horse.lastRun?.split(" ")[0] || "0"),
      stats.avgLastRunDays
    ),
  };

  const weightedScore = Object.entries(weights).reduce(
    (sum, [key, weight]) => sum + scores[key as keyof typeof scores] * weight,
    0
  );

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  );

  console.log("totalScore", {
    weightedScore,
    totalScore,
    scores,
    horse,
    stats,
  });

  return normalize(weightedScore, totalScore);
}

function normalize(value: number, avg: number): number {
  return avg ? value / avg : 0;
}
