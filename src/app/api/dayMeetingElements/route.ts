import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "cache", "dayMeetingElements");

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    console.log("📁 Creating dayMeetingElements cache directory:", dir);
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  console.log("🔍 GET /api/dayMeetingElements requested for date:", date);

  if (!date) {
    console.log("❌ No date parameter provided to /api/dayMeetingElements GET");
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 },
    );
  }

  const cacheFile = path.join(CACHE_DIR, `${date}.json`);
  console.log("📁 Looking for dayMeetingElements cache file:", cacheFile);

  try {
    await fs.access(cacheFile);
    console.log("📦 Found dayMeetingElements cache file for:", date);
    const cachedData = await fs.readFile(cacheFile, "utf-8");
    console.log("✅ Successfully read dayMeetingElements cache data");
    return NextResponse.json(JSON.parse(cachedData));
  } catch {
    console.log("❌ No dayMeetingElements cache file found for:", date);
    return NextResponse.json(null);
  }
}

export async function POST(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  console.log("📝 POST /api/dayMeetingElements received for date:", date);

  if (!date) {
    console.log("❌ No date parameter provided to /api/dayMeetingElements");
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 },
    );
  }

  const dayMeetingElementsCache = await request.json();

  if (!dayMeetingElementsCache || typeof dayMeetingElementsCache !== "object") {
    console.log("❌ Invalid dayMeetingElements cache payload");
    return NextResponse.json(
      { error: "Invalid dayMeetingElements cache payload" },
      { status: 400 },
    );
  }

  await ensureDirectoryExists(CACHE_DIR);
  const cacheFile = path.join(CACHE_DIR, `${date}.json`);
  console.log("💾 Writing dayMeetingElements cache to:", cacheFile);

  await fs.writeFile(
    cacheFile,
    JSON.stringify(dayMeetingElementsCache, null, 2),
  );
  console.log("✅ dayMeetingElements cache file saved successfully for:", date);

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  console.log("🗑️ DELETE request received for date:", date);

  if (!date) {
    console.log("❌ No date parameter provided");
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 },
    );
  }

  const cacheFile = path.join(CACHE_DIR, `${date}.json`);
  console.log("🗂️ Attempting to delete cache file:", cacheFile);

  try {
    await fs.unlink(cacheFile);
    console.log("✅ Cache file deleted successfully for:", date);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    ) {
      console.log("ℹ️ Cache file not found for deletion:", date);
      return NextResponse.json(
        { success: false, error: "Cache file not found" },
        { status: 404 },
      );
    }

    console.error("❌ Failed to delete cache file:", error);
    return NextResponse.json(
      { error: "Failed to delete cache file" },
      { status: 500 },
    );
  }
}
