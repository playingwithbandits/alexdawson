import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { GytoTip, GytoTips } from "@/types/racing";
import * as cheerio from "cheerio";

const CACHE_DIR = path.join(process.cwd(), "cache", "gyto");

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function fetchAndParseTips(): Promise<GytoTip[]> {
  const response = await fetch(
    "https://alexdawson.co.uk/getP.php?q=https://www.getyourtipsout.co.uk/free-horse-racing-tips/"
  );
  const html = await response.text();
  const $ = cheerio.load(html);

  const tips: GytoTip[] = [];

  $(".acca-selection").each((_, element) => {
    const time = $(element).find(".horse-racing-single-racetime").text().trim();
    const horse = $(element).find(".horse-racing-single-horse2").text().trim();
    const featureBetTips = $(element).find(".feature-bet-tips").text().trim();
    const isNap = ["nap", "next best"].includes(featureBetTips?.toLowerCase());

    console.log(
      `Found tip - Time: ${time}, Horse: ${horse}, Feature bet: ${featureBetTips}`
    );
    console.log(`Is NAP: ${isNap}`);

    if (time && horse) {
      tips.push({ time, horse, isNap });
    }
  });

  return tips;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  const date = params.date;
  const today = new Date().toISOString().split("T")[0];

  // Only return tips for today
  if (date !== today) {
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
    // Cache miss - fetch fresh data
    const tips = await fetchAndParseTips();

    const gytoTips: GytoTips = {
      date,
      tips,
    };

    // Save to cache
    await ensureDirectoryExists(CACHE_DIR);
    await fs.writeFile(cacheFile, JSON.stringify(gytoTips, null, 2));

    return NextResponse.json(gytoTips);
  }
}
