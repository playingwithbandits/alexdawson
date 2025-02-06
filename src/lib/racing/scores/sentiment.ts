import { ScoreComponent, ScoreParams } from "./types";

export function calculateSentimentScore({
  horse,
  race,
  raceStats,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 10;

  const sentiment = horse.stats?.sentiment;
  if (sentiment) {
    // Recent form sentiment
    if (sentiment.recentCommentScore > 0) score += 2;
    if (sentiment.recentCommentScore > 2) score += 2;

    // Overall sentiment trend
    if (sentiment.trend === "positive") score += 2;

    if (sentiment.avgCommentScore > 0) score += 2;

    // Ratio of positive to negative comments
    const ratio =
      sentiment.positiveComments / (sentiment.negativeComments || 1);

    if (ratio > 0) score += 2;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
