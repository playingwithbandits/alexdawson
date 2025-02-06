import fs from "fs/promises";
import path from "path";
import { Meeting, Race, Horse } from "@/types/racing";

async function extractComments() {
  const racingCacheDir = path.join(process.cwd(), "cache", "racing");
  const outputFile = path.join(process.cwd(), "cache", "data", "comments.json");

  // Ensure data directory exists
  await fs.mkdir(path.join(process.cwd(), "cache", "data"), {
    recursive: true,
  });

  // Get all JSON files from racing cache
  const files = await fs.readdir(racingCacheDir);
  const jsonFiles = files.filter((f: string) => f.endsWith(".json"));

  const allComments: string[] = [];

  // Process each file
  for (const file of jsonFiles) {
    const content = await fs.readFile(path.join(racingCacheDir, file), "utf8");
    const data = JSON.parse(content) as Meeting[];

    // Extract comments from each meeting's races and horses
    data.forEach((meeting: Meeting) => {
      meeting.races?.forEach((race: Race) => {
        race.horses?.forEach((horse: Horse) => {
          if (horse.formObj?.form?.[0]?.rpCloseUpComment) {
            allComments.push(horse.formObj.form[0].rpCloseUpComment);
          }
        });
      });
    });
  }

  // Remove duplicates and save to file
  const uniqueComments = [...new Set(allComments)];
  await fs.writeFile(outputFile, JSON.stringify(uniqueComments, null, 2));

  //console.log(
  //   `Extracted ${uniqueComments.length} unique comments to ${outputFile}`
  // );
}

extractComments().catch(console.error);
