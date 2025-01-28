"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CoinFlipper() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"heads" | "tails" | null>(null);

  const flipCoin = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);

    // Random number of flips between 5 and 10 for animation
    const flips = 5 + Math.floor(Math.random() * 5);
    const flipDuration = 150; // ms per flip
    const totalDuration = flips * flipDuration;

    // Determine result
    const newResult = Math.random() < 0.5 ? "heads" : "tails";

    // Show result after animation
    setTimeout(() => {
      setResult(newResult);
      setIsFlipping(false);
    }, totalDuration);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={flipCoin}
        disabled={isFlipping}
        className="px-6 py-3 text-lg font-bold
          border-2 border-[#442195] bg-[#030a38] hover:bg-[#0a1550]
          text-white rounded-lg transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg active:transform active:scale-95"
      >
        Flip a Coin
      </button>
      {result || isFlipping ? (
        <>
          <div className="h-24 w-24 relative">
            <AnimatePresence>
              {!isFlipping && result && (
                <motion.div
                  initial={{ rotateX: 180, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: 180, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center
                bg-[#442195] rounded-full border-4 border-[#030a38]
                text-white text-xl font-bold shadow-lg"
                >
                  {result.toUpperCase()}
                </motion.div>
              )}
              {isFlipping && (
                <motion.div
                  animate={{ rotateX: [0, 180, 360] }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 flex items-center justify-center
                bg-[#442195] rounded-full border-4 border-[#030a38]
                text-white text-xl font-bold shadow-lg"
                >
                  ?
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
