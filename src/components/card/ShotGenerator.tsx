"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SHOT_OPTIONS = [
  // Non-Alcoholic
  "Water",
  "Orange Juice",
  "Apple Juice",
  "Cranberry Juice",
  "Grape Juice",
  "Lemonade",
  "Coca Cola",
  "Sprite",
  "Ginger Ale",
  "Iced Tea",
  "Energy Drink",
  "Root Beer",

  // Alcoholic
  "Beer",
  "Vodka",
  "Whiskey",
  "Rum",
  "Tequila",
  "Gin",
  "Jägermeister",
  "Fireball",
  "Sambuca",
  "Schnapps",
  "White Wine",
  "Red Wine",
  "Rosé",
  "Champagne",
  "Prosecco",
  "Irish Cream",
  "Kahlua",
  "Bourbon",
  "Scotch",
  "Brandy",

  "Hot Sauce",
  "Soy Sauce",
  "BBQ Sauce",
  "Ketchup",
  "Mayonnaise",
  "Mustard",
  "Worcestershire Sauce",
  "Sweet Chili Sauce",
  "Teriyaki Sauce",
  //   // Mixed Shots
  //   "Jagerbomb",
  //   "B-52",
  //   "Lemon Drop",
  //   "Kamikaze",
  //   "Green Tea Shot",
  //   "Red Headed Slut",
  //   "Irish Car Bomb",
  //   "Snake Bite",
  //   "Prairie Fire",
  //   "Liquid Cocaine",

  //   // Cocktails
  //   "Margarita",
  //   "Mojito",
  //   "Moscow Mule",
  //   "Old Fashioned",
  //   "Martini",
  //   "Cosmopolitan",
  //   "Piña Colada",
  //   "Long Island Iced Tea",
  //   "Bloody Mary",
  //   "Daiquiri",
];

export function ShotGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const generateShot = () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setResult(null);

    // Animate through random options
    const duration = 1000; // 1 second
    const interval = 50; // Show new drink every 50ms
    const iterations = duration / interval;
    let count = 0;

    const animationInterval = setInterval(() => {
      const tempResult =
        SHOT_OPTIONS[Math.floor(Math.random() * SHOT_OPTIONS.length)];
      setResult(tempResult);
      count++;

      if (count >= iterations) {
        clearInterval(animationInterval);
        // Final result
        const finalResult =
          SHOT_OPTIONS[Math.floor(Math.random() * SHOT_OPTIONS.length)];
        setResult(finalResult);
        setIsGenerating(false);
      }
    }, interval);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={generateShot}
        disabled={isGenerating}
        className="px-6 py-2 text-lg font-bold
          border-2 border-[#442195] bg-[#030a38] hover:bg-[#0a1550]
          text-white rounded-lg transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg active:transform active:scale-95"
      >
        Do a Shot
      </button>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="px-4 py-3 bg-[#442195] rounded-lg border-2 border-[#030a38]
              text-white text-center font-bold shadow-lg min-w-[150px]"
          >
            {result}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
