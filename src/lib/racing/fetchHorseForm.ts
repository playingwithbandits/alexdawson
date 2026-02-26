import { FormObj } from "@/types/racing";
import { fetchFormWithLimit } from "./fetchWithLimit";
import { horseNameToKey } from "./scores/funcs";

const CACHE_KEY_PREFIX = "horse-form:";
const memoryCache = new Map<string, FormObj>();

export function getCachedForm(name: string): FormObj | undefined {
  const key = CACHE_KEY_PREFIX + name;
  const fromMemory = memoryCache.get(key);
  return fromMemory;
}

export function setCachedForm(name: string, data: FormObj): void {
  const key = CACHE_KEY_PREFIX + name;
  const cached = getCachedForm(name);
  if (cached === undefined) {
    memoryCache.set(key, data);
    console.log("fetchHorseForm: Successfully set cached horse form:", {
      key,
    });
  }
}

export async function fetchHorseForm(
  name: string,
  profileUrl: string,
): Promise<FormObj | undefined> {
  try {
    if (!profileUrl) {
      //console.log("fetchHorseForm func: No profileUrl provided for", name);
      return undefined;
    }

    // Convert profile URL to form URL
    const formUrl =
      profileUrl
        .replace("/profile/horse/", "/profile/tab/horse/")
        .split("#")[0] + "/form";

    const cacheKey = horseNameToKey(name);
    //console.log("Converted to form URL:", formUrl);

    const cachedCheck1 = getCachedForm(cacheKey);
    if (cachedCheck1 !== undefined) {
      // console.log("fetchHorseForm func: Cache hit (first check) for", cacheKey);
      return cachedCheck1;
    }

    const formData = await fetchFormWithLimit(
      `/getP.php?q=${encodeURIComponent(formUrl)}`,
      name,
    );

    if (formData) {
      setCachedForm(cacheKey, formData as unknown as FormObj);

      return formData as unknown as FormObj;
    }
    return undefined;
  } catch (err) {
    //console.log("fetchHorseForm func: Error fetching data for", name, "-", err);
    return undefined;
  }
}
