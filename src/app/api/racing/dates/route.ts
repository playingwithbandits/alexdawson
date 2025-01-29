import fs from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const cacheDir = join(process.cwd(), "cache", "racing");

  try {
    const files = fs.readdirSync(cacheDir);
    const dates = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
      .sort();

    return NextResponse.json(dates);
  } catch (error) {
    console.error("Error reading cache directory:", error);
    return NextResponse.json([]);
  }
}
