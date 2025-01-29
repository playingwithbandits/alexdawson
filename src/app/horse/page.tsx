import { Overview } from "@/components/horse/Overview";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Horse Racing Predictor",
  description: "Horse Racing Predictor",
};
export default function HorsePage() {
  return <Overview />;
}
