"use client";

import {
  PieChart as ReChartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { COLORS, TOOLTIP_PROPS } from "./constants";

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
}

export function PieChart({ data }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ReChartsPie>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          {...TOOLTIP_PROPS}
          formatter={(value: number) => [`£${value.toLocaleString()}`, ""]}
        />
        <Legend />
      </ReChartsPie>
    </ResponsiveContainer>
  );
}
