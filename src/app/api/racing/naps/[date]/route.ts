import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { NapsTableTip, NapsTableTips } from "@/types/racing";
import * as cheerio from "cheerio";

const CACHE_DIR = path.join(process.cwd(), "cache", "napsTable");

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function fetchAndParseTips(): Promise<NapsTableTip[]> {
  const response = await fetch(
    "https://alexdawson.co.uk/getP.php?q=https://www.horseracing.net/naps-table"
  );
  const html = await response.text();
  //console.log("Naps Table HTML:", html);
  const $ = cheerio.load(html);

  const tips: NapsTableTip[] = [];

  $(".table-naps-row").each((_, element) => {
    const time = $(element).attr("data-time")?.trim() || "";
    const horse = $(element)
      .find(".cell-row-silk-tips .tip-inner-wrapper .cell-title")
      .text()
      .trim();
    const score = $(element).find(".cell-row-pwl .percentage").text().trim();
    const tipster = $(element)
      .find(".cell-row-pos-tipser .tip-inner-wrapper .cell-title")
      .text()
      .trim();

    if (time && horse && tipster) {
      tips.push({ time, horse, tipster, score });
    }
  });

  return tips;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  const date = await Promise.resolve(params.date);
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

    const napsTableTips: NapsTableTips = {
      date,
      tips,
    };

    // Save to cache
    await ensureDirectoryExists(CACHE_DIR);
    await fs.writeFile(cacheFile, JSON.stringify(napsTableTips, null, 2));

    return NextResponse.json(napsTableTips);
  }
}
