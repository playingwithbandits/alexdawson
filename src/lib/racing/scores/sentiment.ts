import { ScoreComponent, ScoreParams } from "./types";

export function calculateSentimentScore({
  horse,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 5;

  const sentiment = horse.stats?.sentiment;
  if (sentiment) {
    // Recent form sentiment
    if (sentiment.recentCommentScore > 0) score++;
    if (sentiment.recentCommentScore > 2) score++;

    // Overall sentiment trend
    if (sentiment.trend === "positive") score++;

    if (sentiment.avgCommentScore > 0) score++;

    // Ratio of positive to negative comments
    const ratio =
      sentiment.positiveComments / (sentiment.negativeComments || 1);

    if (ratio > 0) score++;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
