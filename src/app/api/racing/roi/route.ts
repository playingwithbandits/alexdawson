import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

interface RoiSource {
  roi: number;
  wins: number;
  total: number;
  totalReturns: number;
  totalBets: number;
}

interface RoiEntry {
  date: string;
  sources: {
    ai: RoiSource;
    predictions: RoiSource;
    atr: RoiSource;
    timeform: RoiSource;
    gyto: RoiSource;
    naps: RoiSource;
    aiLarge: RoiSource;
  };
}

interface RoiData {
  entries: RoiEntry[];
}

const ROI_FILE_PATH = join(process.cwd(), "cache", "data", "roi.json");

export async function POST(request: Request) {
  try {
    const newEntry: RoiEntry = await request.json();

    // Read existing data
    let roiData: RoiData;
    try {
      const fileContents = await readFile(ROI_FILE_PATH, "utf8");
      roiData = JSON.parse(fileContents);
    } catch {
      // If file doesn't exist or is invalid, start with empty data
      roiData = { entries: [] };
    }

    // Update or add new entry
    const existingIndex = roiData.entries.findIndex(
      (entry) => entry.date === newEntry.date
    );

    if (existingIndex >= 0) {
      roiData.entries[existingIndex] = newEntry;
    } else {
      roiData.entries.push(newEntry);
    }

    // Sort entries by date
    roiData.entries.sort((a, b) => a.date.localeCompare(b.date));

    // Save updated data
    await writeFile(ROI_FILE_PATH, JSON.stringify(roiData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving ROI:", error);
    return NextResponse.json(
      { error: "Failed to save ROI data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const fileContents = await readFile(ROI_FILE_PATH, "utf8");
    return NextResponse.json(JSON.parse(fileContents));
  } catch {
    // If file doesn't exist, return empty data
    return NextResponse.json({ entries: [] });
  }
}
