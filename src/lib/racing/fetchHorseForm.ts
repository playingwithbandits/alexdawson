import { FormObj } from "@/types/racing";
import { horseNameToKey } from "./scores/funcs";

const CACHE_KEY_PREFIX = "horse-form:";
const memoryCache = new Map<string, FormObj>();

function getCached(name: string): FormObj | undefined {
  console.log("fetchHorseForm: getCached called for:", name);
  const key = CACHE_KEY_PREFIX + name;
  const fromMemory = memoryCache.get(key);
  console.log("fetchHorseForm: checking memory cache for key:", {
    key,
    memoryCache,
    fromMemory,
  });
  return fromMemory;
}

function setCached(name: string, data: FormObj): void {
  const key = CACHE_KEY_PREFIX + name;
  memoryCache.set(key, data);
  console.log("fetchHorseForm: Successfully set cached horse form:", {
    key,
  });
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

    const key = horseNameToKey(name);
    //console.log("Converted to form URL:", formUrl);

    const cached = getCached(key);
    if (cached !== undefined) {
      return cached;
    }

    const response = await fetch(`/getP.php?q=${encodeURIComponent(formUrl)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const formData = await response.json();

    if (formData && formData?.form?.length > 0) {
      setCached(key, formData as unknown as FormObj);
    }

    return formData;
  } catch {
    return undefined;
  }
}
