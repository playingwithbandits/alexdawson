"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Dice6 } from "lucide-react";
import { Card } from "@/components/card/Card";
import { useGameStore } from "@/store/gameStore";
import { CoinFlipper } from "@/components/card/CoinFlipper";
import { RandomNumberGenerator } from "@/components/card/RandomNumberGenerator";
import { ShotGenerator } from "@/components/card/ShotGenerator";
import { CocktailGenerator } from "@/components/card/CocktailGenerator";
import { CardPicker } from "@/components/card/CardPicker";

export function GamePageClient() {
  const {
    cards,
    currentCard,
    cardHistory,
    drawCard,
    resetGame,
    isInitialized,
  } = useGameStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isGambleMenuOpen, setIsGambleMenuOpen] = useState(false);

  useEffect(() => {
    // Wait for hydration and check if we need to initialize

    console.log("isInitialized", isInitialized);
    setIsLoading(false);
  }, [isInitialized, resetGame]);

  const handleDrawCard = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    // Allow animation to complete before updating state
    setTimeout(() => {
      drawCard();
      setIsAnimating(false);
    }, 600);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[url('/images/background.jpg')] bg-cover bg-center bg-no-repeat text-white">
        <div className="flex justify-center items-center min-h-[600px]">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[url('/images/background.jpg')] bg-cover bg-center p-0">
      <div className="min-h-screen bg-black/50">
        {/* Dark overlay for better readability */}
        <div className="container">
          {/* Header area with title and gamble button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Pussy</h1>

            {/* Gamble Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsGambleMenuOpen(!isGambleMenuOpen)}
                className="flex items-center gap-2 px-6 py-3 text-lg font-bold
                      border-2 border-[#442195] bg-[#030a38] hover:bg-[#0a1550]
                      text-white rounded-lg transition-colors duration-200
                      shadow-lg active:transform active:scale-95"
              >
                <Dice6 className="w-5 h-5" />
                Gamble
                {isGambleMenuOpen ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              <AnimatePresence>
                {isGambleMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-4xl p-6
                          bg-[#030a38]/95 border-2 border-[#442195] 
                          rounded-lg shadow-xl backdrop-blur-sm z-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="p-4 border border-[#442195]/30 rounded-lg">
                        <h3 className="text-white font-bold mb-4">
                          Random Number
                        </h3>
                        <RandomNumberGenerator />
                      </div>
                      <div className="p-4 border border-[#442195]/30 rounded-lg">
                        <h3 className="text-white font-bold mb-4">Coin Flip</h3>
                        <CoinFlipper />
                      </div>
                      <div className="p-4 border border-[#442195]/30 rounded-lg">
                        <h3 className="text-white font-bold mb-4">
                          Shot Roulette
                        </h3>
                        <ShotGenerator />
                      </div>
                      <div className="p-4 border border-[#442195]/30 rounded-lg">
                        <h3 className="text-white font-bold mb-4">
                          Cocktail Builder
                        </h3>
                        <CocktailGenerator />
                      </div>
                      <div className="p-4 border border-[#442195]/30 rounded-lg">
                        <h3 className="text-white font-bold mb-4">
                          Playing Cards
                        </h3>
                        <CardPicker />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Collapsible Card History - Now uses absolute positioning */}
          <div className="relative z-10">
            <button
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="w-full flex items-center justify-between text-white text-xl p-4
                    border-2 border-[#442195] bg-[#030a38] hover:bg-[#0a1550]
                    rounded-lg transition-colors duration-200"
            >
              <span>
                Previously Played Cards{" "}
                {cardHistory.length > 0 && `(${cardHistory.length})`}
              </span>
              {isHistoryExpanded ? (
                <ChevronUp className="w-8 h-8" />
              ) : (
                <ChevronDown className="w-8 h-8" />
              )}
            </button>

            <AnimatePresence>
              {isHistoryExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute w-full overflow-hidden bg-[#030931]/80 border-2 border-t-0 border-[#442195]
                        rounded-b-lg shadow-xl backdrop-blur-sm"
                >
                  <div className="flex gap-2 overflow-x-auto py-8 px-8 max-h-[360px]">
                    <div className="flex flex-wrap gap-4 justify-center content-start min-w-full">
                      {cardHistory.length === 0 ? (
                        <div className="text-white/60 italic">
                          No cards played yet
                        </div>
                      ) : (
                        cardHistory.map((card, index) => (
                          <div
                            key={`history-${index}`}
                            className="transform scale-75 origin-top relative"
                          >
                            {/* Play order number */}
                            <div
                              className="absolute -top-4 left-1/2 -translate-x-1/2 z-10
                                  bg-[#442195] text-white px-3 py-1 rounded-full
                                  font-bold shadow-lg border border-white/20"
                            >
                              #{cardHistory.length - index}
                            </div>
                            <Card card={card} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Game content - Now starts immediately after the history button */}
          <div className="relative min-h-[600px] mt-8 z-0">
            {/* Deck of cards */}
            <div className="hidden lg:block absolute top-0 left-0">
              <div className="relative">
                {[...Array(Math.min(3, cards.length))].map((_, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      top: `${i * 8}px`,
                      left: `${i * 8}px`,
                    }}
                  >
                    <Card card={cards[0]} isBack />
                  </div>
                ))}
                {/* Cards remaining counter - positioned in middle top of the stack */}
                {/* <div className="absolute inset-x-0 w-60  top-8 flex items-center justify-center">
                      <div className="text-white font-bold text-xl shadow-sm">
                        {cards.length} Cards
                      </div>
                    </div> */}
              </div>
            </div>

            {/* Current card area */}
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative w-64 h-96 mb-8">
                <AnimatePresence mode="wait">
                  {isAnimating && cards[0] && (
                    <motion.div
                      key="drawing-card"
                      initial={{
                        x: -400,
                        y: 0,
                        rotateY: 0,
                        opacity: 1,
                      }}
                      animate={{
                        x: 0,
                        y: 0,
                        rotateY: 360,
                        opacity: 1,
                        transition: {
                          duration: 0.6,
                          ease: "easeInOut",
                        },
                      }}
                      style={{
                        perspective: 1000,
                        transformStyle: "preserve-3d",
                      }}
                      className="absolute inset-0"
                    >
                      <div className="relative w-full h-full preserve-3d">
                        {/* Back of card - only visible when rotateY is 0-90 degrees */}
                        <motion.div
                          className="absolute w-full h-full backface-hidden"
                          initial={{ opacity: 1 }}
                          animate={{
                            opacity: 1,
                            transition: { duration: 0.3 },
                          }}
                        >
                          <Card card={cards[0]} isBack />
                        </motion.div>
                        {/* Front of card - only visible when rotateY is 90-180 degrees */}
                        <motion.div
                          className="absolute w-full h-full backface-hidden rotate-y-180"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: 1,
                            transition: {
                              duration: 0.3,
                              delay: 0.3,
                            },
                          }}
                        >
                          <Card card={cards[0]} />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                  {currentCard && !isAnimating && (
                    <motion.div
                      key="current-card"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0"
                    >
                      <Card card={currentCard} />
                    </motion.div>
                  )}
                  {!currentCard && !isAnimating && (
                    <div className="text-xl text-center text-white">
                      Press Draw to start the game!
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleDrawCard}
                className="px-8 py-4 text-xl font-bold min-w-[200px]
                  border-2 border-[#442195] bg-[#030a38] hover:bg-[#0a1550]
                  text-white rounded-lg transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-lg active:transform active:scale-95"
                disabled={cards.length === 0 || isAnimating}
              >
                {cards.length === 0 ? "Game Over" : "Draw Card"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
