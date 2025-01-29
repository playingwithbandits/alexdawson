import { Meeting } from "@/app/rp/utils/parseMeetings";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "cache", "racing");

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 }
    );
  }

  const cacheFile = path.join(CACHE_DIR, `${date}.json`);

  try {
    // Try to read from cache first
    await fs.access(cacheFile);
    console.log("📦 Found cached file for:", date);
    const cachedData = await fs.readFile(cacheFile, "utf-8");
    return NextResponse.json(JSON.parse(cachedData));
  } catch {
    // Cache miss - return null to indicate need for fresh data
    console.log("❌ No cache file found for:", date);
    return NextResponse.json(null);
  }
}

export async function POST(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 }
    );
  }

  const meetings: Meeting[] = await request.json();

  await ensureDirectoryExists(CACHE_DIR);
  const cacheFile = path.join(CACHE_DIR, `${date}.json`);

  await fs.writeFile(cacheFile, JSON.stringify(meetings, null, 2));
  console.log("💾 Cache file saved for:", date);

  return NextResponse.json({ success: true });
}
