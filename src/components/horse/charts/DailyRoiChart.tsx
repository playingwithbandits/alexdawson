"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TOOLTIP_PROPS } from "./constants";

interface DailyRoiChartProps {
  data: Array<{ date: string; roi: number }>;
  title: string;
}

export function DailyRoiChart({ data, title }: DailyRoiChartProps) {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis />
          <Tooltip
            {...TOOLTIP_PROPS}
            formatter={(value: number) => [value.toFixed(1) + "%", "ROI"]}
          />
          <Line
            type="monotone"
            dataKey="roi"
            stroke="#00e5ff"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
