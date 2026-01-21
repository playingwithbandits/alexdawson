import {
  calculateDrawBias,
  TrackConfiguration,
} from "@/lib/racing/calculateDrawBias";
import { calculateHorseStats } from "@/lib/racing/calculateHorseStats";
import { calculateRaceStats } from "@/lib/racing/calculateRaceStats";
import { fetchHorseForm } from "@/lib/racing/fetchHorseForm";
import { generateRaceComment } from "@/lib/racing/generateRaceComment";
import { getTrackConfiguration } from "@/lib/racing/getTrackConfiguration";
import { calculateHorseScore3 } from "@/lib/racing/scores/calculateHorseScore3";
import {
  getRaceType,
  horseNameToKey,
  isValidOutcome,
  parseDistance,
  placeToPlaceKey,
} from "@/lib/racing/scores/funcs";
import type {
  AllValidFormRowsStatsDataStatsType,
  Bet,
  Horse,
  Meeting,
  Race,
} from "@/types/racing";
import { fetchFormRaceDetails } from "./fetchFormRaceDetails";
import { fetchPredictions } from "./fetchPredictions";
import { fetchRaceAccordion } from "./fetchRaceAccordion";
import { lastRaceToLastRaceStats } from "./lastRaceToLastRaceStats";
import { matchRaceTypeCode, max, min } from "@/lib/utils";

