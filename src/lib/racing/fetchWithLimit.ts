import { FormObj } from "@/types/raceday";

const MAX_CONCURRENT = 2;
let activeCount = 0;
const queue: Array<() => void> = [];

const formResponseCache = new Map<string, FormObj>();

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

export function fetchFormWithLimit(
  inputUrl: string,
): Promise<FormObj | undefined> {
  const key = cacheKey(inputUrl);

  const cached = formResponseCache.get(key);
  if (cached !== undefined) {
    console.log(
      "fetchWithLimits: Cache hit for key:",
      key,
      "| inputUrl:",
      inputUrl,
    );
    return Promise.resolve(cached as unknown as FormObj);
  }

  return new Promise<FormObj | undefined>((resolve) => {
    const task = () => {
      const cachedNow = formResponseCache.get(key);
      if (cachedNow !== undefined) {
        activeCount--;
        runNext();
        resolve(cachedNow as unknown as FormObj);
        return;
      }
      console.log(
        "fetchWithLimits: Fetching URL:",
        inputUrl,
        "| Running tasks:",
        activeCount + 1,
        "| Queue length:",
        queue.length,
      );
      fetch(inputUrl)
        .then(async (res) => {
          if (res.ok) {
            const jsonData = await res.json();
            const formData =
              jsonData && jsonData?.form?.length > 0 ? jsonData : undefined;
            if (formData) {
              formResponseCache.set(key, formData);
              console.log(
                "fetchWithLimits: Fetched and cached form data for key:",
                key,
                "| URL:",
                inputUrl,
                "| Entries:",
                jsonData?.form?.length,
              );
            } else {
              console.log(
                "fetchWithLimits: No valid form data returned for key:",
                key,
                "| URL:",
                inputUrl,
              );
            }
            resolve(formData as unknown as FormObj);
          } else {
            console.log(
              "fetchWithLimits: Failed to fetch (HTTP not ok) for key:",
              key,
              "| URL:",
              inputUrl,
              "| Status:",
              res.status,
            );
            resolve(undefined);
          }
        })
        .catch((err) => {
          console.log(
            "fetchWithLimits: Fetch error for key:",
            key,
            "| URL:",
            inputUrl,
            "| Error:",
            err,
          );
          resolve(undefined);
        })
        .finally(() => {
          activeCount--;
          runNext();
        });
    };
    queue.push(task);
    runNext();
  });
}
