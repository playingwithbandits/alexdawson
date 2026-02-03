import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

type Category = "positive" | "negative" | "hampered" | "amazing" | "other";

/**
 * Edit these lists to tune classification.
 * Matching is case-insensitive (everything is lowercased).
 */
const CATEGORY_WORDS: Record<Category, Set<string>> = {
  positive: new Set([
    // strong positive / approval
    "good",
    "great",
    "better",
    "best",
    "fine",
    "ideal",
    "nicely",
    "smartly",
    "promising",
    "impressive",
    "impressed",
    "confident",
    "comfortable",
    "comfortably",
    "easy",
    "easily",
    "handy",
    "capable",
    "favourite",
    "favourable",
    "favourably",
    "positive",
    "positively",
    "successful",
    "successfully",

    // pace / travel / response
    "quick",
    "quickly",
    "quicker",
    "quickest",
    "quickened",
    "swift",
    "fast",
    "faster",
    "speed",
    "readily",
    "ready",
    "travel",
    "travelled",
    "travelling",
    "cruised",
    "cruising",
    "powered",
    "powerfully",
    "respond",
    "responded",
    "responding",

    // progress / improvement
    "improve",
    "improved",
    "improving",
    "improvement",
    "accelerated",
    "accelerating",
    "acceleration",
    "progress",
    "progressed",
    "progressing",
    "advance",
    "advanced",
    "gained",
    "gaining",

    // attitude / effort
    "bold",
    "brave",
    "gamely",
    "fought",
    "fighting",

    // cleanliness / efficiency
    "clear",
    "clearly",
    "clean",
    "smooth",
    "smoothly",

    // outcomes
    "finish",
    "finished",
    "finishing",
    "finisher",
    "winner",
    "winning",
    "won",
    "placed",
  ]),

  negative: new Set([
    // general negatives
    "bad",
    "badly",
    "poor",
    "poorer",
    "poorly",
    "wrong",
    "worse",
    "worst",
    "error",
    "errors",
    "mistake",
    "mistakes",
    "failed",
    "failing",
    "failure",
    "disappointed",
    "disappointing",
    "disappointingly",
    "unlucky",
    "unfavourable",
    "unfortunately",

    // weakening / fatigue
    "weak",
    "weaken",
    "weakened",
    "weakening",
    "weaker",
    "tired",
    "tiring",
    "fatigue",

    // slowing / stopping
    "slow",
    "slower",
    "slowly",
    "sluggish",
    "stopped",
    "stopping",

    // losing ground / awkwardness
    "lost",
    "lose",
    "losing",
    "faded",
    "veered",
    "veering",
    "awkward",
    "awkwardly",
    "reluctant",
    "unsure",
    "unsettled",
    "uncompetitive",
    "heavy",
    "heavily",
    "hung",
    "dropped",
    "dropping",

    // struggling
    "struggle",
    "struggled",
    "struggling",
  ]),

  hampered: new Set([
    // key trouble-in-running words
    "hampered",
    "bumped",
    "barged",
    "checked",
    "blocked",
    "crowded",
    "impeded",
    "interfered",
    "interference",
    "stumbled",
    "trapped",
    "delayed",
    "dislodged",
    "entangled",
    "forced",
    "squeezed",
    "squeeze",
    "jammed",
    "jinked",
    "collided",
    "cornered",
    "clipped",
    "slipped",
    "stuck",
    "pulled",
    "pushed",
    "restrained",
    "restraint",
    "unbalanced",
    "unbalance",
  ]),

  amazing: new Set([
    // standout / superlatives
    "eyecatcher",
    "eyecatching",
    "remarkable",
    "excellent",
    "outstanding",
    "superb",
    "brilliant",
    "sensational",
    "electrifying",
    "amazing",
    "incredible",
    "exceptional",
    "phenomenal",
    "extraordinary",
    "unbelievable",
    "stunning",
    "breathtaking",
  ]),
  other: new Set([]),
};

/**
 * Optional substring/stem cues.
 * If any cue matches, the word is assigned to that category (after exact word checks).
 */
