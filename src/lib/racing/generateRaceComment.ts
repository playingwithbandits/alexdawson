import { Horse, Meeting, Race, RaceStats } from "@/types/racing";
import { GOING_REMAP } from "./goingUtils";
import { HorseScore } from "./scores/types";

export function generateRaceComment(
  topHorse: Horse,
  race: Race,
  raceStats: RaceStats,
  meetingDetails: Partial<Meeting>
): string {
  if (!topHorse?.score) return "";

  // Get second horse for comparison
  const runnerUp = race.horses
    .filter((h) => h.name !== topHorse.name && h.score?.total)
    .sort(
      (a, b) =>
        (b.score?.total?.percentage || 0) - (a.score?.total?.percentage || 0)
    )[0];

  // Calculate margin between horses
  const margin = runnerUp?.score?.total
    ? topHorse.score.total.percentage - runnerUp.score.total.percentage
    : 0;

  // Get confidence level based on margin
  const confidence =
    margin > 15 ? "strongly" : margin > 8 ? "confidently" : "marginally";

  // Analyze strengths and concerns
  const strengths = [];
  const concerns = [];
  const components = topHorse.score.components;

  // Check strengths
  if (components.ratings.percentage > 80) strengths.push("superior ratings");
  if (components.form.percentage > 80) strengths.push("excellent form");
  if (components.distance.percentage > 80) strengths.push("optimal distance");
  if (components.course.percentage > 80) strengths.push("strong course form");
  if (components.sentiment?.percentage > 80)
    strengths.push("positive comments");
  if (components.consistency.percentage > 80)
    strengths.push("consistent performer");
  if (components.connections.percentage > 80)
    strengths.push("in-form connections");
  if (components.formProgression.percentage > 80) strengths.push("improving");

  // Check concerns
  if (components.layoff.percentage < 50)
    concerns.push("returning from absence");
  if (components.class.percentage < 50) concerns.push("step up in class");
  if (components.draw.percentage < 40) concerns.push("unfavorable draw");
  if (components.consistency.percentage < 40)
    concerns.push("inconsistent profile");
  if (components.formProgression.percentage < 40)
    concerns.push("regressive form");

  // Modified base comment to include comparison
  let comment = `${
    topHorse.name
  } is ${confidence} preferred with a score of ${topHorse.score.total.percentage.toFixed(
    1
  )}%`;

  if (runnerUp) {
    // Add key advantages over runner-up
    const advantages: string[] = [];
    Object.entries(components).forEach(([key, value]) => {
      const runnerUpComponents: HorseScore["components"] | undefined =
        runnerUp.score?.components;
      const runnerUpValue =
        runnerUpComponents?.[key as keyof HorseScore["components"]]
          ?.percentage || 0;
      const diff = value.percentage - runnerUpValue;

      if (diff > 15) {
        switch (key) {
          case "ratings":
            advantages.push("better ratings");
            break;
          case "form":
            advantages.push("stronger recent form");
            break;
          case "going":
            advantages.push("better suited by conditions");
            break;
          case "distance":
            advantages.push("more proven at trip");
            break;
          case "course":
            advantages.push("superior course form");
            break;
          case "consistency":
            advantages.push("more reliable profile");
            break;
          case "formProgression":
            advantages.push("more progressive");
            break;
        }
      }
    });

    if (advantages.length) {
      comment += `, holding clear edges in ${advantages.join(" and ")} over ${
        runnerUp.name
      }`;
    }
  }

  // Add form analysis
  const recentForm = topHorse.formObj?.form?.slice(0, 4);
  if (recentForm?.length) {
    const recentWins = recentForm.filter(
      (r) => r.raceOutcomeCode === "1"
    ).length;
    const recentPlaces = recentForm.filter(
      (r) => parseInt(r.raceOutcomeCode || "99") <= 3
    ).length;

    if (recentWins > 0) {
      comment += `. Won ${recentWins} of last ${recentForm.length} starts`;
    } else if (recentPlaces > 0) {
      comment += `. Placed in ${recentPlaces} of last ${recentForm.length} starts`;
    }
  }

  // Add going analysis
  if (race.going && topHorse.stats?.goingPerformance) {
    const goingStats = topHorse.stats.goingPerformance;

    // console.log("ERROR: ", {
    //   name: topHorse?.name,
    //   goingStats,
    //   raceGoing: race.going,
    //   meetingGoing: meetingDetails.going,
    // });

    const raceGoingMap = GOING_REMAP[race?.going?.toLowerCase()];

    const goingWins = goingStats
      ?.flatMap((x) => (raceGoingMap.includes(x.goingCode) ? x.wins : 0))
      .reduce((a, b) => a + b, 0);
    const goingRuns = goingStats
      ?.flatMap((x) => (raceGoingMap.includes(x.goingCode) ? x.runs : 0))
      .reduce((a, b) => a + b, 0);

    if (goingRuns > 0) {
      if (components.going.percentage > 75) {
        comment += `. Ground (${race.going}) looks ideal with ${goingWins} wins from ${goingRuns} starts in similar conditions`;
      } else if (components.going.percentage < 40) {
        comment += `. Going is a significant concern - yet to win on ${race.going} ground from ${goingRuns} attempts`;
      }
    } else {
    }
  }

  // Add race shape analysis
  const frontRunners = race.horses.filter(
    (h) => h.stats?.runStyle === "leader"
  ).length;
  const prominentRunners = race.horses.filter(
    (h) => h.stats?.runStyle === "prominent"
  ).length;
  const heldUpRunners = race.horses.filter(
    (h) => h.stats?.runStyle === "held up"
  ).length;

  if (frontRunners >= 3) {
    comment += ". Strong pace likely with multiple front-runners";
    if (topHorse.stats?.runStyle === "held up") {
      comment += ", which could suit the selection";
    }
  } else if (frontRunners === 0) {
    comment +=
      ". Could develop into tactical affair with no obvious pace-setter";
    if (
      topHorse.stats?.runStyle === "leader" ||
      topHorse.stats?.runStyle === "prominent"
    ) {
      comment += ", potentially favoring the selection's run style";
    }
  } else if (frontRunners === 1 && prominentRunners >= 3) {
    comment += ". Likely to be steadily run with pressure on the leader";
  } else if (heldUpRunners >= 4) {
    comment += ". Many hold-up performers could lead to traffic problems";
    if (
      topHorse.stats?.runStyle === "prominent" ||
      topHorse.stats?.runStyle === "leader"
    ) {
      comment += ", though selection's forward position should avoid trouble";
    }
  }

  // Add course form analysis
  const courseStats = topHorse.stats?.courseForm;
  if (courseStats) {
    if (courseStats.runs === 0) {
      comment += `. First run at ${meetingDetails.venue}`;

      // Check track configuration compatibility
      const trackConfig = race.trackConfig;
      const configStats = topHorse.stats?.trackConfigPerformance;
      if (trackConfig && configStats) {
        const relevantStat = configStats.find((c) => c.style === trackConfig);
        if (relevantStat && relevantStat.winRate > 20) {
          comment += `, though proven on ${trackConfig} tracks (${Math.round(
            relevantStat.winRate
          )}% win rate)`;
        }
      }
    } else {
      const courseForm = `${courseStats.wins}/${courseStats.runs}`;
      if (courseStats.winRate > 25) {
        comment += `. Excellent course form of ${courseForm} at ${meetingDetails.venue}`;
      } else if (courseStats.winRate === 0 && courseStats.runs > 2) {
        comment += `. Yet to win at ${meetingDetails.venue} in ${courseStats.runs} attempts`;
      }
    }
  }

  if (strengths.length) {
    comment += `. Key attributes include ${strengths.join(" and ")}`;
  }
  if (concerns.length) {
    comment += `, though ${concerns.join(" and ")} need consideration`;
  }

  return comment + ".";
}
