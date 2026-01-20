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
  "kept on",
  "headway",
  "challenged",
  "pressed",
  "led",
  "ridden out",
  "cosily",
  "readily",
  "going best",
  "going easily",
  "smooth headway",
  "ran on well",
  "promising",
  "comfortably",
  "just prevailed",
  "eyecatcher",
  "rallied",
  "nearest finish",
  "just did enough",

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

  // New positive terms
  "made all",
  "went clear",
  "pushed out",
  "ran on",
  "shaken up",
  "always doing enough",
  "recovered",
  "disputed lead",
  "faced challenge",
  "nudged along",
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
  "pulled up",
  "pulled hard",
  "no extra",
  "no impression",
  "no match",
  "dwelt",
  "hung",
  "unseated",
  "fell",
  "tailed off",
  "refused",

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

  // New negative terms
  "ducked",
  "carried head awkwardly",
  "stone bruise",
  "off feed",
  "ran green",
  "respiratory noise",
  "not clear run",
  "no chance",
  "short of room",
  "lost touch",
  "hung right",
  "hung left",

  // New negative terms
  "reared",
  "slowly away",
  "visibility reduced",
  "struggling home",
  "carried head",
  "pecked",
  "sprawled",
  "unsuitable ground",
  "lost ground",
  "dropped to rear",
  "lost position",
  "not reach leaders",
  "not near to challenge",
  "not pace to challenge",
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
