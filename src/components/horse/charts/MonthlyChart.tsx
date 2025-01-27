"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TOOLTIP_PROPS } from "./constants";

const monthlyData = [
  { month: "Jan", roi: 8.2, accuracy: 72 },
  { month: "Feb", roi: 10.5, accuracy: 68 },
  { month: "Mar", roi: 15.2, accuracy: 75 },
  { month: "Apr", roi: 12.8, accuracy: 70 },
  { month: "May", roi: 9.5, accuracy: 73 },
  { month: "Jun", roi: 11.2, accuracy: 71 },
];

export function MonthlyChart() {
  return (
    <div className="stat-card">
      <h3>Monthly Performance</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip {...TOOLTIP_PROPS} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="roi"
            stroke="#00e5ff"
            activeDot={{ r: 8 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="accuracy"
            stroke="#00fff2"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
