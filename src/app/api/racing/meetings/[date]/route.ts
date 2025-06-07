import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { date: string } }
) {
  try {
    console.log("🔍 GET request received for date:", params.date);
    const date = await Promise.resolve(params.date);
    console.log("📅 Processing date:", date);

    const filePath = join(process.cwd(), "cache", "racing", `${date}.json`);
    console.log("📁 Looking for cache file:", filePath);

    const fileContents = await readFile(filePath, "utf8");
    console.log("✅ Successfully read cache file");

    const parsedContents = JSON.parse(fileContents);
    console.log(`📊 Returning data with ${parsedContents.length} meetings`);

    return NextResponse.json(parsedContents);
  } catch (error) {
    console.error("❌ Error reading cache file:", error);
    return new Response("Not found", { status: 404 });
  }
}
