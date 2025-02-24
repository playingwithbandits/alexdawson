import { avg } from "@/lib/utils";
import { ScoreComponent, ScoreParams } from "./types";

export function calculateWeightScore({ horse }: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 1;

  const weightProgression = horse.stats?.weightProgression || [];
  if (weightProgression.length >= 3) {
    // Current weight vs recent average
    const recentAvg = avg(weightProgression.slice(0, 3));
    if (horse.weight.pounds <= recentAvg) score++;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
