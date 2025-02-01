"use client";

import { useEffect, useState } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TOOLTIP_PROPS, COLORS } from "./constants";

interface BarChartProps {
  data: Array<{ name: string; value: number }>;
  title: string;
}

export function BarChart({ data, title }: BarChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="stat-card">
        <h3>{title}</h3>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            {...TOOLTIP_PROPS}
            formatter={(value: number) => ["£" + value.toLocaleString(), ""]}
          />
          <Bar
            dataKey="value"
            fill={COLORS[0]}
            activeBar={{ fill: COLORS[1] }}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
