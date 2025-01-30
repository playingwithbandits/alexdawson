import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { parseMeetings } from "@/app/rp/utils/parseRaceDetails";

export async function POST(request: Request) {
  try {
    const { date } = await request.json();

    const response = await fetch(
      `https://www.racingpost.com/racecards/${date}`
    );
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const elements = doc.querySelectorAll(".RC-accordion");

    const meetings = await parseMeetings(Array.from(elements));

    const filePath = join(process.cwd(), "cache", "racing", `${date}.json`);
    await writeFile(filePath, JSON.stringify(meetings));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error fetching racing data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
