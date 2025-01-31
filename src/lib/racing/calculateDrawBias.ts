export type TrackConfiguration = "left-handed" | "right-handed" | "straight";

interface DrawBiasResult {
  bias: string;
  explanation: string;
}

export function calculateDrawBias(
  trackConfig: TrackConfiguration | undefined,
  distance: string,
  going: string | undefined
): DrawBiasResult {
  // Default response if we can't determine
  const defaultResult = {
    bias: "No significant bias",
    explanation: "Insufficient data to determine draw bias",
  };

  if (!trackConfig || !distance) return defaultResult;

  // Extract distance in furlongs
  const furlongs = parseDistance(distance);

  // Sprint races (5-7f)
  if (furlongs <= 7) {
    if (trackConfig === "straight") {
      // Check going for straight track sprints
      if (
        going?.toLowerCase().includes("soft") ||
        going?.toLowerCase().includes("heavy")
      ) {
        return {
          bias: "Stand side favored",
          explanation:
            "Soft/heavy going typically favors higher draws on straight tracks",
        };
      }
      return {
        bias: "Track dependent",
        explanation: "Draw bias varies by track and conditions",
      };
    }
  }

  // Middle distance races (8-12f)
  if (furlongs > 7 && furlongs <= 12) {
    if (trackConfig === "left-handed") {
      return {
        bias: "Low draws favored",
        explanation: "Inside position advantageous around left-handed bends",
      };
    }
    if (trackConfig === "right-handed") {
      return {
        bias: "Low to middle draws favored",
        explanation:
          "Inside to middle position preferred around right-handed bends",
      };
    }
  }

  // Long distance races (>12f)
  if (furlongs > 12) {
    return {
      bias: "Draw less significant",
      explanation: "Longer distance reduces impact of draw position",
    };
  }

  return defaultResult;
}

function parseDistance(distance: string): number {
  const miles = distance.match(/(\d+)m/);
  const furlongs = distance.match(/(\d+)f/);

  let totalFurlongs = 0;
  if (miles) totalFurlongs += parseInt(miles[1]) * 8;
  if (furlongs) totalFurlongs += parseInt(furlongs[1]);

  return totalFurlongs;
}
