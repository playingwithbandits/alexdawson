import fs from "fs/promises";
import path from "path";
import { FormEntry, Horse, Meeting, Race } from "@/types/racing";

async function extractRaceTypeCodes() {
  const racingCacheDir = path.join(process.cwd(), "cache", "racing");
  const outputFile = path.join(
    process.cwd(),
    "cache",
    "data",
    "raceTypeCodes.json"
  );

  // Ensure data directory exists
  await fs.mkdir(path.join(process.cwd(), "cache", "data"), {
    recursive: true,
  });

  // Get all JSON files from racing cache
  const files = await fs.readdir(racingCacheDir);
  const jsonFiles = files.filter((f: string) => f.endsWith(".json"));

  const allRaceTypeCodes: {
    raceTypeCode: string;
    raceTitle: string;
    raceInstanceUid: number;
  }[] = [];

  // Process each file
  for (const file of jsonFiles) {
    const content = await fs.readFile(path.join(racingCacheDir, file), "utf8");
    const data = JSON.parse(content) as Meeting[];

    // Extract race type codes from each meeting's races
    data.forEach((meeting: Meeting) => {
      meeting.races?.forEach((race: Race) => {
        if (race.raceTypeCode) {
          allRaceTypeCodes.push({
            raceTypeCode: race.raceTypeCode,
            raceTitle: race.title,
            raceInstanceUid: race.id ? parseInt(race.id) : 0,
          });
        }
        race.horses?.forEach((horse: Horse) => {
          if (horse.formObj?.form) {
            horse.formObj.form.forEach((form: FormEntry) => {
              if (form.raceTypeCode) {
                allRaceTypeCodes.push({
                  raceTypeCode: form.raceTypeCode,
                  raceTitle: form.raceInstanceTitle || "",
                  raceInstanceUid: form.raceInstanceUid
                    ? parseInt(form.raceInstanceUid.toString())
                    : 0,
                });
              }
            });
          }
        });
      });
    });
  }
  // Remove duplicates and save to file
  const uniqueRaceTypeCodes = [
    ...new Set(allRaceTypeCodes.map((r) => r.raceTypeCode)),
  ].map((code) => {
    const race = allRaceTypeCodes.find((r) => r.raceTypeCode === code);
    return {
      raceTypeCode: code,
      raceTitle: race?.raceTitle || "",
      raceInstanceUid: race?.raceInstanceUid || 0,
    };
  });
  await fs.writeFile(outputFile, JSON.stringify(uniqueRaceTypeCodes, null, 2));

  console.log(
    `Extracted ${uniqueRaceTypeCodes.length} unique race type codes to ${outputFile}`
  );
}

extractRaceTypeCodes().catch(console.error);
