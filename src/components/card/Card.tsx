import { Card as CardType } from "@/types/game";
import Image from "next/image";
import { useState } from "react";

interface CardProps {
  card: CardType;
  isBack?: boolean;
  className?: string;
}

const getCategoryColor = (category: CardType["category"]) => {
  switch (category) {
    case "wildcard":
      return "bg-violet-600";
    case "truth":
      return "bg-blue-600";
    case "dare":
      return "bg-red-600";
    case "curse":
      return "bg-emerald-600";
    case "battle":
      return "bg-orange-600";
    case "gamble":
      return "bg-yellow-600";
    case "would-you-rather":
      return "bg-pink-600";
    case "never-have-i":
      return "bg-green-600";
    case "challenge":
      return "bg-amber-600";
    case "paranoia":
      return "bg-fuchsia-600";
    case "confession":
      return "bg-indigo-600";
    case "debate":
      return "bg-lime-600";
    case "trivia":
      return "bg-cyan-600";
    case "rule-maker":
      return "bg-rose-600";
    case "group-task":
      return "bg-teal-600";
    default:
      return "bg-gray-600";
  }
};

const getPenaltyImage = (penaltyCost: number) => {
  return `/images/shot${penaltyCost}.png`;
};

export function Card({ card, isBack = false, className = "" }: CardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Split description into question and answer if it contains "(Answer: "
  const hasAnswer = card.description.includes("(Answer: ");
  const [question, answer] = hasAnswer
    ? card.description.split("(Answer: ")
    : [card.description, null];

  // Clean up the answer by removing the closing parenthesis
  const cleanAnswer = answer?.replace(")", "");

  if (isBack) {
    return (
      <div
        className={`w-64 h-96 rounded-xl shadow-lg flex items-center justify-center text-white bg-[url('/images/cardbackground.jpg')] bg-cover bg-center border border-[#442195] ${className}`}
      >
        {/* <span className="transform rotate-90 text-2xl font-bold">
          CARD GAME
        </span> */}
      </div>
    );
  }

  const penaltyImage = getPenaltyImage(card.penaltyCost);

  return (
    <div
      className={`w-64 h-96 rounded-xl shadow-lg flex flex-col overflow-hidden border border-[#442195] bg-[#442195] ${className}`}
    >
      {/* Header section */}
      <div
        className={`px-4 py-2 flex justify-between items-center relative ${getCategoryColor(
          card.category
        )} text-white`}
      >
        <div className="text-sm  pt-1">{card.category.toUpperCase()}</div>
        {card.penaltyCost && penaltyImage ? (
          <div className="h-16 w-16 absolute top-2 right-4 z-[1]">
            <Image
              src={penaltyImage}
              alt={`Penalty: ${card.penaltyCost}`}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <></>
        )}
      </div>

      {/* Image section */}
      {card.image && (
        <div className="w-full h-32 relative z-[0]">
          <Image
            src={`/images/${card.image}.jpg`}
            alt={"Missing image"}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Description section */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center text-center bg-[#030a38] text-[#fbfbf9]">
        <p className="text-md">{question}</p>
        {hasAnswer && (
          <div className="mt-2">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="text-sm px-3 py-1 rounded bg-[#442195] hover:bg-[#562bb5] transition-colors"
            >
              {showAnswer ? "Hide Answer" : "Show Answer"}
            </button>
            {showAnswer && (
              <p className="mt-2 text-md font-semibold text-yellow-400">
                {cleanAnswer}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
