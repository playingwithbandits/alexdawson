import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Date parameter is required" },
      { status: 400 }
    );
  }

  try {
    // First check if we have cached data
    const cacheDir = path.join(process.cwd(), "cache", "nonrunners");
    const cacheFile = path.join(cacheDir, `${date}.json`);

    try {
      const cachedData = await fs.readFile(cacheFile, "utf-8");
      return NextResponse.json(JSON.parse(cachedData));
    } catch {
      // If no cached data exists, fetch from Racing Post
      const response = await fetch(
        `https://www.racingpost.com/non-runners/data/${date}.json`
      );
      const data = await response.json();

      // Create cache directory if it doesn't exist
      await fs.mkdir(cacheDir, { recursive: true });

      // Save to cache
      await fs.writeFile(cacheFile, JSON.stringify(data, null, 2));

      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("Error fetching non-runners data:", error);
    return NextResponse.json(
      { error: "Failed to fetch non-runners data" },
      { status: 500 }
    );
  }
}
