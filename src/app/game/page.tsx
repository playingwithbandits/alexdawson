import { Metadata } from "next";
import { GamePageClient } from "./GamePageClient";

export const metadata: Metadata = {
  title: "Pussy - Drinking Card Game",
  description: "Pussy - Drinking Card Game",
};

export default function GamePage() {
  return <GamePageClient />;
}
