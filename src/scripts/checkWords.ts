import fs from "fs";
import path from "path";

async function processWords() {
  try {
    // Read the unique_words.txt file
    const filePath = path.join(__dirname, "../../unique_words.txt");
    const content = fs.readFileSync(filePath, "utf-8");
    const words = content.split("\n").filter((word) => word.trim());

    // Read the dictionary file (words_alpha.txt)
    const dictPath = path.join(__dirname, "../../words_alpha.txt");
    if (!fs.existsSync(dictPath)) {
      console.error(
        "Dictionary file words_alpha.txt not found in project root. Please download it from https://github.com/dwyl/english-words and place it in your project root."
      );
      process.exit(1);
    }
    const dictContent = fs.readFileSync(dictPath, "utf-8");
    const dictWords = new Set(
      dictContent
        .split("\n")
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean)
    );

    // Create results arrays
    const realWords: string[] = [];
    const notRealWords: string[] = [];

    // Process each word
    console.log("Processing words against dictionary...");
    words.forEach((word) => {
      const isReal = dictWords.has(word.toLowerCase());
      if (isReal) {
        realWords.push(word);
      } else {
        notRealWords.push(word);
      }
    });

    // Write results to files
    const outputDir = path.join(__dirname, "../../output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    fs.writeFileSync(
      path.join(outputDir, "real_words.txt"),
      realWords.join("\n")
    );
    fs.writeFileSync(
      path.join(outputDir, "not_real_words.txt"),
      notRealWords.join("\n")
    );

    console.log("\nResults:");
    console.log(`Total words processed: ${words.length}`);
    console.log(`Real words: ${realWords.length}`);
    console.log(`Not real words: ${notRealWords.length}`);
    console.log("\nResults have been written to:");
    console.log(`- ${path.join(outputDir, "real_words.txt")}`);
    console.log(`- ${path.join(outputDir, "not_real_words.txt")}`);
  } catch (error) {
    console.error("Error processing words:", error);
  }
}

// Run the script
processWords();
