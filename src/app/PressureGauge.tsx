"use client";
import React, { useEffect, useState } from "react";

type PressureGaugeProps = {
  queueLength: number;
  size?: number; // px
  strokeWidth?: number; // px
};

export const PressureGauge: React.FC<PressureGaugeProps> = ({
  queueLength,
  size = 140,
  strokeWidth = 14,
}) => {
  const [maxQueue, setMaxQueue] = useState(0);

  // Track the maximum seen queue length
  useEffect(() => {
    setMaxQueue((prev) => (queueLength > prev ? queueLength : prev));
  }, [queueLength]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const safeMax = Math.max(maxQueue, 1); // avoid divide-by-zero
  const ratio = Math.min(queueLength / safeMax, 1);
  const offset = circumference * (1 - ratio);

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          stroke="#1f2937"
          fill="transparent"
          strokeWidth={strokeWidth}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          style={{ opacity: 0.3 }}
        />
        {/* Value circle */}
        <circle
          stroke={ratio > 0.7 ? "#ef4444" : ratio > 0.4 ? "#f59e0b" : "#22c55e"}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      {/* Center text */}
      <div
        style={{
          position: "absolute",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700 }}>
          {queueLength}
          <span style={{ fontSize: 14, opacity: 0.7 }}> / {safeMax}</span>
        </div>
        <div style={{ fontSize: 12, textTransform: "uppercase", opacity: 0.6 }}>
          Queue pressure
        </div>
      </div>
    </div>
  );
};
