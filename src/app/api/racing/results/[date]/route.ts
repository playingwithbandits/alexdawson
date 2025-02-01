import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";
import { RaceResults } from "@/types/racing";
import { JSDOM } from "jsdom";

export async function GET(
  request: Request,
  { params }: { params: { date: string } }
) {
  try {
    console.log("Getting results for date:", params.date);

    const filePath = join(
      process.cwd(),
      "cache",
      "results",
      `${params.date}.txt`
    );

    try {
      console.log("Reading file from:", filePath);
      const fileContents = await readFile(filePath, "utf8");
      console.log("Successfully read file contents");

      // Parse the HTML content using jsdom
      const dom = new JSDOM(fileContents);
      const doc = dom.window.document;

      const results: RaceResults = {
        date: params.date,
        results: [],
      };

      // First get all courses
      const courseContainers = doc.querySelectorAll(
        '[data-test-selector="course-container"]'
      );
      console.log(`Found ${courseContainers.length} courses to parse`);

      courseContainers.forEach((courseContainer) => {
        // Get course name for all races in this container
        const courseName =
          courseContainer
            .querySelector(`[data-test-selector="course-name"]`)
            ?.textContent?.trim() || "";
        console.log(`Processing course: ${courseName}`);

        // Get all races for this course
        const raceContainers = courseContainer.querySelectorAll(
          '[data-test-selector="raceCourse-container"] > .rp-raceCourse__panel__race'
        );
        console.log(`Found ${raceContainers.length} races at ${courseName}`);

        raceContainers.forEach((race) => {
          // Get race data from attributes
          const raceId = race.getAttribute("data-diffusion-race-id") || "";
          const diffusionCourseName =
            race.getAttribute("data-diffusion-coursename") || "";
          const diffusionTime = race.getAttribute("data-diffusion-racetime");

          console.log(
            `Processing race ID ${raceId} at ${diffusionCourseName} ${diffusionTime}`
          );

          const time =
            diffusionTime ||
            race
              .querySelector('[data-test-selector="text-raceTime"]')
              ?.textContent?.trim() ||
            "";

          const course = diffusionCourseName || courseName || "";

          const distance =
            race
              .querySelector(".rp-raceCourse__panel__race__info__distance")
              ?.textContent?.trim() || "";

          console.log(`Processing race at ${courseName} ${time}`);

          // Get all horses and their outcomes
          const horsesList = race.querySelector(
            '[data-test-selector="link-listOfHorses"]'
          );
          const horses = Array.from(
            horsesList?.querySelectorAll(
              ".rp-raceCourse__panel__race__info__results__name"
            ) || []
          ).map((horse) => {
            const position = horse.getAttribute("data-outcome-desc") || "";
            const nameElement = horse.querySelector(
              ".rp-raceCourse__panel__race__info__results__name__table__row"
            );
            const name =
              nameElement?.textContent
                ?.trim()
                .replace(/^\d+\.?\s*/, "") // Remove leading numbers and periods
                .trim() || "";
            return { position, name };
          });

          // First horse is the winner
          const winner = horses[0] || { name: "", position: "" };

          // Get winner connections
          const winningTrainer =
            race
              .querySelector("[data-test-selector='text-winningTrainer'] a")
              ?.textContent?.trim() || "";
          const winningJockey =
            race
              .querySelector("[data-test-selector='text-winningJockey'] a")
              ?.textContent?.trim() || "";

          // Get additional race info
          const runnersText =
            race
              .querySelector(
                ".rp-raceCourse__panel__race__info__postRaceInfo__main_dark"
              )
              ?.textContent?.trim() || "";
          const runnersTotal = parseInt(runnersText.match(/(\d+)/)?.[1] || "0");

          // Get distances and times
          const distancesElement = race.querySelector(
            ".rp-raceCourse__panel__race__info__postRaceInfo__more .description dd"
          );
          const winningDistance = distancesElement?.textContent?.trim() || "";

          const winningTime =
            race
              .querySelector("[data-test-selector='text-winningTime4']")
              ?.textContent?.trim() || "";

          const prizeMoney =
            race
              .querySelector(".rp-raceCourse__panel__race__info__title__prize")
              ?.textContent?.trim() || "";

          results.results.push({
            time,
            course,
            raceId,
            distance,
            prizeMoney,
            winner: {
              name: winner.name,
              trainer: winningTrainer,
              jockey: winningJockey,
            },
            placedHorses: horses.slice(1),
            runnersTotal,
            winningDistance,
            winningTime,
          });
        });
      });

      console.log(`Successfully parsed ${results.results.length} races`);
      return NextResponse.json(results);
    } catch (error) {
      // If file doesn't exist, create an empty one
      console.log("No results file found, creating empty file");
      await writeFile(filePath, "");

      // Return empty results structure
      return NextResponse.json({
        date: params.date,
        results: [],
      });
    }
  } catch (error) {
    console.error("Error processing results:", error);
    // Return null if there's any other error
    return NextResponse.json(null);
  }
}
