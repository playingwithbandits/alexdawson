"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { COLORS, TOOLTIP_PROPS } from "./constants";

const trackData = [
  { name: "Ascot", value: 25 },
  { name: "Newmarket", value: 20 },
  { name: "York", value: 15 },
  { name: "Cheltenham", value: 20 },
  { name: "Goodwood", value: 10 },
  { name: "Other", value: 10 },
];

export function TrackChart() {
  return (
    <div className="stat-card">
      <h3>Track Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={trackData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {trackData.map((entry, index) => (
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
