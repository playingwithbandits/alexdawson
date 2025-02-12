import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import * as cheerio from "cheerio";

const RESULTS_CACHE_DIR = path.join(process.cwd(), "cache", "results");

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    //console.log(`Creating directory: ${dir}`);
    await fs.mkdir(dir, { recursive: true });
  }
}

function canFetchResults(date: string, earliestTime?: string): boolean {
  //console.log(
  //   `Checking if results can be fetched for date: ${date}, earliest race: ${earliestTime}`
  // );

  const today = new Date();
  const requestDate = new Date(date);

  // If date is tomorrow or later, return false
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  if (requestDate >= tomorrow) {
    //console.log("Date is tomorrow or later - cannot fetch results");
    return false;
  }

  if (
    requestDate.toISOString().split("T")[0] ===
    today.toISOString().split("T")[0]
  ) {
    //console.log(
    //   `Today's date - using default 22:00 cutoff (current hour: ${today.getHours()})`
    // );
    return today.getHours() >= 14;
  }

  //console.log("Date is in the past - can fetch results");
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const date = await Promise.resolve(
      request.nextUrl.searchParams.get("date")
    );
    const earliestTime = request.nextUrl.searchParams.get("earliestTime");

    if (!date) {
      //console.log("No date provided in request");
      return NextResponse.json({ error: "Date required" }, { status: 400 });
    }

    //console.log(`Attempting to fetch results for date: ${date}`);

    if (!canFetchResults(date, earliestTime ?? undefined)) {
      //console.log("Results cannot be fetched yet");
      return NextResponse.json(
        { error: "Results not yet available" },
        { status: 400 }
      );
    }

    //console.log("Fetching results from Racing Post...");
    const response = await fetch(
      `https://alexdawson.co.uk/getP.php?q=https://www.racingpost.com/results/${date}`
    );
    const html = await response.text();

    //console.log("Parsing HTML response...");
    const $ = cheerio.load(html);

    // Extract the results container HTML
    const resultsContainer = $(
      '[data-test-selector="results-items-container"]'
    );
    const resultsHtml = resultsContainer.length
      ? resultsContainer.toString()
      : "";

    // Save to cache file
    //console.log("Ensuring cache directory exists...");
    await ensureDirectoryExists(RESULTS_CACHE_DIR);
    const cacheFile = path.join(RESULTS_CACHE_DIR, `${date}.txt`);
    //console.log(`Writing results to cache file: ${cacheFile}`);
    await fs.writeFile(cacheFile, resultsHtml);

    //console.log("Successfully fetched and cached results");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
