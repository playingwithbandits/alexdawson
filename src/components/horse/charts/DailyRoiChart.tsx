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
import { COLORS, TOOLTIP_PROPS } from "./constants";

interface DailyRoiChartProps {
  data: Array<{ date: string; [key: string]: number }>;
  sources: Array<{ key: string; name: string }>;
}

export function DailyRoiChart({ data, sources }: DailyRoiChartProps) {
  const sourceNameMap = Object.fromEntries(
    sources.map((source) => [source.key, source.name])
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          {...TOOLTIP_PROPS}
          formatter={(value: number, name: string) => [
            `${value.toFixed(1)}%`,
            sourceNameMap[name] || name,
          ]}
        />
        <Legend />
        {sources.map((source, index) => (
          <Line
            key={source.key}
            type="monotone"
            dataKey={source.key}
            name={source.name}
            stroke={COLORS[index % COLORS.length]}
            dot={false}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
