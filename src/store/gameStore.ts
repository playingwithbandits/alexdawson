import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Card } from "@/types/game";
import { cards as initialCards } from "@/data/cards";

interface GameState {
  cards: Card[];
  currentCard: Card | null;
  cardHistory: Card[];
  drawCard: () => void;
  resetGame: () => void;
  isInitialized: boolean;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      cards: [],
      currentCard: null,
      cardHistory: [],
      isInitialized: false,
      drawCard: () => {
        const { cards, currentCard, cardHistory } = get();
        if (cards.length === 0) return;

        const newCard = cards[0];
        const remainingCards = cards.slice(1);

        const newHistory = currentCard
          ? [currentCard, ...cardHistory]
          : cardHistory;

        set({
          currentCard: newCard,
          cards: remainingCards,
          cardHistory: newHistory,
        });
      },
      resetGame: () => {
        const shuffledCards = [...initialCards].sort(() => Math.random() - 0.5);
        set({
          cards: shuffledCards,
          currentCard: null,
          cardHistory: [],
          isInitialized: true,
        });
      },
    }),
    {
      name: "game-storage",
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (!state || !state.isInitialized) {
          useGameStore.getState().resetGame();
        }
      },
    }
  )
);
