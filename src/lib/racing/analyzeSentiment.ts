const POSITIVE_TERMS = [
  // Strong performance
  "impressive",
  "strong",
  "well",
  "good",
  "promising",
  "improved",
  "progressive",
  "comfortable",
  "easily",
  "clear",
  "dominated",
  "smooth",
  "perfect",
  "professional",
  "consistent",
  "cruised",
  "quickened",
  "powered",
  "stormed",
  "commanded",

  // Winning terms
  "won",
  "scored",
  "landed",
  "prevailed",
  "delivered",
  "justified",
  "stayed on",

  // Form indicators
  "progress",
  "potential",
  "scopey",
  "straightforward",
  "genuine",
  "game",
  "determined",
  "willing",
  "honest",
  "ready",
  "sharp",
  "thriving",
  "flourishing",

  // Movement quality
  "travelled",
  "moved",
  "balanced",
  "fluent",
  "rhythm",
  "flowing",
  "nimble",
  "athletic",
  "agile",
  "springy",
  "bouncing",
];

const NEGATIVE_TERMS = [
  // Poor performance
  "struggled",
  "weakened",
  "poor",
  "disappointing",
  "faded",
  "tired",
  "outpaced",
  "never",
  "tailed",
  "labored",
  "failed",
  "dropped",
  "lost",
  "hampered",
  "awkward",
  "beaten",
  "behind",
  "detached",
  "eased",
  "stopped",

  // Movement issues
  "stumbled",
  "bumped",
  "interfered",
  "unbalanced",
  "hanging",
  "wandered",
  "veered",
  "edged",
  "lugged",
  "switched",
  "drifted",

  // Form concerns
  "regressive",
  "flat",
  "reluctant",
  "unwilling",
  "hesitant",
  "sloppy",
  "green",
  "raw",
  "unfocused",
  "temperamental",
  "restless",
  "unsettled",
  "nervous",

  // Fitness/effort
  "blew",
  "unfit",
  "legless",
  "emptied",
  "finished",
  "exhausted",
  "spent",
  "heavy",
  "plodded",
  "struggled",
];

export function analyzeSentiment(comment: string): {
  score: number;
  isPositive: boolean;
} {
  const lowerComment = comment.toLowerCase();

  let score = 0;

  // Count positive and negative terms
  POSITIVE_TERMS.forEach((term) => {
    if (lowerComment.includes(term)) score += 1;
  });

  NEGATIVE_TERMS.forEach((term) => {
    if (lowerComment.includes(term)) score -= 1;
  });

  return {
    score,
    isPositive: score > 0,
  };
}
