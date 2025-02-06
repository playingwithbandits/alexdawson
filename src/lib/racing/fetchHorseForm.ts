import { FormObj } from "@/types/racing";

export async function fetchHorseForm(
  profileUrl: string
): Promise<FormObj | undefined> {
  try {
    //console.log("Fetching form for URL:", profileUrl);
    if (!profileUrl) return undefined;

    // Convert profile URL to form URL
    const formUrl =
      profileUrl
        .replace("/profile/horse/", "/profile/tab/horse/")
        .split("#")[0] + "/form";
    //console.log("Converted to form URL:", formUrl);

    const response = await fetch(`/getP.php?q=${encodeURIComponent(formUrl)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const formData = await response.json();
    //console.log("Parsed form data:", formData);
    return formData;
  } catch (error) {
    console.error("Error fetching horse form:", error);
    return undefined;
  }
}
