"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import { IngredientModal } from "./IngredientModal";

// Move ingredients to objects with enabled state
interface Ingredient {
  name: string;
  enabled: boolean;
}

const createIngredientList = (items: string[]): Ingredient[] =>
  items.map((name) => ({ name, enabled: true }));

const SPIRITS = createIngredientList([
  "Vodka",
  "Gin",
  "Rum",
  "Tequila",
  "Whiskey",
  "Brandy",
  "Group Choice",
  "None",
  "Own choice",
]);

const MIXERS = createIngredientList([
  "Cola",
  "Tonic",
  "Soda Water",
  "Ginger Beer",
  "Lemonade",
  "Orange Juice",
  "Cranberry Juice",
  "Pineapple Juice",
  "Apple Juice",
  "Ginger Ale",
  "Sprite",
  "Red Bull",
  "Group Choice",
  "None",
  "Own choice",
]);

const LIQUEURS = createIngredientList([
  "Triple Sec",
  "Baileys",
  "Advocaat",
  "Pimms",
  "Aperol",
  "Amaretto",
  "Cointreau",
  "Chambord",
  "Malibu",
  "Peach Schnapps",
  "Blue Curacao",
  "Limoncello",
  "Sourz",
  "Prosecco",
  "Group Choice",
  "None",
  "Own choice",
]);

const EXTRAS = createIngredientList([
  "Bitters",
  "Lime Juice",
  "Lemon Juice",
  "Sugar Syrup",
  "Grenadine",
  "Cream",
  "Egg White",
  "Tabasco",
  "Ketchup",
  "Mayonnaise",
  "Whipped Cream",
  "Worcestershire Sauce",
  "Honey",
  "Absinthe",
  "Group Choice",
  "None",
  "Own choice",
]);

const GARNISHES = createIngredientList([
  "Banana",
  "Olive",
  "Beans",
  "Sweets",
  "Apple",
  "Lemon Wedge",
  "Lime Wedge",
  "Orange Slice",
  "Cherry",
  "Mint Sprig",
  "Salt Rim",
  "Sugar Rim",
  "Cucumber",
  "Group Choice",
  "None",
  "Own choice",
]);

interface CocktailStep {
  label: string;
  result: string;
}

export function CocktailGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState<CocktailStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [ingredients, setIngredients] = useState({
    spirits: SPIRITS,
    mixers: MIXERS,
    liqueurs: LIQUEURS,
    extras: EXTRAS,
    garnishes: GARNISHES,
  });

  const getRandomFrom = (items: Ingredient[]) => {
    const enabledItems = items.filter((item) => item.enabled);
    if (enabledItems.length === 0) return "None";
    return enabledItems[Math.floor(Math.random() * enabledItems.length)].name;
  };

  const toggleIngredient = (
    category: keyof typeof ingredients,
    index: number
  ) => {
    setIngredients((prev) => ({
      ...prev,
      [category]: prev[category].map((item, i) =>
        i === index ? { ...item, enabled: !item.enabled } : item
      ),
    }));
  };

  const generateCocktail = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setSteps([]);
    setCurrentStep(0);

    const newSteps: CocktailStep[] = [];

    // Step 1: Shot count
    const shots = Math.random() < 0.5 ? "Single" : "Double";
    newSteps.push({ label: "Base", result: `${shots} Shot` });
    setSteps([...newSteps]);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 2: Spirit
    const spirit = getRandomFrom(ingredients.spirits);
    newSteps.push({ label: "Spirit", result: spirit });
    setSteps([...newSteps]);
    setCurrentStep(1);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 3: Mixer
    const mixer = getRandomFrom(ingredients.mixers);
    newSteps.push({ label: "Mixer", result: mixer });
    setSteps([...newSteps]);
    setCurrentStep(2);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 4: Liqueur
    const liqueur = getRandomFrom(ingredients.liqueurs);
    newSteps.push({ label: "Liqueur", result: liqueur });
    setSteps([...newSteps]);
    setCurrentStep(3);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 5: Extra
    const extra = getRandomFrom(ingredients.extras);
    newSteps.push({ label: "Extra", result: extra });
    setSteps([...newSteps]);
    setCurrentStep(4);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 6: Garnish
    const garnish = getRandomFrom(ingredients.garnishes);
    newSteps.push({ label: "Garnish", result: garnish });
    setSteps([...newSteps]);
    setCurrentStep(5);

    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 w-full">
        <button
          onClick={generateCocktail}
          disabled={isGenerating}
          className="flex-1 px-6 py-2 text-lg font-bold
            border-2 border-[#442195] bg-[#030a38] hover:bg-[#0a1550]
            text-white rounded-lg transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg active:transform active:scale-95"
        >
          Roll for Cocktail
        </button>
        <button
          onClick={() => setIsEditMode(true)}
          className="px-3 py-2 text-lg font-bold
            border-2 border-[#442195] bg-[#030a38] hover:bg-[#0a1550]
            text-white rounded-lg transition-colors duration-200
            shadow-lg active:transform active:scale-95"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        <IngredientModal
          isOpen={isEditMode}
          onClose={() => setIsEditMode(false)}
          ingredients={ingredients}
          toggleIngredient={toggleIngredient}
        />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full space-y-2"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: index <= currentStep ? 1 : 0.5,
                  x: 0,
                }}
                className={`flex justify-between items-center p-2 rounded-lg
                  ${index <= currentStep ? "bg-[#442195]" : "bg-[#442195]/50"}
                  border border-[#030a38] text-white`}
              >
                <span className="font-bold">{step.label}:</span>
                <span className="text-right">{step.result}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