export async function parseRaceDetails(
  html: string,
  raceUrl: string,
  meetingDetails: Partial<Meeting>
): Promise<Partial<Race>> {
  //console.log("🔄 Starting parseRaceDetails...");
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const headerBox = doc.querySelector(".RC-headerBox");

  //console.log("📊 Parsing betting forecast...", html);
  // Parse betting forecast
  const bettingForecast: Bet[] = [];
  const forecastElement = doc.querySelector(
    `[data-test-selector="RC-bettingForecast_container"]`
  );

  if (forecastElement) {
    // Get all forecast groups
    const forecastGroups = forecastElement.querySelectorAll(
      '[data-test-selector="RC-bettingForecast_group"]'
    );

    forecastGroups.forEach((group) => {
      // Get odds (first text node)
      const odds = group.childNodes[0].textContent?.trim() || "";

      // Get all horses in this odds group
      const horses = Array.from(
        group.querySelectorAll('[data-test-selector="RC-bettingForecast_link"]')
      );

      // Convert fractional odds to decimal
      const [num, den] = odds.split("/").map(Number);
      const decimalOdds = num && den ? num / den + 1 : 2;

      // Create a bet entry for each horse at these odds
      horses.forEach((horse) => {
        bettingForecast.push({
          horseName: horse.textContent?.trim() || "",
          odds: odds,
          decimalOdds: Number(decimalOdds.toFixed(2)),
        });
      });
    });
  }

  const raceTitle =
    doc
      .querySelector(`[data-test-selector="RC-header__raceInstanceTitle"]`)
      ?.textContent?.replace(/\s+/g, " ")
      .trim() || "";

  const raceGoing = headerBox
    ?.querySelector(
      "[data-test-selector='RC-headerBox__going'] > .RC-headerBox__infoRow__content"
    )
    ?.textContent?.replace(/Going:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const raceTitleLower = raceTitle?.toLowerCase();

  // Test examples for chase detection:
  // ✅ Should match: "Chase Stakes", "Steeplechase", "Chase", "Maiden Chase"
  // ❌ Should NOT match: "Chasemore Oaks", "Chaseable", "Chaser"
  // Test examples for hurdle detection:
  // ✅ Should match: "Hurdle Stakes", "Novice Hurdle", "Hurdle", "Maiden Hurdle"
  // ❌ Should NOT match: "Hurdlemore Oaks", "Hurdleable", "Hurdler"
  const isHurdle = /\bhurdle(?:\b|$)/.test(raceTitleLower || "");
  const isChase = /\bchase(?:\b|$)/.test(raceTitleLower || "");
  const isAW =
    raceGoing?.includes("standard") ||
    raceGoing?.includes("slow") ||
    raceGoing?.includes("fast") ||
    meetingDetails.type?.toLowerCase().includes("all-weather") ||
    meetingDetails.surface?.toLowerCase().includes("polytrack") ||
    meetingDetails.surface?.toLowerCase().includes("tapeta");

  let raceCode = "F";
  if (isHurdle) {
    raceCode = "H";
  }
  if (isChase) {
    raceCode = "C";
  }
  if (isAW) {
    raceCode = "X";
  }

  //console.log("🏁 raceCode", raceCode, isHurdle, isChase, isAW, raceTitleLower);

  const raceTypeCode = raceCode || "";

  const raceDistance = parseDistance(
    doc
      .querySelector(`[data-test-selector="RC-header__raceDistanceRound"]`)
      ?.textContent?.replace(/\s+/g, " ")
      .trim() || ""
  );

  //console.log("🐎 Parsing horses...");
  // Parse horses from runner rows
  const rowsElements = doc.querySelectorAll(
    ".RC-runnerRow:not(.RC-runnerRow_disabled)"
  );
  const rows = Array.from(rowsElements);
  //console.log(`Found ${rows.length} horses to parse`);
  const twoYearsAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 2);
  const oneYearAgo = new Date(
    Date.now() - 1000 * 60 * 60 * 24 * 365
  );

  const formValidDateThreshold = oneYearAgo;
  const fetchFormDateThreshold = oneYearAgo;

  // This is fully async: all fetching is performed before continuing; after Promise.all resolves,
  // no further awaits or network operations occur relating to horse/form data/stat fetching.
  // Everything the rest of the process needs (including remote fetches for form and race stats per horse)
  // is completed within the async map and its inner awaits.

  const horses: Horse[] = await Promise.all(
    rows.map(async (row) => {
      // Fetch all required remote data up front for this horse within the async function.
      // Nothing outside (after await Promise.all) relies on lazy fetching.

      // Fetch the horse's profile/form data
      const profileLink = row.querySelector(
        ".RC-runnerName.ui-link"
      ) as HTMLAnchorElement;
      const profileUrl = profileLink?.href
        ? "https://alexdawson.co.uk/getP.php?q=https://www.racingpost.com" +
          new URL(profileLink.href).pathname
        : "";
      const formObj = await fetchHorseForm(profileUrl);

      const name = horseNameToKey(
        row.querySelector(".RC-runnerName")?.textContent?.trim() || ""
      );

      const formTableEle = row.querySelector(
        `[data-test-selector="RC-runnerFormBody"]`
      );
      const formRows = formTableEle?.querySelectorAll("tr");

      // Find valid form rows (all DOM and formObj work, no fetch)
      const formRowsValid = Array.from(formRows || [])?.filter((x) => {
        const outcomeCell = x.querySelector(
          '[data-test-selector="RC-runnerFormRow__outcome"]'
        );
        const outcomeText =
          outcomeCell?.querySelector("a")?.textContent?.trim() || "";
        const raceOutcomeCode = outcomeText.split("/")[0];

        const formRowValidDate =
          x
            ?.querySelector('[data-test-selector="RC-runnerFormLink__results"]')
            ?.getAttribute("href")
            ?.split("/")?.[4] || undefined;

        const matchingFormObj = formRowValidDate
          ? formObj?.form?.find((x) => {
              const date1 = x.raceDatetime
                ? new Date(x.raceDatetime || "").toISOString().split("T")[0]
                : undefined;
              const date2 = formRowValidDate
                ? new Date(formRowValidDate || "").toISOString().split("T")[0]
                : undefined;
              return date1 === date2;
            })
          : undefined;

        const isMatchingRaceCode = matchRaceTypeCode(
          matchingFormObj?.raceTypeCode,
          raceTypeCode
        );

        console.log(
          `🏁 parseRaceDetails - isMatchingRaceCode for ${name} on ${formRowValidDate}`,
          raceCode,
          raceOutcomeCode,
          isMatchingRaceCode
        );

        const date = new Date(formRowValidDate || "");

        return (
          isValidOutcome(raceOutcomeCode) &&
          date >= formValidDateThreshold &&
          isMatchingRaceCode
        );
      });

      // For each valid form row: fetch the previous race details and parse
      // All fetching and expensive work for each horse completed right here.
      const allValidFormRowsStatsData = await Promise.all(
        formRowsValid.map(async (latestFormRow) => {
          const outcomeCell = latestFormRow?.querySelector(
            '[data-test-selector="RC-runnerFormRow__outcome"]'
          );
          const outcomeLink = outcomeCell?.querySelector("a");
          const lastRaceLink = outcomeLink?.href
            ? "https://alexdawson.co.uk/getP.php?q=https://www.racingpost.com" +
              new URL(outcomeLink.href).pathname
            : "";

          // Try repeatedly loading last race details up to 100 times if required
          let lastRaceEle = "";
          let tryCount = 0;
          let retryDoc: Document | null = null;
          while (tryCount < 100) {
            tryCount++;

            if (lastRaceLink) {
              await new Promise((resolve) =>
                setTimeout(resolve, 5000)
              );
              const retryRaceEle = await fetchFormRaceDetails(lastRaceLink);
              const retryParser = new DOMParser();
              retryDoc = retryParser.parseFromString(
                retryRaceEle || "",
                "text/html"
              );
              if (retryDoc.querySelector(".rp-horseTable__table")) {
                // Successfully loaded the correct page
                lastRaceEle = retryRaceEle;
                break;
              } else {
                console.log(
                  `🏁 parseRaceDetails -  attempt ${tryCount}`,
                  lastRaceLink
                );
              }
            } else {
              // No link to retry
              break;
            }
          }

          console.log(
            `🏁 parseRaceDetails - element found after ${tryCount} attempts`,
            lastRaceLink
          );

          const formRowValidDate =
            latestFormRow
              ?.querySelector(
                '[data-test-selector="RC-runnerFormLink__results"]'
              )
              ?.getAttribute("href")
              ?.split("/")?.[4] || undefined;

          const matchingFormObj = formRowValidDate
            ? formObj?.form?.find((x) => {
                const date1 = x.raceDatetime
                  ? new Date(x.raceDatetime || "").toISOString().split("T")[0]
                  : undefined;
                const date2 = formRowValidDate
                  ? new Date(formRowValidDate || "").toISOString().split("T")[0]
                  : undefined;
                return date1 === date2;
              })
            : undefined;

          const lastRaceTypeCode = matchingFormObj?.raceTypeCode || "";

          const lastFormRowFromDistanceYard =
            matchingFormObj?.distanceYard || 0;
          const lastFormRowDistanceFurlongAccurate =
            lastFormRowFromDistanceYard * 0.00454545;

          const lastRaceStatsObj = lastRaceEle
            ? await lastRaceToLastRaceStats(
                lastRaceEle,
                name,
                lastFormRowDistanceFurlongAccurate || raceDistance,
                lastRaceTypeCode
              )
            : undefined;

          if (
            !lastRaceStatsObj?.runners_all ||
            lastRaceStatsObj?.runners_all?.length === 0
          ) {
            console.error(
              "🏁 lastRaceToLastRaceStats - No last race stats object found",
              lastRaceLink
            );
          }

          // All network/DOM/lastRace parsing is done here
          return {
            formRowValidDate,
            lastRaceStatsObj,
            matchingFormObj,
            name,
            lastFormRowDistanceFurlongAccurate:
              lastFormRowDistanceFurlongAccurate || raceDistance,
            lastRaceTypeCode,
          };
        })
      );

      // Compute stats on the previously fetched data, no more async work here
      const allFormRowsStatsDataStatsObjs = allValidFormRowsStatsData
        .map((x) => x.lastRaceStatsObj)
        .filter((x) => x !== undefined);

      const minTimePerFurlong =
        min(
          allFormRowsStatsDataStatsObjs
            .map((x) => x.info?.timePerFurlong || 0)
            ?.filter(Boolean)
        ) || 0;
      const maxBeatenAvgsRpr =
        max(
          allFormRowsStatsDataStatsObjs
            .map((x) => x.averages_beaten?.rpr || 0)
            ?.filter(Boolean)
        ) || 0;
      const maxBeatenMaxesRpr =
        max(
          allFormRowsStatsDataStatsObjs
            .map((x) => x.maxes_beaten?.rpr || 0)
            ?.filter(Boolean)
        ) || 0;

      const allValidFormRowsStatsDataStats: AllValidFormRowsStatsDataStatsType =
        {
          raw: allValidFormRowsStatsData,
          maxBeatenAvgsRpr,
          maxBeatenMaxesRpr,
          minTimePerFurlong,
        };

      // At this point, everything downstream is pure in-memory synchronous computation

      return {
        name,
        profileUrl,
        lastRaceStats:
          allValidFormRowsStatsDataStats?.raw?.[0]?.lastRaceStatsObj,
        allValidFormRowsStatsDataStats,
        formObj: {
          ...formObj,
          form: formObj?.form?.filter(
            (x) =>
              // isValidOutcome(x.raceOutcomeCode) &&
              // x.officialRatingRanOff &&
              // x.officialRatingRanOff > 0 &&
              // x.raceClass !== null &&
              new Date(x.raceDatetime || "") >= fetchFormDateThreshold
          ),
        },
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

  //console.log("🐎 horses", horses);

  // Calculate relative scores for all horses in the race
  // Extract prize money from title or other elements
  const prizeMatch = doc
    .querySelector(
      `[data-test-selector="RC-headerBox__winner"] > .RC-headerBox__infoRow__content`
    )
    ?.textContent?.match(/£([\d,]+)/);
  const prizeMoney = prizeMatch ? parseInt(prizeMatch[1].replace(/,/g, "")) : 0;

  const courseName = placeToPlaceKey(
    doc
      .querySelector(`[data-test-selector="RC-courseHeader__name"]`)
      ?.textContent?.toLowerCase()
      .trim() || ""
  );

  // First calculate base race data
  const baseRaceData: Partial<Race> = {
    time:
      doc
        .querySelector(".RC-courseHeader__time")
        ?.textContent?.replace(/\s+/g, " ")
        .trim() || "",
    id: raceUrl.split("/").pop() || "",
    title: raceTitle,
    runners: horses.length,
    distance: raceDistance,

    class:
      parseInt(
        doc
          .querySelector(`[data-test-selector="RC-header__raceClass"]`)
          ?.textContent?.replace(/[()]/g, "")
          .replace(/\s+/g, " ")
          ?.replace("Class", "")
          .trim() || ""
      ) || 0,
    ageRestriction:
      doc
        .querySelector(`[data-test-selector="RC-header__rpAges"]`)
        ?.textContent?.replace(/\s+/g, " ")
        .trim() || "",
    tv: doc.querySelector(".RC-courseHeader__tv")?.textContent?.trim() || "",
    url: "", // This will be set by the caller
    going: raceGoing,
    // Get track configuration from course header
    trackConfig: getTrackConfiguration(courseName),
    prize: prizeMoney ? `£${prizeMoney.toLocaleString()}` : "",
    stalls:
      headerBox
        ?.querySelector(
          "[data-test-selector='RC-headerBox__stalls'] > .RC-headerBox__infoRow__content"
        )
        ?.textContent?.replace(/Stalls:\s*/i, "")
        .replace(/\s+/g, " ")
        .trim() || "",
    ewTerms:
      headerBox
        ?.querySelector(
          "[data-test-selector='RC-headerBox__terms'] > .RC-headerBox__infoRow__content"
        )
        ?.textContent?.replace(/Terms:\s*/i, "")
        .replace(/\s+/g, " ")
        .trim() || "",

    bettingForecast,
    horses,
  };

  // Calculate draw bias based on track configuration
  const drawBiasInfo = calculateDrawBias(
    baseRaceData.trackConfig as TrackConfiguration,
    baseRaceData.distance || 0,
    baseRaceData.going,
    meetingDetails.venue
  );

  baseRaceData.drawBias = drawBiasInfo.bias;
  baseRaceData.drawBiasExplanation = drawBiasInfo.explanation;

  // Then calculate stats based on the horses and race data
  const raceStats = calculateRaceStats({
    raceData: baseRaceData,
    horses: horses.filter((h) => h.stats), // Only include horses with stats
  });

  const result1: Race = {
    ...baseRaceData,
    horses: baseRaceData.horses || [],
    time: baseRaceData.time || "",
    title: baseRaceData.title || "",
    distance: baseRaceData.distance || 0,
    class: baseRaceData.class || 0,
    ageRestriction: baseRaceData.ageRestriction || "",
    tv: baseRaceData.tv || "",
    url: baseRaceData.url || "",
    runners: baseRaceData.runners || 0,
    raceTypeCode: raceTypeCode || "",
    raceType: getRaceType(raceTypeCode) || "",
    raceStats,

    predictions: baseRaceData.id
      ? await fetchPredictions(baseRaceData.id)
      : undefined,
    raceExtraInfo: baseRaceData.id
      ? await fetchRaceAccordion(baseRaceData.id)
      : undefined,
  };

  const result2: Race = {
    ...result1,
    horses: horses?.map((x) => ({
      ...x,
      score: calculateHorseScore3({
        horse: x,
        race: result1,
        raceStats,
        meetingDetails,
      }),
    })),
  };

  // After calculating all horse stats and scores
  const result3: Race = {
    ...result2,
    raceComment: generateRaceComment(
      result2.horses.sort(
        (a, b) =>
          (b.score?.total?.percentage || 0) - (a.score?.total?.percentage || 0)
      )[0],
      result2,
      raceStats,
      meetingDetails
    ),
  };

  console.log("🏁 Completed parseRaceDetails", result3);
  return result3;
}
