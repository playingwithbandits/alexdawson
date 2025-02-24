import { ScoreComponent, ScoreParams } from "./types";

export function calculateDrawScore({
  horse,
  race,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 3;

  if (!horse.draw) {
    score += maxScore;
  } else {
    const drawBias = race.drawBias;
    const numberOfRunners = race.runners;

    if (drawBias && numberOfRunners) {
      const isLowDraw = parseInt(horse.draw) <= numberOfRunners * 0.3;
      const isHighDraw = parseInt(horse.draw) >= numberOfRunners * 0.7;
      const isMiddleDraw =
        parseInt(horse.draw) > numberOfRunners * 0.3 &&
        parseInt(horse.draw) < numberOfRunners * 0.7;

      if (drawBias === "Low" && isLowDraw) {
        score++;
      }
      if (drawBias === "High" && isHighDraw) {
        score++;
      }
      if (drawBias === "Middle" && isMiddleDraw) {
        score++;
      }
    }
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
