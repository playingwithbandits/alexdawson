import fs from "fs";
import path from "path";

const INPUT_FILE = path.join(process.cwd(), "cache/data/formComments.json");
const OUTPUT_FILE = path.join(process.cwd(), "cache/data/formComments.json");

function deduplicateWords(comments: string[]): string[] {
  // Create a Set to track unique words
  const uniqueWords = new Set<string>();
  const deduplicatedComments: string[] = [];

  for (const comment of comments) {
    // Split the comment into words
    const words = comment.toLowerCase().split(/\s+/);

    // Filter out duplicate words while preserving order
    const uniqueWordsInComment = words.filter((word) => {
      if (uniqueWords.has(word)) {
        return false;
      }
      uniqueWords.add(word);
      return true;
    });

    // Join the unique words back into a comment
    deduplicatedComments.push(uniqueWordsInComment.join(" "));
  }

  return deduplicatedComments;
}

async function main() {
  try {
    console.log("Reading formComments.json...");
    const data = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));

    console.log("Deduplicating words...");
    const deduplicatedData = deduplicateWords(data);

    console.log("Writing deduplicated data back to file...");
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(deduplicatedData, null, 2));

    console.log("Done!");
    console.log(`Original comments count: ${data.length}`);
    console.log(`Deduplicated comments count: ${deduplicatedData.length}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
