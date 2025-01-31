export interface RaceAccordionStats {
  trainerStats: Array<{
    trainer: string;
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
    jockey: string;
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

    // Find selection (horse in ALL CAPS)
    const selectionMatch = verdictText.match(
      /\b[A-Z][A-Z\s]+[A-Z]\b(?:\s*\(nap\))?/
    );
    const selection = selectionMatch ? cleanName(selectionMatch[0]) : "";

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
      const horseName = item
        .querySelector(".RC-spotlightComments__itemTitle")
        ?.textContent?.trim();
      const comment = item
        .querySelector(".RC-spotlightComments__itemSpotlight")
        ?.textContent?.trim();
      if (horseName && comment) {
        comments[horseName] = comment;
      }
    });

    // Parse trainer stats
    const trainerStats = Array.from(
      doc.querySelectorAll(".RC-stats__table:nth-of-type(1) tbody tr")
    ).map((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      const [runs14, wins14, winRate14, profit14] = cells[1]
        .textContent!.split("-")
        .map((x) => parseFloat(x.trim()));
      const [runsAll, winsAll, winRateAll, profitAll] = cells[4]
        .textContent!.split("-")
        .map((x) => parseFloat(x.trim()));

      return {
        trainer: cells[0].textContent?.trim() || "",
        last14Days: {
          runs: runs14,
          wins: wins14,
          winRate: winRate14,
          profit: profit14,
        },
        overall: {
          runs: runsAll,
          wins: winsAll,
          winRate: winRateAll,
          profit: profitAll,
        },
      };
    });

    // Parse jockey stats
    const jockeyStats = Array.from(
      doc.querySelectorAll(".RC-stats__table:nth-of-type(2) tbody tr")
    ).map((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      const [runs14, wins14, winRate14, profit14] = cells[1]
        .textContent!.split("-")
        .map((x) => parseFloat(x.trim()));
      const [runsAll, winsAll, winRateAll, profitAll] = cells[4]
        .textContent!.split("-")
        .map((x) => parseFloat(x.trim()));

      return {
        jockey: cells[0].textContent?.trim() || "",
        last14Days: {
          runs: runs14,
          wins: wins14,
          winRate: winRate14,
          profit: profit14,
        },
        overall: {
          runs: runsAll,
          wins: winsAll,
          winRate: winRateAll,
          profit: profitAll,
        },
      };
    });

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

function cleanName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s*\(nap\)\s*/i, "")
    .trim();
}
