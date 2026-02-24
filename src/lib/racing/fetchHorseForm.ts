import { FormObj } from "@/types/racing";
import { horseNameToKey } from "./scores/funcs";

const CACHE_KEY_PREFIX = "horse-form:";
const memoryCache = new Map<string, FormObj>();
const pendingResults = new Set<string>();

function getCached(name: string): FormObj | undefined {
  const key = CACHE_KEY_PREFIX + name;
  const fromMemory = memoryCache.get(key);
  return fromMemory;
}

function setCached(name: string, data: FormObj): void {
  const key = CACHE_KEY_PREFIX + name;
  memoryCache.set(key, data);
  console.log("fetchHorseForm: Successfully set cached horse form:", {
    key,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPendingResult(
  name: string,
): Promise<FormObj | undefined> {
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const cached = getCached(name);
    if (cached !== undefined) {
      pendingResults.delete(name);
      return cached;
    }

    attempts += 1;
    await sleep(60_000);
  }

  pendingResults.delete(name);
  return getCached(name);
}

export async function fetchHorseForm(
  name: string,
  profileUrl: string,
): Promise<FormObj | undefined> {
  try {
    //console.log("Fetching form for URL:", profileUrl);
    if (!profileUrl) return undefined;

    // Convert profile URL to form URL
    const formUrl =
      profileUrl
        .replace("/profile/horse/", "/profile/tab/horse/")
        .split("#")[0] + "/form";

    const cacheKey = horseNameToKey(name);
    //console.log("Converted to form URL:", formUrl);

    const cached = getCached(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    if (pendingResults.has(cacheKey)) {
      return await waitForPendingResult(cacheKey);
    }

    pendingResults.add(cacheKey);

    const response = await fetch(`/getP.php?q=${encodeURIComponent(formUrl)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const formData = await response.json();

    if (formData && formData?.form?.length > 0) {
      setCached(cacheKey, formData as unknown as FormObj);
    }

    return formData;
  } catch {
    return undefined;
  } finally {
    const cacheKey = horseNameToKey(name);
    pendingResults.delete(cacheKey);
  }
}
