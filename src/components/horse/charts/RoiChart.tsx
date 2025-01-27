"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { COLORS, TOOLTIP_PROPS } from "./constants";

const roiData = [
  { name: "Flat", value: 12.5 },
  { name: "Jump", value: 8.2 },
  { name: "AW", value: 15.7 },
];

export function RoiChart() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="stat-card">
        <h3>ROI by Race Type</h3>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <h3>ROI by Race Type</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={roiData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label
          >
            {roiData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip {...TOOLTIP_PROPS} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
