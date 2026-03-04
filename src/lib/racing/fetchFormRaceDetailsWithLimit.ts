const MAX_CONCURRENT = 3;
const BASE_RETRY_DELAY_MS = 500;

let activeCount = 0;
const queue: Array<() => void> = [];

const formRaceDetailsResponseCache = new Map<string, string>();

function cacheKey(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function runNext(): void {
  if (activeCount >= MAX_CONCURRENT) return;
  const next = queue.shift();
  if (!next) return;
  activeCount++;
  next();
}

export function fetchFormRaceDetailsWithLimit(
  inputUrl: string,
  name: string,
): Promise<string | undefined> {
  const key = cacheKey(inputUrl);

  const cached = formRaceDetailsResponseCache.get(key);
  if (cached !== undefined) {
    console.log(
      `fetchFormRaceDetailsWithLimit resolved: From cache for ${name}`,
    );
    return Promise.resolve(cached as unknown as string);
  }

  return new Promise<string | undefined>((resolve) => {
    const createTask = (attempt: number): (() => void) => {
      return () => {
        const cachedNow = formRaceDetailsResponseCache.get(key);
        if (cachedNow !== undefined) {
          console.log(
            `fetchFormRaceDetailsWithLimit resolved: From cache for ${name}`,
          );
          resolve(cachedNow as unknown as string);
          activeCount--;
          runNext();
          return;
        }

        fetch(`/getP.php?q=${encodeURIComponent(inputUrl)}`)
          .then(async (res) => {
            if (!res.ok) {
              resolve(undefined);
              return;
            }
            try {
              const html = await res.text();
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, "text/html");
              const content = doc.querySelector(".rp-resultsWrapper__content");
              const ele = content?.outerHTML || "";
              const doc2: Document | null = parser.parseFromString(
                ele || "",
                "text/html",
              );
              if (doc2.querySelector(".rp-horseTable__table")) {
                // Successfully loaded the correct page
                formRaceDetailsResponseCache.set(key, ele);
                resolve(ele);
              } else {
                resolve(undefined);
              }
            } catch (_err) {
              throw _err;
            }
          })
          .catch(() => {
            // Fetch error or invalid JSON: re-queue up to 10 times
            if (attempt < 5) {
              const delay = BASE_RETRY_DELAY_MS * attempt;
              setTimeout(() => {
                queue.push(createTask(attempt + 1));
                runNext();
              }, delay);
            } else {
              console.log(
                `fetchFormRaceDetailsWithLimit resolved: UNSUCCESSFUL for ${name}`,
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

export function getFormRaceDetailsFetchQueueLength(): number {
  return queue.length;
}

export function getFormRaceDetailsFetchActiveCount(): number {
  return activeCount;
}

export function getFormRaceDetailsResponseCacheSnapshot(): Record<
  string,
  string
> {
  return Object.fromEntries(formRaceDetailsResponseCache.entries());
}

export function hydrateFormRaceDetailsResponseCache(
  data: Record<string, string> | null | undefined,
): void {
  if (!data || typeof data !== "object") return;
  for (const [key, value] of Object.entries(data)) {
    formRaceDetailsResponseCache.set(key, value);
  }
}

/**
 * Load a previously saved Form Race Details cache for a given date
 * and hydrate the in–memory `formRaceDetailsResponseCache`, similar
 * to how `loadFormCache` in `PageClient` works for `FormObj`.
 */
export async function loadFormRaceDetailsCache(date: string): Promise<void> {
  try {
    console.log("🔍 Loading form race details cache for date:", date);
    const res = await fetch(`/api/formRaceDetails?date=${date}`);

    if (!res.ok) {
      console.log(
        "❌ Failed to load form race details cache:",
        res.status,
        res.statusText,
      );
      return;
    }

    const data = (await res.json()) as Record<string, string> | null;

    if (data) {
      console.log(
        "✅ Hydrating formRaceDetailsResponseCache from dated cache",
        Object.keys(data).length,
      );
      console.log(
        "✅ FORM RACE DETAILS CACHE PREVIOUS LENGTH",
        Object.keys(data).length,
      );
      hydrateFormRaceDetailsResponseCache(data);
    } else {
      console.log(
        "ℹ️ No existing form race details cache file for date:",
        date,
      );
    }
  } catch (err) {
    console.error("❌ Error loading form race details cache:", err);
  }
}

export async function saveFormRaceDetailsCache(date: string): Promise<void> {
  try {
    const cacheSnapshot = getFormRaceDetailsResponseCacheSnapshot();
    const keys = Object.keys(cacheSnapshot || {});

    if (!keys.length) {
      console.log("ℹ️ No form race details cache to save for date:", date);
      return;
    }

    console.log(
      `💾 Saving formRaceDetailsResponseCache with ${keys.length} entries for date: ${date}`,
    );

    console.log(
      "✅ FORM RACE DETAILS CACHE POST SAVE LENGTH",
      Object.keys(cacheSnapshot).length,
    );

    await fetch(`/api/formRaceDetails?date=${date}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cacheSnapshot),
    });
  } catch (err) {
    console.error("❌ Failed to save form race details cache:", err);
  }
}
