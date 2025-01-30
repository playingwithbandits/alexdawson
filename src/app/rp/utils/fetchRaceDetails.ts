export async function fetchRaceDetails(url: string): Promise<string> {
  console.log("fetchRaceDetails", url);
  if (!url || url.trim() === "") {
    console.error("❌ No URL provided");
    return "";
  }
  const response = await fetch(`/getP.php?q=${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch race details: ${response.status}`);
  }
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const content = doc.querySelector(".js-RC-mainContent section");
  return content?.outerHTML || "";
}
