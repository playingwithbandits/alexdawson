"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ExpansionContextType {
  expandAll: boolean;
  toggleExpandAll: () => void;
}

const ExpansionContext = createContext<ExpansionContextType | undefined>(
  undefined
);

export function ExpansionProvider({ children }: { children: ReactNode }) {
  const [expandAll, setExpandAll] = useState(false);

  const toggleExpandAll = () => {
    setExpandAll((prev) => !prev);
  };

  return (
    <ExpansionContext.Provider value={{ expandAll, toggleExpandAll }}>
      {children}
    </ExpansionContext.Provider>
  );
}

export function useExpansion() {
  const context = useContext(ExpansionContext);
  if (context === undefined) {
    throw new Error("useExpansion must be used within an ExpansionProvider");
  }
  return context;
}
