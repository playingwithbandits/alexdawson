import type { Race, Bet, Horse, Meeting } from "@/types/racing";
import { calculateHorseStats } from "@/lib/racing/calculateHorseStats";
import { calculateRaceStats } from "@/lib/racing/calculateRaceStats";
import { fetchHorseForm } from "@/lib/racing/fetchHorseForm";
import { fetchPredictions } from "./fetchPredictions";
import {
  calculateDrawBias,
  TrackConfiguration,
} from "@/lib/racing/calculateDrawBias";
import { getTrackConfiguration } from "@/lib/racing/getTrackConfiguration";
import { fetchRaceAccordion } from "./fetchRaceAccordion";
import { calculateHorseScore2 } from "@/lib/racing/calculateHorseScore2";

export async function parseRaceDetails(
  html: string,
  raceUrl: string,
  meetingDetails: Partial<Meeting>
): Promise<Partial<Race>> {
  console.log("🔄 Starting parseRaceDetails...");
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const headerBox = doc.querySelector(".RC-headerBox");

  console.log("📊 Parsing betting forecast...", html);
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

  console.log("🐎 Parsing horses...");
  // Parse horses from runner rows
  const rowsElements = doc.querySelectorAll(
    ".RC-runnerRow:not(.RC-runnerRow_disabled)"
  );
  const rows = Array.from(rowsElements);
  console.log(`Found ${rows.length} horses to parse`);

  const horses: Horse[] = await Promise.all(
    rows.map(async (row) => {
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
    .querySelector(
      `[data-test-selector="RC-headerBox__winner"] > .RC-headerBox__infoRow__content`
    )
    ?.textContent?.match(/£([\d,]+)/);
  const prizeMoney = prizeMatch ? parseInt(prizeMatch[1].replace(/,/g, "")) : 0;

  const courseName =
    doc
      .querySelector(`[data-test-selector="RC-courseHeader__name"]`)
      ?.textContent?.toLowerCase()
      .trim() || "";
  // First calculate base race data
  const baseRaceData: Partial<Race> = {
    time:
      doc
        .querySelector(".RC-courseHeader__time")
        ?.textContent?.replace(/\s+/g, " ")
        .trim() || "",
    id: raceUrl.split("/").pop() || "",
    title:
      doc
        .querySelector(`[data-test-selector="RC-header__raceInstanceTitle"]`)
        ?.textContent?.replace(/\s+/g, " ")
        .trim() || "",
    runners: horses.length,
    distance:
      doc
        .querySelector(`[data-test-selector="RC-header__raceDistanceRound"]`)
        ?.textContent?.replace(/\s+/g, " ")
        .trim() || "",
    class:
      doc
        .querySelector(`[data-test-selector="RC-header__raceClass"]`)
        ?.textContent?.replace(/[()]/g, "")
        .replace(/\s+/g, " ")
        .trim() || "",
    ageRestriction:
      doc
        .querySelector(`[data-test-selector="RC-header__rpAges"]`)
        ?.textContent?.replace(/\s+/g, " ")
        .trim() || "",
    tv: doc.querySelector(".RC-courseHeader__tv")?.textContent?.trim() || "",
    url: "", // This will be set by the caller
    going: headerBox
      ?.querySelector(
        "[data-test-selector='RC-headerBox__going'] > .RC-headerBox__infoRow__content"
      )
      ?.textContent?.replace(/Going:\s*/i, "")
      .replace(/\s+/g, " ")
      .trim(),
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
    baseRaceData.distance || "",
    baseRaceData.going
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
    distance: baseRaceData.distance || "",
    class: baseRaceData.class || "",
    ageRestriction: baseRaceData.ageRestriction || "",
    tv: baseRaceData.tv || "",
    url: baseRaceData.url || "",
    runners: baseRaceData.runners || 0,
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
      score: calculateHorseScore2(x, result1, raceStats, meetingDetails),
    })),
  };

  console.log("🏁 Completed parseRaceDetails", result2);
  return result2;
}
