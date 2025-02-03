"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { COLORS, TOOLTIP_PROPS } from "./constants";

interface DayOfWeekChartProps {
  data: Array<{
    day: string;
    roi: number;
    wins: number;
    total: number;
  }>;
}

export function DayOfWeekChart({ data }: DayOfWeekChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip
          {...TOOLTIP_PROPS}
          formatter={(value: number) => [`${value.toFixed(1)}%`, "ROI"]}
        />
        <Bar dataKey="roi" fill={COLORS[0]} activeBar={{ fill: COLORS[1] }} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
