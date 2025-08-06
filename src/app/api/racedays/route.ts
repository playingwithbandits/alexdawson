import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Meeting } from "@/types/raceday";

const CACHE_DIR = path.join(process.cwd(), "cache", "racedays");

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    console.log("📁 Creating cache directory:", dir);
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  console.log("🔍 GET request received for date:", date);

  if (!date) {
    console.log("❌ No date parameter provided");
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 }
    );
  }

  const cacheFile = path.join(CACHE_DIR, `${date}.json`);
  console.log("📁 Looking for cache file:", cacheFile);

  try {
    // Try to read from cache first
    await fs.access(cacheFile);
    console.log("📦 Found cached file for:", date);
    const cachedData = await fs.readFile(cacheFile, "utf-8");
    console.log("✅ Successfully read cached data");
    return NextResponse.json(JSON.parse(cachedData));
  } catch {
    // Cache miss - return null to indicate need for fresh data
    console.log("❌ No cache file found for:", date);
    return NextResponse.json(null);
  }
}

export async function POST(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  console.log("📝 POST request received for date:", date);

  if (!date) {
    console.log("❌ No date parameter provided");
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 }
    );
  }

  const meetings: Meeting[] = await request.json();
  console.log(`📊 Received ${meetings.length} meetings to cache`);

  await ensureDirectoryExists(CACHE_DIR);
  const cacheFile = path.join(CACHE_DIR, `${date}.json`);
  console.log("💾 Writing to cache file:", cacheFile);

  await fs.writeFile(cacheFile, JSON.stringify(meetings, null, 2));
  console.log("✅ Cache file saved successfully for:", date);

  return NextResponse.json({ success: true });
}
