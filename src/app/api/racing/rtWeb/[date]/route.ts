import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { RtWebTip, RtWebData } from "@/types/racing";
import * as cheerio from "cheerio";

const CACHE_DIR = path.join(process.cwd(), "cache", "rtWeb");

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function fetchAndParseTips(): Promise<RtWebTip[]> {
  const response = await fetch(
    "https://alexdawson.co.uk/getP.php?q=https://racingoracle.com/tips.php"
  );
  const html = await response.text();
  console.log("fetchAndParseTips", html);
  const $ = cheerio.load(html);

  const tips: RtWebTip[] = [];

  $("tip").each((_, element) => {
    const el = $(element);
    console.log("fetchAndParseTips el", el);
    // Parse tip content
    const tipText = el.text().trim();
    console.log("fetchAndParseTips tipText", tipText);
    const match = tipText?.match(/^(\d{2}:\d{2})\s+(.*?)\s*\((\d+\.\d+)\)$/);
    console.log("fetchAndParseTips match", match);

    if (match) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, time, horseName, rating] = match;
      console.log("fetchAndParseTips horseName", horseName);
      console.log("fetchAndParseTips time", time);
      console.log("fetchAndParseTips rating", rating);

      tips.push({
        horseName,
        time,
        rating: parseFloat(rating) || 0,
      });
    }
  });
  console.log("fetchAndParseTips tips", tips);
  return tips;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  const date = await Promise.resolve(params.date);
  const today = new Date().toISOString().split("T")[0];

  // Check if requested date is in the future
  if (date > today) {
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

      const rtWebTips: RtWebData = {
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
