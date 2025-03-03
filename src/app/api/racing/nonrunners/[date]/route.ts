import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  const { date } = params;
  const cacheDir = path.join(process.cwd(), "cache", "nonrunners");
  const cacheFile = path.join(cacheDir, `${date}.json`);

  try {
    // Try to read from cache first
    const cachedData = await fs.readFile(cacheFile, "utf-8");
    return NextResponse.json(JSON.parse(cachedData));
  } catch {
    // If cache doesn't exist or other error, return null
    return NextResponse.json(null);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  const { date } = params;
  const cacheDir = path.join(process.cwd(), "cache", "nonrunners");
  const cacheFile = path.join(cacheDir, `${date}.json`);

  try {
    // Create cache directory if it doesn't exist
    await fs.mkdir(cacheDir, { recursive: true });

    // Fetch data from Racing Post
    const response = await fetch(
      `https://www.racingpost.com/non-runners/data/${date}.json`
    );
    const data = await response.json();

    // Save to cache
    await fs.writeFile(cacheFile, JSON.stringify(data, null, 2));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching/caching non-runners:", error);
    return NextResponse.json(
      { error: "Failed to fetch non-runners data" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  const { date } = params;
  const cacheDir = path.join(process.cwd(), "cache", "nonrunners");
  const cacheFile = path.join(cacheDir, `${date}.json`);

  try {
    await fs.unlink(cacheFile);
    return NextResponse.json({
      message: "Non-runners data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting non-runners data:", error);
    return NextResponse.json(
      { error: "Failed to delete non-runners data" },
      { status: 500 }
    );
  }
}
