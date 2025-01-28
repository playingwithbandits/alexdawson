"use client";

import { useState } from "react";
import { AccordionButton } from "./accordions/AccordionButton";
import { AccordionContent } from "./accordions/AccordionContent";
import { StarRating } from "./StarRating";
import { FormHistoryTable } from "./FormHistoryTable";
import { FormEntry } from "@/lib/generator/predictions";

interface HighlightedStat {
  value: string | number;
  isHighlighted: boolean;
}

interface HorseStats {
  // Form
  lastRaces: string; // e.g., "1-3-2-4-1"
  winRate: HighlightedStat;
  placeRate: HighlightedStat;

  // Race Conditions
  preferredGoing: HighlightedStat; // e.g., "Good to Firm, Good"
  bestDistance: HighlightedStat; // e.g., "1m 2f"

  // Performance Metrics
  avgSpeedRating: HighlightedStat;
  topSpeedRating: HighlightedStat;
  weightCarried: string;

  // Class & Ratings
  officialRating: HighlightedStat;
  classRecord: string; // e.g., "Class 2: 3 wins from 5 runs"

  // Connections
  trainer: string;
  jockey: string;
  trainerForm: HighlightedStat; // e.g., "23% last 14 days"
  jockeyForm: HighlightedStat; // e.g., "18% last 14 days"
}

interface HorseForm {
  lastRaces: FormEntry[];
  courseStats: {
    avgFinishPosition: number;
    totalRuns: number;
    preferredCourses: string[];
  };
  distanceStats: {
    avgDistance: number;
    avgFinishPosition: number;
  };
  goingStats: {
    preferredGoing: string[];
    avgFinishPosition: number;
  };
  classStats: {
    avgClass: number;
    avgFinishPosition: number;
  };
  jockeyStats: {
    preferredJockeys: string[];
    avgFinishPosition: number;
  };
  prizeStats: {
    avgPrize: number;
    totalPrize: number;
  };
  ratingStats: {
    avgOR: number;
    topOR: number;
  };
  daysOff: number;
}

interface PredictionAccordionProps {
  horseName: string;
  score: number;
  stats: HorseStats;
  form: HorseForm;
  raceStats: {
    avgSpeedRating: number;
    avgOfficialRating: number;
    raceDistance: string;
    going: string;
    avgPrize: number;
    avgTotalPrize: number;
  };
}