const CATEGORY_CUES: Record<Category, string[]> = {
  positive: [
    "improv",
    "progress",
    "accelerat",
    "quick",
    "strong",
    "readily",
    "travel",
    "cruis",
    "power",
    "respond",
  ],
  negative: ["weaken", "tire", "wors", "fail", "struggl", "veer", "slow", "drop", "fade", "hung"],
  hampered: ["hamper", "bump", "imped", "block", "check", "crowd", "squeez", "stumble", "trap"],
  amazing: ["eyecatch", "brilliant", "outstanding", "sensational", "remarkable", "incred", "phenomen"],
  other: [],
};

const CATEGORY_PRIORITY: Category[] = ["hampered", "negative", "amazing", "positive", "other"];

function normalizeWord(raw: string): string {
  return raw.trim().toLowerCase();
}

function classifyWord(word: string): Category {
  // Exact match first
  for (const cat of CATEGORY_PRIORITY) {
    if (CATEGORY_WORDS[cat].has(word)) return cat;
  }

  // Then cue-based match
  for (const cat of CATEGORY_PRIORITY) {
    const cues = CATEGORY_CUES[cat];
    if (cues.some((c) => word.includes(c))) return cat;
  }

  // Default bucket if it doesn't match anything
  return "other";
}

function main() {
  const root = process.cwd();
  const inputPath = path.join(root, "output", "all_words.txt");

  if (!existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const rawWords = readFileSync(inputPath, "utf-8")
    .split(/\r?\n/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const buckets: Record<Category, string[]> = {
    positive: [],
    negative: [],
    hampered: [],
    amazing: [],
    other: [],
  };

  const categoryByWord: Record<string, Category> = {};

  for (const raw of rawWords) {
    const w = normalizeWord(raw);
    const category = classifyWord(w);
    buckets[category].push(raw);
    categoryByWord[raw] = category;
  }

  const outDir = path.join(root, "output");

  // Write per-category lists
  (Object.keys(buckets) as Category[]).forEach((cat) => {
    const outPath = path.join(outDir, `words_${cat}.txt`);
    writeFileSync(outPath, buckets[cat].join("\n"));
  });

  // Write a summary JSON (useful for debugging/tweaking)
  const summaryPath = path.join(outDir, "word_categories.json");
  writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        input: inputPath,
        totals: {
          input: rawWords.length,
          positive: buckets.positive.length,
          negative: buckets.negative.length,
          hampered: buckets.hampered.length,
          amazing: buckets.amazing.length,
          other: buckets.other.length,
        },
        rules: {
          priority: CATEGORY_PRIORITY,
          exactCounts: {
            positive: CATEGORY_WORDS.positive.size,
            negative: CATEGORY_WORDS.negative.size,
            hampered: CATEGORY_WORDS.hampered.size,
            amazing: CATEGORY_WORDS.amazing.size,
            other: CATEGORY_WORDS.other.size,
          },
          cueCounts: {
            positive: CATEGORY_CUES.positive.length,
            negative: CATEGORY_CUES.negative.length,
            hampered: CATEGORY_CUES.hampered.length,
            amazing: CATEGORY_CUES.amazing.length,
            other: CATEGORY_CUES.other.length,
          },
        },
        categoryByWord,
      },
      null,
      2
    )
  );

  console.log("Categorized words written to output/:");
  console.log(`- ${path.join(outDir, "words_positive.txt")}`);
  console.log(`- ${path.join(outDir, "words_negative.txt")}`);
  console.log(`- ${path.join(outDir, "words_hampered.txt")}`);
  console.log(`- ${path.join(outDir, "words_amazing.txt")}`);
  console.log(`- ${path.join(outDir, "words_other.txt")}`);
  console.log(`- ${summaryPath}`);
  console.log("");
  console.log("Counts:");
  console.log(`- input: ${rawWords.length}`);
  console.log(`- positive: ${buckets.positive.length}`);
  console.log(`- negative: ${buckets.negative.length}`);
  console.log(`- hampered: ${buckets.hampered.length}`);
  console.log(`- amazing: ${buckets.amazing.length}`);
  console.log(`- other: ${buckets.other.length}`);
}

main();

