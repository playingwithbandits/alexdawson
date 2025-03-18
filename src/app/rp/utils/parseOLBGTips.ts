interface OLBGTip {
  horse: string;
  course: string;
  time: string;
  tipster: string;
  confidence: string;
  reasoning: string;
}

export async function parseOLBGTips(doc: Document): Promise<OLBGTip[]> {
  const tips: OLBGTip[] = [];

  // Find all tip elements
  const tipElements = doc.querySelectorAll(".tip-item");

  tipElements.forEach((element) => {
    try {
      const horse =
        element.querySelector(".horse-name")?.textContent?.trim() || "";
      const course =
        element.querySelector(".course-name")?.textContent?.trim() || "";
      const time =
        element.querySelector(".race-time")?.textContent?.trim() || "";
      const tipster =
        element.querySelector(".tipster-name")?.textContent?.trim() || "";
      const confidence =
        element.querySelector(".confidence-level")?.textContent?.trim() || "";
      const reasoning =
        element.querySelector(".tip-reasoning")?.textContent?.trim() || "";

      if (horse && course && time) {
        tips.push({
          horse,
          course,
          time,
          tipster,
          confidence,
          reasoning,
        });
      }
    } catch (error) {
      console.error("Error parsing tip element:", error);
    }
  });

  return tips;
}
