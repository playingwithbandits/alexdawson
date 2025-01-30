import { Overview } from "@/components/horse/Overview";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Horse Racing Predictor",
  description: "AI Horse Racing Predictor",
};
export default function HorsePage() {
  return <Overview />;
}
