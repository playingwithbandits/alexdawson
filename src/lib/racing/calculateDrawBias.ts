export type DrawBiasType = "Low" | "Middle" | "High" | "No Clear Bias";

export interface DrawBiasResult {
  bias: DrawBiasType;
  explanation: string;
}

export type TrackConfiguration = "left-handed" | "right-handed" | "straight";

export function calculateDrawBias(
  trackConfig: TrackConfiguration | undefined,
  distance: number,
  going: string | undefined,
  course?: string
): DrawBiasResult {
  // Track-specific biases
  const trackBiases: Record<string, DrawBiasResult> = {
    chester: {
      bias: "Low",
      explanation: "Strong low draw bias due to tight left-handed track",
    },
    ayr: {
      bias: "High",
      explanation: "High draws favored in sprints, especially on soft ground",
    },
    beverley: {
      bias: "High",
      explanation:
        "High numbers favored on straight course, especially in sprints",
    },
    catterick: {
      bias: "Low",
      explanation: "Low draws advantaged due to sharp left-handed bends",
    },
    goodwood: {
      bias: "Low",
      explanation:
        "Low draws advantaged due to camber, especially in large fields",
    },
    haydock: {
      bias: "High",
      explanation:
        "High draws preferred in sprints on straight course, especially in soft",
    },
    kempton: {
      bias: "Low",
      explanation: "Low draws favored on polytrack, particularly in sprints",
    },
    lingfield: {
      bias: "Low",
      explanation: "Low draws advantaged around tight polytrack bends",
    },
    newmarket: {
      bias: "Middle",
      explanation: "Middle to high draws often favored on straight Rowley Mile",
    },
    pontefract: {
      bias: "Low",
      explanation: "Low draws advantaged due to uphill finish and tight turns",
    },
    thirsk: {
      bias: "High",
      explanation: "High draws favored in sprints on straight course",
    },
    wolverhampton: {
      bias: "Low",
      explanation: "Low draws advantaged around tight left-handed polytrack",
    },
    york: {
      bias: "High",
      explanation:
        "High numbers often advantaged on straight course in big fields",
    },
    ascot: {
      bias: "Low",
      explanation: "Low draws favored on round course, less bias on straight",
    },
  };

  // Check for track-specific bias first
  if (course && trackBiases[course.toLowerCase()]) {
    return trackBiases[course.toLowerCase()];
  }

  if (course) {
    console.log(`No track-specific bias found for course: ${course}`);
  }

  // Default response if we can't determine
  if (!trackConfig || !distance) {
    console.log({
      message: "ERROR: Unable to determine draw bias",
      trackConfig,
      distance,
      going,
      course,
    });
    return {
      bias: "No Clear Bias" as DrawBiasType,
      explanation: "Insufficient data to determine draw bias",
    };
  }

  // Extract distance in furlongs
  const furlongs = distance;

  // Sprint races (5-7f)
  if (furlongs <= 7) {
    if (trackConfig === "straight") {
      // Check going for straight track sprints
      if (
        going?.toLowerCase().includes("soft") ||
        going?.toLowerCase().includes("heavy")
      ) {
        return {
          bias: "High" as DrawBiasType,
          explanation:
            "Soft/heavy going typically favors higher draws on straight tracks",
        };
      }
      return {
        bias: "No Clear Bias" as DrawBiasType,
        explanation: "Draw bias varies by track and conditions",
      };
    }
  }

  // Middle distance races (8-12f)
  if (furlongs > 7 && furlongs <= 12) {
    if (trackConfig === "left-handed") {
      return {
        bias: "Low" as DrawBiasType,
        explanation: "Inside position advantageous around left-handed bends",
      };
    }
    if (trackConfig === "right-handed") {
      return {
        bias: "Middle" as DrawBiasType,
        explanation:
          "Inside to middle position preferred around right-handed bends",
      };
    }
  }

  // Long distance races (>12f)
  console.log(
    `ERROR: No specific draw bias found - trackConfig: ${trackConfig}, distance: ${distance}, going: ${going}, course: ${course}`
  );

  return {
    bias: "No Clear Bias" as DrawBiasType,
    explanation: "Longer distance reduces impact of draw position",
  };
}
