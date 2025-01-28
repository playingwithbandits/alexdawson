"use client";

import { Card } from "@/components/card/Card";
import { cards } from "@/data/cards";

export default function GameDebugPage() {
  return (
    <main className="min-h-screen bg-[url('/images/background.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen bg-black/50">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-white mb-8">
            Card Debug View
          </h1>

          <div className="flex flex-wrap gap-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {cards.map((card, index) => (
              <div key={index} className="flex-shrink-0">
                <Card card={card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
