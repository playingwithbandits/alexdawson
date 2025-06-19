"use client";

import { useState } from "react";
import { Horse as HorseType } from "@/types/racing";
import { Form } from "./Form";

export interface HorseProps {
  horse: HorseType;
}

export const Horse = ({ horse }: HorseProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);

  const getFormDisplay = (form?: string) => {
    if (!form) return "No form data";
    return form.split("").map((char, index) => (
      <span
        key={index}
        className={`inline-block w-6 h-6 text-center text-xs font-medium rounded ${
          char === "1"
            ? "bg-green-900 text-green-300 border border-green-700"
            : char === "2"
            ? "bg-blue-900 text-blue-300 border border-blue-700"
            : char === "3"
            ? "bg-yellow-900 text-yellow-300 border border-yellow-700"
            : char === "0"
            ? "bg-gray-800 text-gray-400 border border-gray-600"
            : "bg-red-900 text-red-300 border border-red-700"
        }`}
      >
        {char}
      </span>
    ));
  };

  return (
    <div className="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
      <div
        className="px-4 py-3 cursor-pointer hover:bg-gray-600 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold text-white min-w-[3rem]">
              {horse.number}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-white">{horse.name}</h4>
              <div className="flex items-center space-x-3 mt-1 text-sm text-gray-400">
                <span>{horse.age}yo</span>
                <span>{horse.weight.display}</span>
                <span>{horse.jockey.name}</span>
                <span>{horse.trainer.name}</span>
                {horse.rating && <span>OR: {horse.rating}</span>}
                {horse.topSpeed && <span>TS: {horse.topSpeed}</span>}
              </div>
              {horse.form && (
                <div className="flex items-center space-x-1 mt-2">
                  <span className="text-xs text-gray-500">Form:</span>
                  {getFormDisplay(horse.form)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {horse.score && (
              <span className="text-sm font-medium text-blue-400">
                Score: {horse.score.total.score.toFixed(1)}
              </span>
            )}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {expanded && horse.formObj && (
        <div className="border-t border-gray-600 bg-gray-600">
          <div className="px-4 py-3">
            <Form formObj={horse.formObj} />
          </div>
        </div>
      )}
    </div>
  );
};