export function PredictionAccordion({
  horseName,
  score,
  stats,
  form,
  raceStats,
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
                <span
                  className={
                    stats.winRate.isHighlighted ? "highlighted-stat" : ""
                  }
                >
                  {parseFloat(stats.winRate.value.toString()).toFixed(1)}%
                </span>
              </div>
              <div className="stat-row">
                <span>Place Rate:</span>
                <span
                  className={
                    stats.placeRate.isHighlighted ? "highlighted-stat" : ""
                  }
                >
                  {parseFloat(stats.placeRate.value.toString()).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="stats-section">
              <h4>Course & Distance</h4>
              <div className="stat-row">
                <span>Best Going:</span>
                <span
                  className={
                    stats.preferredGoing.isHighlighted ? "highlighted-stat" : ""
                  }
                >
                  {stats.preferredGoing.value}
                </span>
              </div>
              <div className="stat-row">
                <span>Optimal Distance:</span>
                <span
                  className={
                    stats.bestDistance.isHighlighted ? "highlighted-stat" : ""
                  }
                >
                  {parseFloat(stats.bestDistance.value.toString()).toFixed(1)}
                </span>
              </div>
            </div>

            <div className="stats-section">
              <h4>Ratings</h4>
              <div className="stat-row">
                <span>Speed Rating:</span>
                <span
                  className={
                    stats.avgSpeedRating.isHighlighted ? "highlighted-stat" : ""
                  }
                >
                  {stats.avgSpeedRating.value}
                </span>
              </div>
              <div className="stat-row">
                <span>Top Speed:</span>
                <span
                  className={
                    stats.topSpeedRating.isHighlighted ? "highlighted-stat" : ""
                  }
                >
                  {stats.topSpeedRating.value}
                </span>
              </div>
              <div className="stat-row">
                <span>Official Rating:</span>
                <span
                  className={
                    stats.officialRating.isHighlighted ? "highlighted-stat" : ""
                  }
                >
                  {stats.officialRating.value}
                </span>
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
                <span
                  className={
                    stats.trainerForm.isHighlighted ? "highlighted-stat" : ""
                  }
                >
                  {stats.trainerForm.value}
                </span>
              </div>
              <div className="stat-row">
                <span>Jockey:</span>
                <span
                  className={
                    form.jockeyStats.preferredJockeys.includes(stats.jockey)
                      ? "highlighted-stat"
                      : ""
                  }
                >
                  {stats.jockey}
                </span>
              </div>
              <div className="stat-row">
                <span>Jockey Form:</span>
                <span
                  className={
                    stats.jockeyForm.isHighlighted ? "highlighted-stat" : ""
                  }
                >
                  {stats.jockeyForm.value}
                </span>
              </div>
              <div className="stat-row">
                <span>Avg Prize:</span>
                <span
                  className={
                    form.prizeStats.avgPrize > raceStats.avgPrize
                      ? "highlighted-stat"
                      : ""
                  }
                >
                  £{form.prizeStats.avgPrize.toFixed(1)}k
                </span>
              </div>
              <div className="stat-row">
                <span>Total Prize:</span>
                <span
                  className={
                    form.prizeStats.totalPrize > raceStats.avgTotalPrize
                      ? "highlighted-stat"
                      : ""
                  }
                >
                  £{form.prizeStats.totalPrize.toFixed(1)}k
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="form-stats-summary">
          <div className="form-stat">
            <span>Avg Position:</span>
            <span>
              {form.courseStats.avgFinishPosition.toFixed(1)} (
              {form.courseStats.totalRuns})
            </span>
          </div>
          <div className="form-stat">
            <span>Avg Distance:</span>
            <span>{form.distanceStats.avgDistance.toFixed(1)}f</span>
          </div>
          <div className="form-stat">
            <span>Distance Position:</span>
            <span>{form.distanceStats.avgFinishPosition.toFixed(1)}</span>
          </div>
          <div className="form-stat">
            <span>Avg Going:</span>
            <span>{form.goingStats.preferredGoing.join(", ")}</span>
          </div>
          <div className="form-stat">
            <span>Going Position:</span>
            <span>{form.goingStats.avgFinishPosition.toFixed(1)}</span>
          </div>
          <div className="form-stat">
            <span>Avg Class:</span>
            <span>{form.classStats.avgClass.toFixed(1)}</span>
          </div>
          <div className="form-stat">
            <span>Class Position:</span>
            <span>{form.classStats.avgFinishPosition.toFixed(1)}</span>
          </div>
          <div className="form-stat">
            <span>Last Run:</span>
            <span>{form.daysOff} days</span>
          </div>
          <div className="form-stat">
            <span>Preferred Courses:</span>
            <span>{form.courseStats.preferredCourses.join(", ")}</span>
          </div>
          <div className="form-stat">
            <span>Preferred Jockeys:</span>
            <span>{form.jockeyStats.preferredJockeys.join(", ")}</span>
          </div>
          <div className="form-stat">
            <span>Avg Prize:</span>
            <span>£{form.prizeStats.avgPrize.toFixed(1)}k</span>
          </div>
          <div className="form-stat">
            <span>Total Prize:</span>
            <span>£{form.prizeStats.totalPrize.toFixed(1)}k</span>
          </div>
          <div className="form-stat">
            <span>Avg OR:</span>
            <span>{form.ratingStats.avgOR.toFixed(1)}</span>
          </div>
          <div className="form-stat">
            <span>Top OR:</span>
            <span>{form.ratingStats.topOR}</span>
          </div>
          <div className="form-stat">
            <span>Win Rate:</span>
            <span>
              {(
                (form.lastRaces.filter((race) => race.position === 1).length /
                  form.lastRaces.length) *
                100
              ).toFixed(1)}
              %
            </span>
          </div>
          <div className="form-stat">
            <span>Place Rate:</span>
            <span>
              {(
                (form.lastRaces.filter((race) => {
                  if (race.totalRunners < 5) return race.position <= 1;
                  if (race.totalRunners < 8) return race.position <= 2;
                  if (race.totalRunners < 12) return race.position <= 3;
                  return race.position <= 3;
                }).length /
                  form.lastRaces.length) *
                100
              ).toFixed(1)}
              %
            </span>
          </div>
        </div>
        <FormHistoryTable formEntries={form.lastRaces} />
      </AccordionContent>
    </div>
  );
}
