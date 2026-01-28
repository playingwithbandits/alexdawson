import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

type WordSet = Set<string>;

function readWordList(filePath: string): WordSet {
  if (!existsSync(filePath)) return new Set<string>();
  return new Set(
    readFileSync(filePath, "utf-8")
      .split(/\r?\n/g)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

const DEFAULT_PREPOSITIONS = new Set<string>([
  "about",
  "above",
  "across",
  "after",
  "against",
  "along",
  "among",
  "amongst",
  "around",
  "as",
  "at",
  "before",
  "behind",
  "below",
  "beneath",
  "beside",
  "besides",
  "between",
  "beyond",
  "by",
  "despite",
  "down",
  "during",
  "except",
  "for",
  "from",
  "in",
  "inside",
  "into",
  "like",
  "near",
  "of",
  "off",
  "on",
  "onto",
  "out",
  "outside",
  "over",
  "past",
  "since",
  "through",
  "throughout",
  "till",
  "to",
  "toward",
  "towards",
  "under",
  "underneath",
  "until",
  "up",
  "upon",
  "via",
  "with",
  "within",
  "without",
]);

function main() {
  const root = process.cwd();

  // input
  const inputPath = path.join(root, "output", "real_words.txt");
  if (!existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const words = readFileSync(inputPath, "utf-8")
    .split(/\r?\n/g)
    .map((s) => s.trim())
    .filter(Boolean);

  // removal lists
  const conjs = readWordList(path.join(root, "top_english_conjs_lower_500.txt"));
  const nouns = readWordList(path.join(root, "top_english_nouns_lower_10000.txt"));
  const prons = readWordList(path.join(root, "top_english_prons_lower_10000.txt"));

  // optional prepositions file (if you add one later, it will override the default set)
  const prepsFile = path.join(root, "top_english_preps_lower.txt");
  const preps = existsSync(prepsFile) ? readWordList(prepsFile) : DEFAULT_PREPOSITIONS;

  const removed = {
    conjunctions: 0,
    nouns: 0,
    pronouns: 0,
    prepositions: 0,
    otherListHit: 0,
  };

  const kept: string[] = [];

  for (const raw of words) {
    const w = raw.toLowerCase();

    const isConj = conjs.has(w);
    const isNoun = nouns.has(w);
    const isPron = prons.has(w);
    const isPrep = preps.has(w);

    if (isConj || isNoun || isPron || isPrep) {
      if (isConj) removed.conjunctions += 1;
      if (isNoun) removed.nouns += 1;
      if (isPron) removed.pronouns += 1;
      if (isPrep) removed.prepositions += 1;
      if ((isConj ? 1 : 0) + (isNoun ? 1 : 0) + (isPron ? 1 : 0) + (isPrep ? 1 : 0) > 1) {
        removed.otherListHit += 1;
      }
      continue;
    }

    kept.push(raw);
  }

  const outputDir = path.join(root, "output");
  const outputPath = path.join(outputDir, "real_words_filtered.txt");
  writeFileSync(outputPath, kept.join("\n"));

  console.log("Filtered output written:");
  console.log(`- ${outputPath}`);
  console.log("");
  console.log("Counts:");
  console.log(`- input: ${words.length}`);
  console.log(`- kept: ${kept.length}`);
  console.log(`- removed (hits):`);
  console.log(`  - nouns: ${removed.nouns}`);
  console.log(`  - pronouns: ${removed.pronouns}`);
  console.log(`  - prepositions: ${removed.prepositions}`);
  console.log(`  - conjunctions: ${removed.conjunctions}`);
  console.log(`  - multi-category hits: ${removed.otherListHit}`);
}

main();

