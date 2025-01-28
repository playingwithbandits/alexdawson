"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SUITS = ["♠️", "♥️", "♣️", "♦️"] as const;
const VALUES = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
] as const;

export function CardPicker() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [card, setCard] = useState<{
    suit: (typeof SUITS)[number];
    value: (typeof VALUES)[number];
  } | null>(null);

  const pickCard = () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setCard(null);

    // Animate through random cards
    const duration = 1000; // 1 second
    const interval = 50; // Show new card every 50ms
    const iterations = duration / interval;
    let count = 0;

    const animationInterval = setInterval(() => {
      const tempSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
      const tempValue = VALUES[Math.floor(Math.random() * VALUES.length)];
      setCard({ suit: tempSuit, value: tempValue });
      count++;

      if (count >= iterations) {
        clearInterval(animationInterval);
        // Final card
        const finalSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
        const finalValue = VALUES[Math.floor(Math.random() * VALUES.length)];
        setCard({ suit: finalSuit, value: finalValue });
        setIsGenerating(false);
      }
    }, interval);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={pickCard}
        disabled={isGenerating}
        className="px-6 py-2 text-lg font-bold
          border-2 border-[#442195] bg-[#030a38] hover:bg-[#0a1550]
          text-white rounded-lg transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg active:transform active:scale-95"
      >
        Pick a Card
      </button>

      <AnimatePresence mode="wait">
        {card && (
          <motion.div
            key={`${card.value}${card.suit}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className={`w-24 h-36 flex items-center justify-center
              bg-white rounded-lg border-2 border-[#030a38] shadow-lg
              ${
                card.suit === "♥️" || card.suit === "♦️"
                  ? "text-red-600"
                  : "text-black"
              }`}
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">{card.value}</span>
              <span className="text-4xl">{card.suit}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
