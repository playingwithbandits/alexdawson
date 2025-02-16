"use client";

import { useRoiData } from "@/hooks/useRoiData";
import { Loader2 } from "lucide-react";
import { DailyRoiChart } from "./charts/DailyRoiChart";
import { useState } from "react";

type Source =
  | "ai"
  | "predictions"
  | "atr"
  | "timeform"
  | "gyto"
  | "naps"
  | "rp"
  | "aiLarge";

const sourceNames: Record<Source, string> = {
  ai: "AI Picks",
  predictions: "RP Predictor",
  rp: "RP Verdict",
  atr: "ATR Tips",
  timeform: "Timeform",
  gyto: "GYTO",
  naps: "Naps Table",
  aiLarge: "AI Large",
};

export function Overview() {
  const { data: roiData, isLoading, error } = useRoiData();
  const [timeframe, setTimeframe] = useState<"all" | "30d" | "7d">("all");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading data: {error}</div>;
  }

  // Filter data based on timeframe
  const filteredData = roiData.entries.filter((entry) => {
    const date = new Date(entry.date);
    const now = new Date();
    const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

    switch (timeframe) {
      case "30d":
        return daysDiff <= 30;
      case "7d":
        return daysDiff <= 7;
      default:
        return true;
    }
  });

  // Calculate summary stats for each source
  const sources: Source[] = [
    "ai",
    "predictions",
    "atr",
    "timeform",
    "gyto",
    "naps",
    "rp",
    "aiLarge",
  ];
  const sourceStats = sources
    .map((source) => {
      const totalStaked = filteredData.reduce(
        (sum, entry) => sum + (entry.sources[source]?.totalBets || 0),
        0
      );
      const totalReturned = filteredData.reduce(
        (sum, entry) => sum + (entry.sources[source]?.totalReturns || 0),
        0
      );
      const totalWins = filteredData.reduce(
        (sum, entry) => sum + entry.sources[source]?.wins || 0,
        0
      );
      const totalBets = filteredData.reduce(
        (sum, entry) => sum + entry.sources[source]?.total || 0,
        0
      );

      return {
        name: sourceNames[source],
        source,
        totalStaked,
        totalReturned,
        profit: totalReturned - totalStaked,
        roi: ((totalReturned - totalStaked) / totalStaked) * 100,
        wins: totalWins,
        bets: totalBets,
        strikeRate: (totalWins / totalBets) * 100,
      };
    })
    .sort((a, b) => b.roi - a.roi); // Sort by ROI

  // Prepare data for multi-line ROI chart
  const dailyRoiData = filteredData
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
      ...sources.reduce(
        (acc, source) => ({
          ...acc,
          [source]: entry.sources[source]?.roi || 0,
        }),
        {}
      ),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="overview p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          Performance Comparison
        </h1>
      </div>

      {/* Timeframe selector */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {(["all", "30d", "7d"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 text-sm font-medium border ${
                timeframe === period
                  ? "bg-blue-500 text-white"
                  : "bg-transparent text-gray-400 hover:bg-blue-50"
              } ${period === "all" ? "rounded-l-lg" : ""} ${
                period === "7d" ? "rounded-r-lg" : ""
              }`}
            >
              {period === "all"
                ? "All Time"
                : period === "30d"
                ? "30 Days"
                : "7 Days"}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-row gap-6">
        {/* Performance Table */}
        <div className="w-full stat-card p-6 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">
            Source Performance Comparison
          </h2>
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="py-2">Source</th>
                <th className="py-2 text-right">ROI</th>
                <th className="py-2 text-right">Profit</th>
                <th className="py-2 text-right">Strike Rate</th>
                <th className="py-2 text-right">Wins/Bets</th>
              </tr>
            </thead>
            <tbody>
              {sourceStats.map((stat) => (
                <tr key={stat.source} className="border-b border-gray-800">
                  <td className="py-2">{stat.name}</td>
                  <td
                    className={`py-2 text-right ${
                      stat.roi >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.roi >= 0 ? "+" : ""}
                    {stat.roi.toFixed(1)}%
                  </td>
                  <td
                    className={`py-2 text-right ${
                      stat.profit >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.profit >= 0 ? "+" : ""}£{stat.profit.toLocaleString()}
                  </td>
                  <td className="py-2 text-right">
                    {stat.strikeRate.toFixed(1)}%
                  </td>
                  <td className="py-2 text-right">
                    {stat.wins} / {stat.bets}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ROI Trend Chart */}
        <div className="w-full stat-card p-6">
          <h2 className="text-xl font-bold mb-4">ROI Trends</h2>
          <div className="h-[400px]">
            <DailyRoiChart
              data={dailyRoiData}
              sources={sources.map((source) => ({
                key: source,
                name: sourceNames[source],
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
