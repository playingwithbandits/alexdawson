import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { SharpTip, SharpData } from "@/types/racing";
import * as cheerio from "cheerio";
import { horseNameToKey } from "@/lib/racing/scores/funcs";

const CACHE_DIR = path.join(process.cwd(), "cache", "sharp");

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function fetchAndParseTips(): Promise<SharpTip[]> {
  console.log("Fetching sharp betting tips...");
  const response = await fetch(
    "https://alexdawson.co.uk/getP.php?q=https://sharpbetting.co.uk/quick-pick"
  );
  const html = await response.text();
  //console.log("Received HTML response", html);
  const $ = cheerio.load(html);

  // Find the script tag containing jsonData
  const scriptTags = $("script").get();
  //console.log(`Found ${scriptTags.length} script tags`);
  const targetScript = scriptTags.find((script) =>
    $(script).html()?.includes("const jsonData =")
  );

  if (!targetScript) {
    //console.log("No script tag found containing jsonData");
    return [];
  }

  const scriptText = $(targetScript).html() || "";
  //console.log("Found script tag with jsonData");

  // Extract the data between "const jsonData =" and the next semicolon
  const startIndex =
    scriptText.indexOf("const jsonData =") + "const jsonData =".length;
  const endIndex = scriptText.indexOf(";", startIndex);

  if (startIndex === -1 || endIndex === -1) {
    //console.log("Could not find data boundaries in script");
    return [];
  }

  try {
    // Parse the extracted JSON string
    const pyString = scriptText.substring(startIndex, endIndex).trim();

    const jsonString = pyString
      .replace(/'/g, (match, offset, str) => {
        // 1) opening of a single‐letter quote:   'N'
        if (str[offset + 2] === "'" && /[A-Za-z]/.test(str[offset + 1]!)) {
          return "'";
        }
        // 2) closing of a single‐letter quote:   'N'
        if (
          offset >= 2 &&
          str[offset - 2] === "'" &&
          /[A-Za-z]/.test(str[offset - 1]!)
        ) {
          return "'";
        }
        // 3) internal apostrophe in a word:  O'Meara, don't
        const prev = str[offset - 1] || "";
        const next = str[offset + 1] || "";
        if (/[A-Za-z]/.test(prev) && /[A-Za-z]/.test(next)) {
          return "'";
        }
        // 4) all other cases → replace
        return `"`;
      })
      .trim(); // Remove leading/trailing whitespace

    // Parse the resulting JSON string
    console.log("jsonString", jsonString);

    const jsonData = JSON.parse(jsonString);
    console.log("Successfully parsed JSON data", jsonData);

    // Convert jsonData entries to SharpTip objects
    const tips: SharpTip[] = Object.entries(jsonData).map(([key, value]) => {
      const valueArr = value as (string | number)[];
      const [
        track,

        sharpRating,
        oddsRating,

        earlySpeed,
        ability,
        jockey,
        trainer,
        going,
        course,
        pedigree,
        owner,
        somethingElse,

        topSharp200InRace,
        raceFavourite,
        wonLastRace,
        leadEarlyLastRace,
        wonCourse,
        wonDistance,
        wonClass,
        wonGoing,

        jockeyName,
        trainerName,
        horseName,
      ] = valueArr;

      return {
        horseName: horseNameToKey(horseName as string),
        track: track as string,
        earlySpeed: Number(earlySpeed),
        ability: Number(ability),
        jockey: Number(jockey),
        trainer: Number(trainer),
        going: Number(going),
        course: Number(course),
        pedigree: Number(pedigree),
        owner: Number(owner),
        sharpRating: Number(sharpRating),
        oddsRating: Number(oddsRating),
        topSharp200InRace: Boolean(topSharp200InRace),
        raceFavourite: Boolean(raceFavourite),
        wonLastRace: Boolean(wonLastRace),
        leadEarlyLastRace: Boolean(leadEarlyLastRace),
        wonCourse: Boolean(wonCourse),
        wonDistance: Boolean(wonDistance),
        wonClass: Boolean(wonClass),
        wonGoing: Boolean(wonGoing),
        jockeyName: jockeyName as string,
        trainerName: trainerName as string,
      };
    });

    console.log(`Successfully parsed ${tips.length} tips`, tips);
    return tips;
  } catch (e) {
    console.error("Error parsing JSON data:", e);
  }

  const tips: SharpTip[] = [];

  console.log("Returning empty tips array due to error");
  return tips;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  const date = await Promise.resolve(params.date);
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const cutoffTime = new Date();
  cutoffTime.setHours(10, 30, 0, 0);

  // Check if requested date is in the future
  if (date > today) {
    return NextResponse.json({
      date,
      tips: [],
    });
  }

  // Check if it's today but before 10:30am
  if (date === today && now < cutoffTime) {
    return NextResponse.json({
      date,
      tips: [],
    });
  }

  const cacheFile = path.join(CACHE_DIR, `${date}.json`);

  try {
    // Try to read from cache first
    const cachedData = await fs.readFile(cacheFile, "utf-8");
    return NextResponse.json(JSON.parse(cachedData));
  } catch {
    // Only fetch fresh data if it's today
    if (date === today) {
      const tips = await fetchAndParseTips();

      const rtWebTips: SharpData = {
        date,
        tips,
      };

      // Save to cache
      await ensureDirectoryExists(CACHE_DIR);
      await fs.writeFile(cacheFile, JSON.stringify(rtWebTips, null, 2));

      return NextResponse.json(rtWebTips);
    }

    // For past dates with no cache, return empty tips
    return NextResponse.json({
      date,
      tips: [],
    });
  }
}
