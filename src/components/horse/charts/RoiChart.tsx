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

interface RoiChartProps {
  data: Array<{ name: string; value: number }>;
}

export function RoiChart({ data }: RoiChartProps) {
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
            {data.map((entry, index) => (
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
