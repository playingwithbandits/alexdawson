"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function RandomNumberGenerator() {
  const [maxNumber, setMaxNumber] = useState<number>(6);
  const [result, setResult] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNumber = () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setResult(null);

    // Generate random numbers for animation
    const duration = 1000; // 1 second
    const interval = 50; // Show new number every 50ms
    const iterations = duration / interval;
    let count = 0;

    const animationInterval = setInterval(() => {
      const tempResult = Math.floor(Math.random() * maxNumber) + 1;
      setResult(tempResult);
      count++;

      if (count >= iterations) {
        clearInterval(animationInterval);
        // Final result
        const finalResult = Math.floor(Math.random() * maxNumber) + 1;
        setResult(finalResult);
        setIsGenerating(false);
      }
    }, interval);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <input
          type="number"
          min="1"
          max="999"
          value={maxNumber}
          onChange={(e) =>
            setMaxNumber(Math.max(1, parseInt(e.target.value) || 1))
          }
          className="w-30 px-3 py-2 bg-[#030a38] border-2 border-[#442195] 
            rounded-lg text-white text-center focus:outline-none focus:border-[#5627c0]"
        />
        <button
          onClick={generateNumber}
          disabled={isGenerating}
          className="px-6 py-2 text-lg font-bold
            border-2 border-[#442195] bg-[#030a38] hover:bg-[#0a1550]
            text-white rounded-lg transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg active:transform active:scale-95"
        >
          Roll
        </button>
      </div>
      <AnimatePresence mode="wait">
        {result !== null && (
          <motion.div
            key={result}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="h-16 w-16 flex items-center justify-center
              bg-[#442195] rounded-lg border-2 border-[#030a38]
              text-white text-2xl font-bold shadow-lg"
          >
            {result}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
