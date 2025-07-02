import { calculateRacedAgainstScore } from "./score2/raceAgainst";
import { HorseScore, ScoreParams } from "./types";
import { RACING_SCORE_WEIGHTS } from "./weights";

export function calculateHorseScore4(props: ScoreParams): HorseScore {
  const racedAgainst = calculateRacedAgainstScore(props);

  const components = {
    racedAgainst,
  };

  const weightedScores = Object.entries(components).map(
    ([key, component]) =>
      component.percentage *
      RACING_SCORE_WEIGHTS[key as keyof typeof components]
  );

  const totalScore = weightedScores.reduce((a, b) => a + b, 0);
  const maxPossibleScore = Object.values(RACING_SCORE_WEIGHTS).reduce(
    (a, b) => a + b * 100,
    0
  );

  return {
    total: {
      score: totalScore,
      maxScore: maxPossibleScore,
      percentage: (totalScore / maxPossibleScore) * 100,
    },
    components,
  };
}
