import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { parseMeetings } from "@/app/rp/utils/parseMeetings";
import { placeToPlaceKey } from "@/lib/racing/scores/funcs";
import { UK_COURSES } from "@/app/horse/[date]/HorsePageClient";

export async function POST(request: Request) {
  try {
    const { date } = await request.json();

    const response = await fetch(
      `https://alexdawson.co.uk/getP.php?q=https://www.racingpost.com/racecards/${date}`
    );
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const elements = doc.querySelectorAll(".RC-accordion");
    // Filter for UK courses only
    //console.log(`Found ${elements.length} total courses`);
    const ukElements = Array.from(elements).filter((element) => {
      const courseName = placeToPlaceKey(
        element
          .querySelector(".RC-accordion__courseName")
          ?.textContent?.toLowerCase()
          .replace(/\s*\([^)]*\)\s*/g, "") // Remove anything in parentheses
          .trim() || ""
      );

      //console.log(`Processing course: ${courseName}`);
      const ukCourseKeys = UK_COURSES.map((course) => placeToPlaceKey(course));
      const isUkCourse = courseName && ukCourseKeys.includes(courseName);
      //console.log(`Is UK course: ${isUkCourse}`);
      return isUkCourse;
    });
    //console.log(`Filtered to ${ukElements.length} UK courses`);

    const meetings = await parseMeetings(ukElements);

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
