import { Metadata } from "next";
import { HorsePageClient } from "./HorsePageClient";

export const metadata: Metadata = {
  title: "Horse Racing Predictor",
  description: "Horse Racing Predictor",
};
export default function HorsePage() {
  return <HorsePageClient />;
}
