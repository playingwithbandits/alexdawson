import { Metadata } from "next";
import { RacingPostClient } from "./RacingPostClient";

export const metadata: Metadata = {
  title: "Racing Post Scraper",
  description: "Racing Post data scraping tool",
};

export default function RacingPostPage() {
  return <RacingPostClient date="2025-01-31" />;
}
