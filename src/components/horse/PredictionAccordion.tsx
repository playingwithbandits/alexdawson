"use client";

import { useState } from "react";
import { AccordionButton } from "./accordions/AccordionButton";
import { AccordionContent } from "./accordions/AccordionContent";
import { StarRating } from "./StarRating";

interface HorseStats {
  // Form
  lastRaces: string; // e.g., "1-3-2-4-1"
  winRate: number;
  placeRate: number;

  // Race Conditions
  preferredGoing: string[]; // e.g., ["Good to Firm", "Good"]
  bestDistance: string; // e.g., "1m 2f"
  courseRecord: string; // e.g., "2 wins from 3 runs"

  // Performance Metrics
  avgSpeedRating: number;
  topSpeedRating: number;
  weightCarried: string;

  // Class & Ratings
  officialRating: number;
  classRecord: string; // e.g., "Class 2: 3 wins from 5 runs"

  // Connections
  trainer: string;
  jockey: string;
  trainerForm: string; // e.g., "23% last 14 days"
  jockeyForm: string; // e.g., "18% last 14 days"
}

interface PredictionAccordionProps {
  horseName: string;
  score: number;
  stats: HorseStats;
}

export function PredictionAccordion({
  horseName,
  score,
  stats,
}: PredictionAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="prediction-accordion">
      <AccordionButton
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="prediction-row">
          <span className="horse-name">{horseName}</span>
          <StarRating score={score} />
        </div>
      </AccordionButton>
      <AccordionContent isExpanded={isExpanded}>
        <div className="horse-stats">
          <div className="stats-grid">
            <div className="stats-section">
              <h4>Form</h4>
              <div className="stat-row">
                <span>Last 5 Races:</span>
                <span className="form-figures">{stats.lastRaces}</span>
              </div>
              <div className="stat-row">
                <span>Win Rate:</span>
                <span>{stats.winRate}%</span>
              </div>
              <div className="stat-row">
                <span>Place Rate:</span>
                <span>{stats.placeRate}%</span>
              </div>
            </div>

            <div className="stats-section">
              <h4>Course & Distance</h4>
              <div className="stat-row">
                <span>Best Going:</span>
                <span>{stats.preferredGoing.join(", ")}</span>
              </div>
              <div className="stat-row">
                <span>Optimal Distance:</span>
                <span>{stats.bestDistance}</span>
              </div>
              <div className="stat-row">
                <span>Course Record:</span>
                <span>{stats.courseRecord}</span>
              </div>
            </div>

            <div className="stats-section">
              <h4>Ratings</h4>
              <div className="stat-row">
                <span>Speed Rating:</span>
                <span>{stats.avgSpeedRating}</span>
              </div>
              <div className="stat-row">
                <span>Top Speed:</span>
                <span>{stats.topSpeedRating}</span>
              </div>
              <div className="stat-row">
                <span>Official Rating:</span>
                <span>{stats.officialRating}</span>
              </div>
            </div>

            <div className="stats-section">
              <h4>Connections</h4>
              <div className="stat-row">
                <span>Trainer:</span>
                <span>{stats.trainer}</span>
              </div>
              <div className="stat-row">
                <span>Trainer Form:</span>
                <span>{stats.trainerForm}</span>
              </div>
              <div className="stat-row">
                <span>Jockey:</span>
                <span>{stats.jockey}</span>
              </div>
              <div className="stat-row">
                <span>Jockey Form:</span>
                <span>{stats.jockeyForm}</span>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </div>
  );
}
