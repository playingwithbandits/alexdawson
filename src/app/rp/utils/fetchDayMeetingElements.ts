import { placeToPlaceKey } from "@/lib/racing/scores/funcs";
import { IRISH_COURSES, UK_COURSES } from "@/types/courses";

const dayMeetingElementsCache = new Map<string, Element[]>();

const DAY_MEETING_MAX_CONCURRENT = 3;
const DAY_MEETING_BASE_RETRY_DELAY_MS = 500;

let dayMeetingActiveCount = 0;
const dayMeetingQueue: Array<() => void> = [];

function dayMeetingRunNext(): void {
  if (dayMeetingActiveCount >= DAY_MEETING_MAX_CONCURRENT) return;
  const next = dayMeetingQueue.shift();
  if (!next) return;
  dayMeetingActiveCount++;
  next();
}

function getPageUrl(date: string) {
  return `https://www.racingpost.com/racecards/${date}/`;
}

function parseMeetingElements(html: string, courseFilter?: string): Element[] {
  if (!html) {
    return [];
  }
  console.log("📄 Received HTML response");
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const meetingElements = doc.querySelectorAll(
    ".ui-accordion__row:not(:has(.ui-accordion__header.RC-accordion__header_abandoned))",
  );
  console.log("🏁 Found meeting elements:", meetingElements.length);

  const meetingElementsArr = Array.from(meetingElements).filter((element) => {
    const courseName = placeToPlaceKey(
      element
        .querySelector(".RC-accordion__courseName")
        ?.textContent?.toLowerCase()
        .replace(/\s*\([^)]*\)\s*/g, "") // Remove anything in parentheses
        .trim() || "",
    );

    const ukCourseKeys = UK_COURSES.map((course) => placeToPlaceKey(course));
    const irishCourseKeys = IRISH_COURSES.map((course) =>
      placeToPlaceKey(course),
    );
    const isUkCourse = courseName && ukCourseKeys.includes(courseName);

    if (courseFilter) {
      return placeToPlaceKey(courseName) === placeToPlaceKey(courseFilter);
    }

    return isUkCourse; //|| irishCourseKeys.includes(courseName); // TODO: Uncomment this when we have Irish courses back
  });
  return meetingElementsArr;
}

function serializeElementsMap(
  cache: Map<string, Element[]>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, elements] of cache.entries()) {
    result[key] = elements.map((el) => el.outerHTML);
  }
  return result;
}

function deserializeElementsMap(
  data: Record<string, string[]>,
): Map<string, Element[]> {
  const parser = new DOMParser();
  const result = new Map<string, Element[]>();

  for (const [key, htmlList] of Object.entries(data)) {
    if (!Array.isArray(htmlList)) continue;
    const elements: Element[] = [];
    for (const html of htmlList) {
      if (!html) continue;
      const doc = parser.parseFromString(html, "text/html");
      const el = doc.body.firstElementChild;
      if (el) {
        elements.push(el);
      }
    }
    result.set(key, elements);
  }

  return result;
}

export function getDayMeetingElementsCacheSnapshot(): Record<string, string[]> {
  return serializeElementsMap(dayMeetingElementsCache);
}

export function hydrateDayMeetingElementsCache(
  data: Record<string, string[]> | null | undefined,
): void {
  if (!data || typeof data !== "object") return;
  const map = deserializeElementsMap(data);
  for (const [key, elements] of map.entries()) {
    dayMeetingElementsCache.set(key, elements);
  }
}

