import { horseNameToKey } from "@/lib/racing/scores/funcs";

export interface RaceAccordionStats {
  trainerStats: Array<{
    name: string;
    last14Days: {
      wins: number;
      runs: number;
      winRate: number;
      profit: number;
    };
    overall: {
      wins: number;
      runs: number;
      winRate: number;
      profit: number;
    };
  }>;
  jockeyStats: Array<{
    name: string;
    last14Days: {
      wins: number;
      runs: number;
      winRate: number;
      profit: number;
    };
    overall: {
      wins: number;
      runs: number;
      winRate: number;
      profit: number;
    };
  }>;
  horseStats: Array<{
    horse: string;
    going: {
      runs: number;
      winRate: number;
    };
    distance: {
      runs: number;
      winRate: number;
    };
    course: {
      runs: number;
      winRate: number;
    };
  }>;
  verdict: {
    comment: string;
    allNamed: string[];
    selection: string;
    isNap: boolean;
  };
  comments: Record<string, string>;
}

export async function fetchRaceAccordion(
  raceId: string
): Promise<RaceAccordionStats | undefined> {
  try {
    const response = await fetch(
      `/getP.php?q=${encodeURIComponent(
        `https://www.racingpost.com/racecards/data/accordion/${raceId}`
      )}`
    );

    if (!response.ok) {
      console.error(
        "Failed to fetch race accordion data:",
        response.statusText
      );
      return undefined;
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Parse verdict
    const verdictElement = doc.querySelector(".RC-raceVerdict__content");
    const verdictText = verdictElement?.textContent?.trim() || "";

    // Get all horses named in bold
    const allNamed = Array.from(verdictElement?.querySelectorAll("b") || [])
      .map((el) => el.textContent?.trim())
      .filter((name): name is string => !!name);

    // Find the all caps name from allNamed array, removing parenthetical content
    const selection = horseNameToKey(
      cleanName(
        allNamed.find((name) => {
          // Remove content inside parentheses
          const nameWithoutParens = name.replace(/\s*\([^)]*\)/g, "").trim();
          return (
            nameWithoutParens === nameWithoutParens.toUpperCase() &&
            nameWithoutParens.length > 1
          );
        }) || ""
      )
    );

    const isNap = verdictText.toLowerCase().includes("(nap)");

    const verdict = {
      comment: verdictText,
      allNamed,
      selection,
      isNap,
    };

    // Parse comments
    const comments: Record<string, string> = {};
    doc.querySelectorAll(".RC-spotlightComments__item").forEach((item) => {
      const horseName = horseNameToKey(
        item
          .querySelector(".RC-spotlightComments__itemTitle")
          ?.textContent?.trim() || ""
      );
      const comment = item

        .querySelector(".RC-spotlightComments__itemSpotlight")
        ?.textContent?.trim();
      if (horseName && comment) {
        comments[horseName] = comment;
      }
    });

    // Parse trainer stats
    function parseStats(row: Element) {
      // Get name from the link element
      const nameLink = row.querySelector(".RC-stats__link");
      const name = nameLink?.textContent?.trim() || "";

      // Parse last 14 days stats
      const lastWinsRuns =
        row
          .querySelector('[data-test-selector="RC-lastWinsRuns__row"]')
          ?.textContent?.trim() || "";
      const [lastWins, lastRuns] = lastWinsRuns
        .split("-")
        .map((n) => parseInt(n.trim()) || 0);
      const lastWinRate =
        parseFloat(
          row
            .querySelector('[data-test-selector="RC-lastPercent__row"]')
            ?.textContent?.trim() || "0"
        ) || 0;
      const lastProfit =
        parseFloat(
          row
            .querySelector('[data-test-selector="RC-lastProfit__row"]')
            ?.textContent?.trim() || "0"
        ) || 0;

      // Parse overall stats
      const overallWinsRuns =
        row
          .querySelector('[data-test-selector="RC-overallWinsRuns__row"]')
          ?.textContent?.trim() || "";
      const [overallWins, overallRuns] = overallWinsRuns
        .split("-")
        .map((n) => parseInt(n.trim()) || 0);
      const overallWinRate =
        parseFloat(
          row
            .querySelector('[data-test-selector="RC-overallPercent__row"]')
            ?.textContent?.trim() || "0"
        ) || 0;
      const overallProfit =
        parseFloat(
          row
            .querySelector('[data-test-selector="RC-overallProfit__row"]')
            ?.textContent?.trim() || "0"
        ) || 0;

      return {
        name,
        last14Days: {
          wins: lastWins,
          runs: lastRuns,
          winRate: lastWinRate,
          profit: lastProfit,
        },
        overall: {
          wins: overallWins,
          runs: overallRuns,
          winRate: overallWinRate,
          profit: overallProfit,
        },
      };
    }

    const trainerStats = Array.from(
      doc.querySelectorAll('[data-test-selector="RC-trainerName__row"]')
    )
      .map((el) => el.closest("tr"))
      .map((row) => parseStats(row as Element));

    const jockeyStats = Array.from(
      doc.querySelectorAll('[data-test-selector="RC-jockeyName__row"]')
    )
      .map((el) => el.closest("tr"))
      .map((row) => parseStats(row as Element));

    // Parse horse stats
    const horseStats = Array.from(
      doc.querySelectorAll(".RC-stats__table:nth-of-type(3) tbody tr")
    ).map((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      const [goingRuns, goingWinRate] = cells[1]
        .textContent!.split("-")
        .map((x) => parseFloat(x.trim()));
      const [distRuns, distWinRate] = cells[3]
        .textContent!.split("-")
        .map((x) => parseFloat(x.trim()));
      const [courseRuns, courseWinRate] = cells[5]
        .textContent!.split("-")
        .map((x) => parseFloat(x.trim()));

      return {
        horse: cells[0].textContent?.trim() || "",
        going: {
          runs: goingRuns,
          winRate: goingWinRate,
        },
        distance: {
          runs: distRuns,
          winRate: distWinRate,
        },
        course: {
          runs: courseRuns,
          winRate: courseWinRate,
        },
      };
    });

    return {
      verdict,
      comments,
      trainerStats,
      jockeyStats,
      horseStats,
    };
  } catch (error) {
    console.error("Error fetching race accordion data:", error);
    return undefined;
  }
}

export function cleanName(name: string) {
  return horseNameToKey(
    name
      ?.toLowerCase()
      .replace(/\s*\(nap\)\s*/i, "")
      .trim()
  );
}
