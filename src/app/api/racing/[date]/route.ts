import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const { date } = params;

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Construct path to the cache file
    const cachePath = path.join(
      process.cwd(),
      "cache",
      "racing",
      `${date}.json`
    );

    // Check if file exists
    try {
      await fs.access(cachePath);
    } catch {
      return NextResponse.json(
        { error: `No racing data found for ${date}` },
        { status: 404 }
      );
    }

    // Read and parse the JSON file
    const fileContent = await fs.readFile(cachePath, "utf-8");
    const racingData = JSON.parse(fileContent);

    // Return the racing data
    return NextResponse.json(racingData);
  } catch (error) {
    console.error("Error reading racing data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