export async function loadDayMeetingElementsCache(date: string): Promise<void> {
  try {
    console.log("🔍 Loading day meeting elements cache for date:", date);
    const res = await fetch(`/api/dayMeetingElements?date=${date}`);

    if (!res.ok) {
      console.log(
        "❌ Failed to load day meeting elements cache:",
        res.status,
        res.statusText,
      );
      return;
    }

    const data = (await res.json()) as Record<string, string[]> | null;

    if (data) {
      console.log(
        "✅ Hydrating dayMeetingElementsCache from dated cache",
        Object.keys(data).length,
      );

      console.log(
        "✅ DAY MEETING ELEMENTS CACHE PREVIOUS LENGTH",
        Object.keys(data).length,
      );
      hydrateDayMeetingElementsCache(data);
    } else {
      console.log(
        "ℹ️ No existing day meeting elements cache file for date:",
        date,
      );
    }
  } catch (error) {
    console.error("❌ Error loading day meeting elements cache:", error);
  }
}

export async function saveDayMeetingElementsCache(date: string): Promise<void> {
  try {
    const cacheSnapshot = getDayMeetingElementsCacheSnapshot();
    const keys = Object.keys(cacheSnapshot || {});

    if (!keys.length) {
      console.log("ℹ️ No day meeting elements cache to save for date:", date);
      return;
    }

    console.log(
      `💾 Saving dayMeetingElementsCache with ${keys.length} entries for date: ${date}`,
    );

    console.log(
      "✅ DAY MEETING ELEMENTS CACHE POST SAVE LENGTH",
      Object.keys(cacheSnapshot).length,
    );

    await fetch(`/api/dayMeetingElements?date=${date}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cacheSnapshot),
    });
  } catch (error) {
    console.error("❌ Failed to save day meeting elements cache:", error);
  }
}

export async function fetchDayMeetingElements(
  date: string,
  courseFilter?: string,
): Promise<Element[]> {
  const pageUrl = getPageUrl(date);
  const cached = dayMeetingElementsCache.get(pageUrl);
  if (cached) {
    console.log(
      `✅ fetchDayMeetingElements resolved from cache for pageUrl=${pageUrl}`,
    );
    return cached;
  }

  return new Promise<Element[]>((resolve) => {
    const createTask = (attempt: number): (() => void) => {
      return () => {
        const cachedNow = dayMeetingElementsCache.get(pageUrl);
        if (cachedNow) {
          console.log(
            `✅ fetchDayMeetingElements resolved from cache for pageUrl=${pageUrl}`,
          );
          resolve(cachedNow);
          return;
        }

        fetch(
          `/getP.php?q=${encodeURIComponent(`https://alexdawson.co.uk/getP.php?q=${pageUrl}`)}`,
        )
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(
                `Failed to fetch day meeting elements, status ${response.status}`,
              );
            }

            const htmlRes = await response.text();
            const retryParser = new DOMParser();
            const doc = retryParser.parseFromString(htmlRes || "", "text/html");

            if (doc.querySelector(".ui-accordion__row")) {
              const meetingElements = parseMeetingElements(
                htmlRes,
                courseFilter,
              );
              dayMeetingElementsCache.set(pageUrl, meetingElements);
              resolve(meetingElements);
              return;
            }

            if (attempt < 5) {
              const delay = DAY_MEETING_BASE_RETRY_DELAY_MS * attempt;
              setTimeout(() => {
                dayMeetingQueue.push(createTask(attempt + 1));
                dayMeetingRunNext();
              }, delay);
            } else {
              console.log(
                `fetchDayMeetingElements resolved: UNSUCCESSFUL for pageUrl=${pageUrl}`,
              );
              resolve([]);
            }
          })
          .catch((_error) => {
            if (attempt < 5) {
              const delay = DAY_MEETING_BASE_RETRY_DELAY_MS * attempt;
              setTimeout(() => {
                dayMeetingQueue.push(createTask(attempt + 1));
                dayMeetingRunNext();
              }, delay);
            } else {
              console.error(
                "Failed to fetch day meeting elements after retries",
                _error,
              );
              resolve([]);
            }
          })
          .finally(() => {
            dayMeetingActiveCount--;
            dayMeetingRunNext();
          });
      };
    };

    const initialTask = createTask(0);
    dayMeetingQueue.push(initialTask);
    dayMeetingRunNext();
  });
}
