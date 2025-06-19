import { RaceDay } from "@/components/horse2/RaceDay";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Horse Racing Predictor",
  description: "AI-powered horse racing predictions",
};

interface PageProps {
  params: {
    date: string;
  };
}

export default async function Page({ params }: PageProps) {
  const date = params.date;
  const validatedDate = await Promise.resolve(date);
  return <RaceDay date={validatedDate} />;
}
