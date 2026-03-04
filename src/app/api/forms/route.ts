import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "cache", "forms");

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    console.log("📁 Creating form cache directory:", dir);
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  console.log("🔍 GET /api/forms requested for date:", date);

  if (!date) {
    console.log("❌ No date parameter provided to /api/forms GET");
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 },
    );
  }

  const cacheFile = path.join(CACHE_DIR, `${date}.json`);
  console.log("📁 Looking for form cache file:", cacheFile);

  try {
    await fs.access(cacheFile);
    console.log("📦 Found form cache file for:", date);
    const cachedData = await fs.readFile(cacheFile, "utf-8");
    console.log("✅ Successfully read form cache data");
    return NextResponse.json(JSON.parse(cachedData));
  } catch {
    console.log("❌ No form cache file found for:", date);
    return NextResponse.json(null);
  }
}

export async function POST(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  console.log("📝 POST /api/forms received for date:", date);

  if (!date) {
    console.log("❌ No date parameter provided to /api/forms");
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 },
    );
  }

  const formCache = await request.json();

  if (!formCache || typeof formCache !== "object") {
    console.log("❌ Invalid form cache payload");
    return NextResponse.json(
      { error: "Invalid form cache payload" },
      { status: 400 },
    );
  }

  await ensureDirectoryExists(CACHE_DIR);
  const cacheFile = path.join(CACHE_DIR, `${date}.json`);
  console.log("💾 Writing form cache to:", cacheFile);

  await fs.writeFile(cacheFile, JSON.stringify(formCache, null, 2));
  console.log("✅ Form cache file saved successfully for:", date);

  return NextResponse.json({ success: true });
}

