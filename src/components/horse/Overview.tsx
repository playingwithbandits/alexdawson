"use client";

import { AccuracyChart } from "./charts/AccuracyChart";
import { RoiChart } from "./charts/RoiChart";
import { MonthlyChart } from "./charts/MonthlyChart";
import { TrackChart } from "./charts/TrackChart";

export function Overview() {
  return (
    <div className="overview">
      <h1>Horse Racing Predictor</h1>
      <p className="intro">
        Welcome to the Horse Racing Predictor dashboard. This tool uses machine
        learning to analyze historical race data and predict outcomes for
        upcoming races. Select a race day from the menu to view detailed
        predictions, or explore our historical performance metrics below.
      </p>

      <div className="stats-grid">
        <AccuracyChart />
        <RoiChart />
        <MonthlyChart />
        <TrackChart />
      </div>
    </div>
  );
}
