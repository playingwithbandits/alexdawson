import { Metadata } from "next";
import { HorsePageClient } from "./HorsePageClient";

export const metadata: Metadata = {
  title: "AI Horse Racing Predictor",
  description: "AI-powered horse racing predictions",
};

interface PageProps {
  params: {
    date: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function Page({ params }: PageProps) {
  const date = params.date;
  const validatedDate = await Promise.resolve(date);
  return <HorsePageClient date={validatedDate} />;
}
