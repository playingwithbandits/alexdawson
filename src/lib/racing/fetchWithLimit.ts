import { FormObj } from "@/types/raceday";
import { horseNameToKey } from "./scores/funcs";

const MAX_CONCURRENT = 3;
const BASE_RETRY_DELAY_MS = 500;
let activeCount = 0;
const queue: Array<() => void> = [];

const formResponseCache = new Map<string, FormObj>();

function cacheKey(name: string): string {
  return horseNameToKey(name);
}

function runNext(): void {
  if (activeCount >= MAX_CONCURRENT) return;
  const next = queue.shift();
  if (!next) return;
  activeCount++;
  next();
}

export function fetchFormWithLimit(
  inputUrl: string,
  name: string,
): Promise<FormObj | undefined> {
  const key = cacheKey(name);

  const cached = formResponseCache.get(key);
  if (cached !== undefined) {
    console.log(`fetchFormWithLimit resolved: From cache for ${name}`);
    return Promise.resolve(cached as unknown as FormObj);
  }

  return new Promise<FormObj | undefined>((resolve) => {
    const createTask = (attempt: number): (() => void) => {
      return () => {
        const cachedNow = formResponseCache.get(key);
        if (cachedNow !== undefined) {
          console.log(`fetchFormWithLimit resolved: From cache for ${name}`);
          resolve(cachedNow as unknown as FormObj);
          activeCount--;
          runNext();
          return;
        }

        fetch(inputUrl)
          .then(async (res) => {
            if (!res.ok) {
              resolve(undefined);
              return;
            }

            let jsonData: unknown;
            try {
              jsonData = await res.json(); // if this throws, we retry below
            } catch (_err) {
              // JSON parsing failed – propagate to catch for retry
              throw _err;
            }

            const hasFormData =
              jsonData &&
              typeof jsonData === "object" &&
              Array.isArray((jsonData as { form?: unknown[] }).form) &&
              (jsonData as { form?: unknown[] }).form!.length > 0;

            const formData = hasFormData ? (jsonData as FormObj) : undefined;

            if (formData) {
              formResponseCache.set(key, formData);
            }

            console.log(
              `fetchFormWithLimit resolved: Attempt ${attempt + 1} for ${name}`,
            );
            resolve(formData as unknown as FormObj);
          })
          .catch(() => {
            // Fetch error or invalid JSON: re-queue up to 10 times with exponential backoff
            if (attempt < 3) {
              const delay = BASE_RETRY_DELAY_MS * attempt;
              setTimeout(() => {
                queue.push(createTask(attempt + 1));
                runNext();
              }, delay);
            } else {
              console.log(
                `fetchFormWithLimit resolved: UNSUCCESSFUL for ${name}`,
              );
              resolve(undefined);
            }
          })
          .finally(() => {
            activeCount--;
            runNext();
          });
      };
    };

    const initialTask = createTask(0);
    queue.push(initialTask);
    runNext();
  });
}

export function getFormFetchQueueLength(): number {
  return queue.length;
}

export function getFormFetchActiveCount(): number {
  return activeCount;
}

export function getFormResponseCacheSnapshot(): Record<string, FormObj> {
  return Object.fromEntries(formResponseCache.entries());
}

export function hydrateFormResponseCache(
  data: Record<string, FormObj> | null | undefined,
): void {
  if (!data || typeof data !== "object") return;
  for (const [key, value] of Object.entries(data)) {
    formResponseCache.set(key, value);
  }
}

export async function loadFormCache(date: string): Promise<void> {
  try {
    console.log("🔍 Loading form cache for date:", date);
    const res = await fetch(`/api/forms?date=${date}`);
    if (!res.ok) {
      console.log("❌ Failed to load form cache:", res.status);
      return;
    }
    const data = await res.json();
    if (data) {
      console.log("✅ Hydrating formResponseCache from dated cache", data);
      console.log("✅ FORM CACHE PREVIOUS LENGTH", Object.keys(data).length);
      hydrateFormResponseCache(data);
    } else {
      console.log("ℹ️ No existing form cache file for date:", date);
    }
  } catch (err) {
    console.error("❌ Error loading form cache:", err);
  }
}

export async function saveFormCache(date: string): Promise<void> {
  try {
    const cacheSnapshot = getFormResponseCacheSnapshot();
    const keys = Object.keys(cacheSnapshot || {});

    if (!keys.length) {
      console.log("ℹ️ No form cache to save for date:", date);
      return;
    }

    console.log(
      `💾 Saving formResponseCache with ${keys.length} entries for date: ${date}`,
    );

    console.log(
      "✅ FORM CACHE POST SAVE LENGTH",
      Object.keys(cacheSnapshot).length,
    );
    await fetch(`/api/forms?date=${date}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cacheSnapshot),
    });
  } catch (err) {
    console.error("❌ Failed to save form cache:", err);
  }
}
