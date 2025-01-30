import { Metadata } from "next";
import { HorsePageClient } from "./HorsePageClient";

export const metadata: Metadata = {
  title: "AI Horse Racing Predictor",
  description: "AI-powered horse racing predictions",
};

export default async function HorsePage({
  params: { date },
}: {
  params: { date: string };
}) {
  const validatedDate = await Promise.resolve(date);
  return <HorsePageClient date={validatedDate} />;
}
