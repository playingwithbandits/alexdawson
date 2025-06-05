import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

function cleanWord(word: string): string {
  // Remove punctuation and convert to lowercase
  return word.toLowerCase().replace(/[^\w\s]/g, "");
}

function extractUniqueWords(): void {
  try {
    // Read the JSON file
    const filePath = join(process.cwd(), "cache", "data", "formComments.json");
    const fileContent = readFileSync(filePath, "utf-8");
    const comments: string[] = JSON.parse(fileContent);

    // Set to store unique words
    const uniqueWords = new Set<string>();

    // Process each comment
    for (const comment of comments) {
      // Split into words and clean each word
      const words = comment.split(/\s+/);
      const cleanedWords = words.map(cleanWord);

      // Add non-empty words to the set
      cleanedWords.forEach((word) => {
        if (word) uniqueWords.add(word);
      });
    }

    // Convert set to sorted array
    const uniqueWordsList = Array.from(uniqueWords).sort();

    // Print results
    console.log(`Total number of unique words: ${uniqueWordsList.length}`);
    console.log("\nFirst 50 unique words:");
    console.log(uniqueWordsList.slice(0, 50));

    // Save to file
    const outputFile = join(process.cwd(), "unique_words.txt");
    writeFileSync(outputFile, uniqueWordsList.join("\n"));
    console.log(`\nAll unique words have been saved to ${outputFile}`);
  } catch (error) {
    console.error("Error processing file:", error);
  }
}

// Run the function
extractUniqueWords();
