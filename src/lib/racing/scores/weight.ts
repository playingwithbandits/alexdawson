import { avg } from "@/lib/utils";
import { ScoreComponent, ScoreParams } from "./types";

export function calculateWeightScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  const weightProgression = horse.stats?.weightProgression || [];
  if (weightProgression.length >= 3) {
    // Progressive weight carrying
    const isProgressive = weightProgression.every(
      (w, i, arr) => i === 0 || Math.abs(w - arr[i - 1]) <= 3
    );
    if (isProgressive) score += 4;

    // Current weight vs recent average
    const recentAvg = avg(weightProgression.slice(0, 3));
    if (horse.weight.pounds <= recentAvg) score += 3;
    if (horse.weight.pounds <= recentAvg - 3) score += 3;
  }

  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
