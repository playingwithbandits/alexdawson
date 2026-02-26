import { FormObj } from "@/types/raceday";

const MAX_CONCURRENT = 5;
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
  name: string,
): Promise<FormObj | undefined> {
  const key = cacheKey(inputUrl);

  const cached = formResponseCache.get(key);
  if (cached !== undefined) {
    return Promise.resolve(cached as unknown as FormObj);
  }

  return new Promise<FormObj | undefined>((resolve) => {
    const createTask = (attempt: number): (() => void) => {
      return () => {
        const cachedNow = formResponseCache.get(key);
        if (cachedNow !== undefined) {
          activeCount--;
          runNext();
          console.log(`fetchFormWithLimit resolved: From cache for ${name}`);
          resolve(cachedNow as unknown as FormObj);
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

            const formData =
              jsonData &&
              typeof jsonData === "object" &&
              (jsonData as any)?.form?.length > 0
                ? (jsonData as FormObj)
                : undefined;

            if (formData) {
              formResponseCache.set(key, formData);
            }

            console.log(
              `fetchFormWithLimit resolved: Attempt ${attempt + 1} for ${name}`,
            );
            resolve(formData as unknown as FormObj);
          })
          .catch(() => {
            // Fetch error or invalid JSON: re-queue up to 10 times
            if (attempt < 50) {
              queue.push(createTask(attempt + 1));
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
