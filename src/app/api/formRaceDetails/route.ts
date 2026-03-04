import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "cache", "formRaceDetails");

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    console.log("📁 Creating form race details cache directory:", dir);
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  console.log("🔍 GET /api/formRaceDetails requested for date:", date);

  if (!date) {
    console.log("❌ No date parameter provided to /api/formRaceDetails GET");
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 },
    );
  }

  const cacheFile = path.join(CACHE_DIR, `${date}.json`);
  console.log("📁 Looking for form race details cache file:", cacheFile);

  try {
    await fs.access(cacheFile);
    console.log("📦 Found form race details cache file for:", date);
    const cachedData = await fs.readFile(cacheFile, "utf-8");
    console.log("✅ Successfully read form race details cache data");
    return NextResponse.json(JSON.parse(cachedData));
  } catch {
    console.log("❌ No form race details cache file found for:", date);
    return NextResponse.json(null);
  }
}

export async function POST(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  console.log("📝 POST /api/formRaceDetails received for date:", date);

  if (!date) {
    console.log("❌ No date parameter provided to /api/formRaceDetails");
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 },
    );
  }

  const formRaceDetailsCache = await request.json();

  if (!formRaceDetailsCache || typeof formRaceDetailsCache !== "object") {
    console.log("❌ Invalid form race details cache payload");
    return NextResponse.json(
      { error: "Invalid form race details cache payload" },
      { status: 400 },
    );
  }

  await ensureDirectoryExists(CACHE_DIR);
  const cacheFile = path.join(CACHE_DIR, `${date}.json`);
  console.log("💾 Writing form race details cache to:", cacheFile);

  await fs.writeFile(
    cacheFile,
    JSON.stringify(formRaceDetailsCache, null, 2),
  );
  console.log("✅ Form race details cache file saved successfully for:", date);

  return NextResponse.json({ success: true });
}

