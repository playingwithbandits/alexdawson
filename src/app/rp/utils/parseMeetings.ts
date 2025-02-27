import type { Race, Meeting } from "@/types/racing";
import { fetchRaceDetails } from "./fetchRaceDetails";
import { parseRaceDetails } from "./parseRaceDetails";
import { parseDistance, placeToPlaceKey } from "@/lib/racing/scores/funcs";

export async function parseMeetings(elements: Element[]): Promise<Meeting[]> {
  return Promise.all(
    elements.map(async (element) => {
      // Get meeting venue and going
      const venueElement = element.querySelector(".RC-accordion__courseName");
      const surfaceElement = element.querySelector(".RC-accordion__surface");
      const firstRaceElement = element.querySelector(
        '[data-test-selector="RC-accordion__firstRaceTime"]'
      );
      const lastRaceElement = element.querySelector(
        '[data-test-selector="RC-accordion__lastRaceTime"]'
      );
      const typeElement = element.querySelector(
        '[data-test-selector="RC-accordion__meetingType"]'
      );
      const raceCountElement = element.querySelector(
        '[data-test-selector="RC-accordion__raceCount"]'
      );
      const goingElement = element.querySelector(
        '[data-test-selector="RC-courseDescription__info"]'
      );

      // Get all races for this meeting
      const raceElements = element.querySelectorAll(
        '[data-test-selector="RC-courseCards__raceRow"]'
      );

      //console.log("Venue:", venueElement?.textContent);
      //console.log("Races found:", raceElements);

      const meetingDetails = {
        venue: placeToPlaceKey(venueElement?.textContent?.trim() || ""),
        surface: surfaceElement?.textContent?.trim() || "Turf",
        firstRace: firstRaceElement?.textContent?.trim() || "",
        lastRace:
          lastRaceElement?.textContent?.trim().replace(/[&nbsp;-]*/g, "") || "",
        type: typeElement?.textContent?.trim() || "",
        raceCount: raceCountElement?.textContent?.trim() || "",
        going:
          goingElement?.textContent?.trim().replace(/^GOING\s*/i, "") || "",
      };

      const races = await Promise.all(
        Array.from(raceElements).map(async (raceElement): Promise<Race> => {
          const linkElement = raceElement.querySelector(
            ".RC-meetingItem__link"
          ) as HTMLAnchorElement;
          const timeElement = raceElement.querySelector(
            '[data-test-selector="RC-courseCards__time"]'
          );
          const titleElement = raceElement.querySelector(
            '[data-test-selector="RC-courseCards__info"]'
          );
          const runnersElement = raceElement.querySelector(
            '[data-test-selector="RC-courseCards__runners"]'
          );
          const goingDataElement = raceElement.querySelector(
            '[data-test-selector="RC-courseCards__going"]'
          );
          const tvElement = raceElement.querySelector(
            '[data-test-selector="RC-meetingItem__tv"]'
          );

          // Parse going data text which contains class, age restriction and distance
          const goingData =
            goingDataElement?.textContent
              ?.trim()
              .split("\n")
              .map((s) => s.trim()) || [];
          const [classInfo, ageRestriction, distance] = goingData;

          // Extract the path from the full URL
          const raceUrl = linkElement?.href
            ? "https://alexdawson.co.uk/getP.php?q=https://www.racingpost.com" +
              new URL(linkElement.href).pathname
            : "";

          let details = "";
          let additionalDetails: Partial<Race> = { horses: [] };

          try {
            //console.log(`Processing race at ${raceUrl}`);
            details = await fetchRaceDetails(raceUrl);
            if (details) {
              //console.log("📝 Got race details, starting parse...");
              additionalDetails = await parseRaceDetails(
                details,
                raceUrl,
                meetingDetails
              );
            }
          } catch (error) {
            console.error(
              `Failed to fetch/parse details for race at ${raceUrl}:`,
              error
            );
          }

          return {
            time: timeElement?.textContent?.trim() || "",
            title: titleElement?.textContent?.trim() || "",
            runners: parseInt(
              runnersElement?.textContent?.trim().split(" ")[0] || "0",
              10
            ),
            distance: parseDistance(distance || ""),
            class: classInfo || ""?.replace("Class", "").trim(),
            ageRestriction: ageRestriction || "",
            tv: tvElement?.textContent?.trim() || "",
            url: raceUrl,
            horses: [],
            ...additionalDetails,
          };
        })
      );

      return {
        ...meetingDetails,
        races,
      };
    })
  );
}
