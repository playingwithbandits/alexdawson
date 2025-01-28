"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";

interface Ingredient {
  name: string;
  enabled: boolean;
}

type IngredientCategory =
  | "spirits"
  | "mixers"
  | "liqueurs"
  | "extras"
  | "garnishes";

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Record<IngredientCategory, Ingredient[]>;
  toggleIngredient: (category: IngredientCategory, index: number) => void;
}

export function IngredientModal({
  isOpen,
  onClose,
  ingredients,
  toggleIngredient,
}: IngredientModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 top-0 bottom-0 overflow-auto bg-black/80 backdrop-blur-sm flex items-start justify-center z-[100]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-[#030a38] w-full min-h-screen p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Edit Ingredients</h2>
            <button
              onClick={onClose}
              className="px-6 py-2 text-lg font-bold
                border-2 border-[#442195] bg-[#0a1550] hover:bg-[#030a38]
                text-white rounded-lg transition-colors duration-200"
            >
              Done
            </button>
          </div>

          <div className="space-y-8">
            {Object.entries(ingredients).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-white font-bold text-xl mb-4 capitalize">
                  {category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {items.map((item, index) => (
                    <label
                      key={item.name}
                      className="flex items-center gap-3 text-white cursor-pointer
                        hover:bg-white/10 p-3 rounded-lg transition-colors
                        border border-[#442195]/30"
                    >
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() =>
                          toggleIngredient(
                            category as IngredientCategory,
                            index
                          )
                        }
                        className="w-5 h-5 rounded border-[#442195]"
                      />
                      <span>{item.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
