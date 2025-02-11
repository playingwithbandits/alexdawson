import { ScoreComponent, ScoreParams } from "./types";

export function calculateAgeProfileScore({
  horse,
  race,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  let maxScore = 1;

  const age = parseInt(horse.age);
  const isFlat = meetingDetails.type?.toLowerCase().includes("flat");
  const isJumps = meetingDetails.type?.toLowerCase().includes("jumps");
  const distance = race.distance || 0;

  // Age suitability for race type
  if (isFlat) {
    maxScore += 3;
    // Sprint races favor younger horses
    if (distance <= 7) {
      if (age >= 3 && age <= 5) score++;
    }
    // Middle distance suits mature horses
    else if (distance <= 12) {
      if (age >= 4 && age <= 6) score++;
    }
    // Staying races suit older horses
    else {
      if (age >= 5) score++;
    }
  }

  if (isJumps) {
    maxScore += 1;
    // Younger horses in novice races
    if (race.title?.toLowerCase().includes("novice")) {
      if (age >= 5 && age <= 7) score++;
    }
    // Peak age for jumps
    else {
      if (age >= 7 && age <= 9) score++;
    }
  }

  // Recent form for age group
  const recentRuns = horse.formObj?.form?.slice(0, 6) || [];
  const ageGroupSuccess = recentRuns.some(
    (run) => parseInt(run.raceOutcomeCode || "99") <= 3
  );
  if (ageGroupSuccess) score++;

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
