import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { parseMeetings } from "@/app/rp/utils/parseMeetings";
import { placeToPlaceKey } from "@/lib/racing/scores/funcs";
import { IRISH_COURSES, UK_COURSES } from "@/app/horse/[date]/HorsePageClient";

export async function POST(request: Request) {
  try {
    console.log("🏁 Starting POST request handler");
    const { date } = await request.json();
    console.log("📅 Processing date:", date);

    console.log("🌐 Fetching data from Racing Post");
    const response = await fetch(
      `https://alexdawson.co.uk/getP.php?q=https://www.racingpost.com/racecards/${date}`
    );
    const html = await response.text();
    console.log("✅ Successfully fetched HTML data");

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    console.log("✅ Successfully parsed HTML data", html);
    const elements = doc.querySelectorAll(".RC-accordion");
    console.log(`🔍 Found ${elements.length} total courses in HTML`, elements);

    // Filter for UK courses only
    console.log("🏇 Starting course filtering");
    const ukElements = Array.from(elements).filter((element) => {
      const courseName = placeToPlaceKey(
        element
          .querySelector(".RC-accordion__courseName")
          ?.textContent?.toLowerCase()
          .replace(/\s*\([^)]*\)\s*/g, "") // Remove anything in parentheses
          .trim() || ""
      );

      const ukCourseKeys = UK_COURSES.map((course) => placeToPlaceKey(course));
      const irishCourseKeys = IRISH_COURSES.map((course) =>
        placeToPlaceKey(course)
      );
      const isUkCourse = courseName && ukCourseKeys.includes(courseName);
      const isIrishCourse = courseName && irishCourseKeys.includes(courseName);

      console.log(
        `🏁 Course: ${courseName}, UK: ${isUkCourse}, Irish: ${isIrishCourse}`
      );
      return isUkCourse || isIrishCourse;
    });

    console.log(`✨ Filtered to ${ukElements.length} courses`, ukElements);

    console.log("📊 Parsing meetings data");
    const meetings = await parseMeetings(ukElements, date);
    console.log("✅ Successfully parsed meetings");

    const filePath = join(process.cwd(), "cache", "racing", `${date}.json`);
    console.log("💾 Saving to cache file:", filePath);
    await writeFile(filePath, JSON.stringify(meetings));
    console.log("✅ Successfully saved to cache");

    console.log("🎉 Request completed successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error fetching racing data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
