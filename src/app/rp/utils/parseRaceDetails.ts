import type { Race, Bet, Meeting, Horse } from "@/types/racing";
import { fetchRaceDetails } from "./fetchRaceDetails";
import { calculateHorseStats } from "@/lib/racing/calculateHorseStats";
import { calculateRaceStats } from "@/lib/racing/calculateRaceStats";
import { calculateHorseScore } from "@/lib/racing/calculateHorseScore";
import { fetchHorseForm } from "@/lib/racing/fetchHorseForm";

export async function parseRaceDetails(html: string): Promise<Partial<Race>> {
  console.log("🔄 Starting parseRaceDetails...");
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const headerBox = doc.querySelector(".RC-headerBox");

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

  const horses: Horse[] = await Promise.all(
    rows.map(async (row, index) => {
      const profileLink = row.querySelector(
        ".RC-runnerName.ui-link"
      ) as HTMLAnchorElement;
      const profileUrl = profileLink?.href
        ? "https://www.racingpost.com" + new URL(profileLink.href).pathname
        : "";
      const formObj = await fetchHorseForm(profileUrl);

      return {
        name: row.querySelector(".RC-runnerName")?.textContent?.trim() || "",
        profileUrl,
        formObj,
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
          const pounds = Number(
            wgtElement?.getAttribute("data-order-wgt") || 0
          );
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
        stats: calculateHorseStats(formObj),
      };
    })
  );

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
