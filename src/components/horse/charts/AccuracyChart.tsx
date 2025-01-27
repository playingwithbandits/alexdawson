"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TOOLTIP_PROPS, COLORS } from "./constants";

const accuracyData = [
  { name: "Win", accuracy: 68 },
  { name: "Place", accuracy: 75 },
  { name: "Show", accuracy: 82 },
];

export function AccuracyChart() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="stat-card">
        <h3>Prediction Accuracy</h3>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <h3>Prediction Accuracy</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={accuracyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip {...TOOLTIP_PROPS} />
          <Bar
            dataKey="accuracy"
            fill={COLORS[0]}
            activeBar={{ fill: COLORS[1] }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
