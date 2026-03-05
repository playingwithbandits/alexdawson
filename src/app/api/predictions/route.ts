import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "cache", "predictions");

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    console.log("📁 Creating predictions cache directory:", dir);
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  console.log("🔍 GET /api/predictions requested for date:", date);

  if (!date) {
    console.log("❌ No date parameter provided to /api/predictions GET");
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 },
    );
  }

  const cacheFile = path.join(CACHE_DIR, `${date}.json`);
  console.log("📁 Looking for predictions cache file:", cacheFile);

  try {
    await fs.access(cacheFile);
    console.log("📦 Found predictions cache file for:", date);
    const cachedData = await fs.readFile(cacheFile, "utf-8");
    console.log("✅ Successfully read predictions cache data");
    return NextResponse.json(JSON.parse(cachedData));
  } catch {
    console.log("❌ No predictions cache file found for:", date);
    return NextResponse.json(null);
  }
}

export async function POST(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  console.log("📝 POST /api/predictions received for date:", date);

  if (!date) {
    console.log("❌ No date parameter provided to /api/predictions");
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 },
    );
  }

  const predictionsCache = await request.json();

  if (!predictionsCache || typeof predictionsCache !== "object") {
    console.log("❌ Invalid predictions cache payload");
    return NextResponse.json(
      { error: "Invalid predictions cache payload" },
      { status: 400 },
    );
  }

  await ensureDirectoryExists(CACHE_DIR);
  const cacheFile = path.join(CACHE_DIR, `${date}.json`);
  console.log("💾 Writing predictions cache to:", cacheFile);

  await fs.writeFile(cacheFile, JSON.stringify(predictionsCache, null, 2));
  console.log("✅ Predictions cache file saved successfully for:", date);

  return NextResponse.json({ success: true });
}

