import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { DayTips, RaceTip, TipSelection } from "@/types/racing";
import * as cheerio from "cheerio";

const CACHE_DIR = path.join(process.cwd(), "cache", "atr");

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    console.log(`Creating directory: ${dir}`);
    await fs.mkdir(dir, { recursive: true });
  }
}

async function fetchTipsPage(date: string) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))
    .toISOString()
    .split("T")[0];

  let url = "https://www.attheraces.com/tips";

  if (date === tomorrow) {
    url += "/race-by-race-guides/tomorrow";
  } else if (date !== today) {
    return null;
  }

  console.log(`Fetching tips from: ${url}`);
  const response = await fetch(url);
  return await response.text();
}

async function parseTipsPage(html: string) {
  const $ = cheerio.load(html);

  const ukPanel = $(".flush-first--1 .panel")
    .filter((_, panel) =>
      $(panel).find(".panel-header h2").text().includes("UK Racing Tips")
    )
    .first();

  if (!ukPanel.length) {
    console.log("No UK Racing Tips panel found");
    return [];
  }

  const links = ukPanel
    .find(".a--plain")
    .map((_, el) => $(el).attr("href"))
    .get()
    .filter(Boolean);

  console.log(`Found ${links.length} course links`);
  return links;
}

async function parseCoursePage(html: string, selector: string) {
  const $ = cheerio.load(html);
  const races: RaceTip[] = [];

  const tab = $(selector);
  if (!tab.length) {
    console.log(`No tab found for selector: ${selector}`);
    return [];
  }

  tab.find(".post-text__t a").each((_, raceLink) => {
    const timeMatch = $(raceLink)
      .text()
      .match(/(\d+:\d+)/);
    if (!timeMatch) return;

    const time = timeMatch[1];
    const raceContainer = $(raceLink).closest("div.list > div");

    if (selector === "#tab-atr") {
      // Parse ATR tips
      const topTip = raceContainer
        .find('b:contains("Top Tip:")')
        .next("a")
        .text()
        .trim();
      const watchOutFor = raceContainer
        .find('b:contains("Watch out for:")')
        .next("a")
        .text()
        .trim();
      const verdict = raceContainer.find(".panel-content p").text().trim();

      races.push({
        time,
        selections: [
          {
            horse: topTip,
            rank: 1,
          },
          {
            horse: watchOutFor,
            rank: 2,
          },
        ],
        verdict,
      });
    } else {
      // Parse Timeform tips
      const selections = raceContainer
        .find(".ol--inline li a")
        .map((_, el) => ({
          horse: $(el).text().trim(),
          rank: _ + 1,
        }))
        .get();

      const verdict = raceContainer.find(".panel-content p").text().trim();

      races.push({
        time,
        selections,
        verdict,
      });
    }
  });

  console.log(`Parsed ${races.length} races from ${selector}`);
  return races;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  console.log(`Processing request for date: ${params.date}`);
  const date = params.date;
  const cacheFile = path.join(CACHE_DIR, `${date}.json`);

  try {
    // Try to read from cache first
    console.log(`Attempting to read from cache: ${cacheFile}`);
    const cachedData = await fs.readFile(cacheFile, "utf-8");
    console.log("Cache hit - returning cached data");
    return NextResponse.json(JSON.parse(cachedData));
  } catch {
    // Cache miss - fetch fresh data
    console.log("Cache miss - fetching fresh data");
    const html = await fetchTipsPage(date);
    if (!html) {
      console.log("No tips page found for date");
      return NextResponse.json(null);
    }

    const courseLinks = await parseTipsPage(html);
    const tips: DayTips = {
      date,
      atrTips: [],
      timeformTips: [],
    };

    for (const link of courseLinks) {
      console.log(`Fetching course page: ${link}`);
      const courseHtml = await fetch("https://www.attheraces.com" + link).then(
        (r) => r.text()
      );
      const parts = link.split("/");
      const course =
        parts[parts.length - 1].toLowerCase() === "tomorrow"
          ? parts[parts.length - 2]
          : parts[parts.length - 1];

      console.log(`Parsing tips for course: ${course}`);
      const atrRaces = await parseCoursePage(courseHtml, "#tab-atr");
      const timeformRaces = await parseCoursePage(courseHtml, "#tab-timeform");

      if (atrRaces.length) {
        console.log(`Found ${atrRaces.length} ATR races`);
        tips.atrTips.push({ course, races: atrRaces });
      }
      if (timeformRaces.length) {
        console.log(`Found ${timeformRaces.length} Timeform races`);
        tips.timeformTips.push({ course, races: timeformRaces });
      }
    }

    // Save to cache
    console.log("Saving results to cache");
    await ensureDirectoryExists(CACHE_DIR);
    await fs.writeFile(cacheFile, JSON.stringify(tips, null, 2));

    return NextResponse.json(tips);
  }
}
