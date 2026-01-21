import { analyseSentimentFromComment, countCommentSentimentObj } from "../utils";


export function analyzeSentiment(comment: string): {
  score: number;
  isPositive: boolean;
} {

  const { score } = countCommentSentimentObj(analyseSentimentFromComment(comment).matchedTerms);


  return {
    score,
    isPositive: score > 0,
  };
}
