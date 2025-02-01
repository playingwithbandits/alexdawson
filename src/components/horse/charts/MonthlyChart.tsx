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

interface MonthlyChartProps {
  data: Array<{ month: string; roi: number; accuracy: number }>;
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <div className="stat-card">
      <h3>Monthly Performance</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
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
