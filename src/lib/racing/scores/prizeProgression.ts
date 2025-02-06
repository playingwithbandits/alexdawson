import { avg } from "@/lib/utils";
import { ScoreComponent, ScoreParams } from "./types";

export function calculatePrizeProgressionScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 0;

  const form = horse.formObj?.form || [];
  const prizesWon = form
    .slice(0, 6)
    .map((r) => r.prizeSterling || 0)
    .filter((p) => p > 0);

  if (prizesWon.length >= 3) {
    // Progressive prize money winning
    const isProgressive = prizesWon.every(
      (p, i, arr) => i === 0 || p >= arr[i - 1] * 0.8
    );
    if (isProgressive) score += 5;

    // Current race prize vs average won
    const avgPrize = avg(prizesWon);
    const racePrize = parseInt(race.prize?.replace(/[£,]/g, "") || "0");
    if (racePrize <= avgPrize * 1.2) score += 5;
  }
  return {
    score,
    maxScore,
    percentage: maxScore === 0 ? 0 : (score / maxScore) * 100,
  };
}
