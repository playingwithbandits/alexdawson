import fs from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("📅 GET request received for dates");
  const cacheDir = join(process.cwd(), "cache", "racing");
  console.log("📁 Cache directory:", cacheDir);

  try {
    console.log("🔍 Reading cache directory...");
    const files = fs.readdirSync(cacheDir);
    console.log(`📄 Found ${files.length} files`);

    const dates = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
      .sort();
    console.log(`✅ Extracted ${dates.length} dates`);

    return NextResponse.json(dates);
  } catch (error) {
    console.error("❌ Error reading cache directory:", error);
    return NextResponse.json([]);
  }
}
