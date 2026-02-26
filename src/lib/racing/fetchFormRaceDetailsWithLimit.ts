import { string } from "@/types/raceday";

const MAX_CONCURRENT = 3;
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
    return Promise.resolve(cached as unknown as string);
  }

  return new Promise<string | undefined>((resolve) => {
    const createTask = (attempt: number): (() => void) => {
      return () => {
        const cachedNow = formRaceDetailsResponseCache.get(key);
        if (cachedNow !== undefined) {
          activeCount--;
          runNext();
          console.log(
            `fetchFormRaceDetailsWithLimit resolved: From cache for ${name}`,
          );
          resolve(cachedNow as unknown as string);
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
            if (attempt < 10) {
              queue.push(createTask(attempt + 1));
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
