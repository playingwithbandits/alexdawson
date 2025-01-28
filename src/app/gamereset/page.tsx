"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";

export default function GameReset() {
  const router = useRouter();
  const { resetGame } = useGameStore();

  useEffect(() => {
    // Clear the game storage
    resetGame();
    // Redirect back to the game page
    router.push("/game");
  }, []);

  return (
    <div>
      <p>Resetting game...</p>
    </div>
  );
}
