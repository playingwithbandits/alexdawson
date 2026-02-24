import { FormObj } from "@/types/racing";
import { horseNameToKey } from "./scores/funcs";

const CACHE_KEY_PREFIX = "horse-form:";
const memoryCache = new Map<string, FormObj>();

function getCached(name: string): FormObj | undefined {
  const key = CACHE_KEY_PREFIX + name;
  const fromMemory = memoryCache.get(key);
  if (fromMemory) return fromMemory;
  if (typeof window === "undefined") return undefined;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return undefined;
    const parsed = JSON.parse(stored) as FormObj;
    memoryCache.set(key, parsed);
    return parsed;
  } catch {
    return undefined;
  }
}

function setCached(name: string, data: FormObj): void {
  const key = CACHE_KEY_PREFIX + name;
  memoryCache.set(key, data);
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota exceeded or private mode
  }
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
    if (cached !== undefined) return cached;

    const response = await fetch(`/getP.php?q=${encodeURIComponent(formUrl)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const formData = await response.json();
    //console.log("Parsed form data:", formData);

    if (Array.isArray(formData) && formData.length > 0) {
      setCached(key, formData as unknown as FormObj);
    }

    return formData;
  } catch {
    //console.error("Error fetching horse form:", error);
    return undefined;
  }
}
