import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "cache", "raceExtraInfo");

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    console.log("📁 Creating raceExtraInfo cache directory:", dir);
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  console.log("🔍 GET /api/raceExtraInfo requested for date:", date);

  if (!date) {
    console.log("❌ No date parameter provided to /api/raceExtraInfo GET");
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 },
    );
  }

  const cacheFile = path.join(CACHE_DIR, `${date}.json`);
  console.log("📁 Looking for raceExtraInfo cache file:", cacheFile);

  try {
    await fs.access(cacheFile);
    console.log("📦 Found raceExtraInfo cache file for:", date);
    const cachedData = await fs.readFile(cacheFile, "utf-8");
    console.log("✅ Successfully read raceExtraInfo cache data");
    return NextResponse.json(JSON.parse(cachedData));
  } catch {
    console.log("❌ No raceExtraInfo cache file found for:", date);
    return NextResponse.json(null);
  }
}

export async function POST(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  console.log("📝 POST /api/raceExtraInfo received for date:", date);

  if (!date) {
    console.log("❌ No date parameter provided to /api/raceExtraInfo");
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 },
    );
  }

  const raceExtraInfoCache = await request.json();

  if (!raceExtraInfoCache || typeof raceExtraInfoCache !== "object") {
    console.log("❌ Invalid raceExtraInfo cache payload");
    return NextResponse.json(
      { error: "Invalid raceExtraInfo cache payload" },
      { status: 400 },
    );
  }

  await ensureDirectoryExists(CACHE_DIR);
  const cacheFile = path.join(CACHE_DIR, `${date}.json`);
  console.log("💾 Writing raceExtraInfo cache to:", cacheFile);

  await fs.writeFile(cacheFile, JSON.stringify(raceExtraInfoCache, null, 2));
  console.log("✅ raceExtraInfo cache file saved successfully for:", date);

  return NextResponse.json({ success: true });
}

