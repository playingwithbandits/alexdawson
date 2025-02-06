import { ScoreComponent, ScoreParams } from "./types";

export function calculateDistanceScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  score++;

  const scoreComponent: ScoreComponent = {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };

  return scoreComponent;
}
