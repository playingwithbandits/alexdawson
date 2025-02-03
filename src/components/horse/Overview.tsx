"use client";

import { useRoiData } from "@/hooks/useRoiData";
import { Loader2 } from "lucide-react";
import { BarChart } from "./charts/BarChart";
import { DailyRoiChart } from "./charts/DailyRoiChart";
import { PieChart } from "./charts/PieChart";
import { MonthlyChart } from "./charts/MonthlyChart";
import { DayOfWeekChart } from "./charts/DayOfWeekChart";
import { useState } from "react";

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
  const filteredData = roiData.filter((entry) => {
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

  // Calculate summary stats from available data
  const totalStaked = filteredData.reduce(
    (sum, entry) => sum + entry.totalBets,
    0
  );
  const totalReturned = filteredData.reduce(
    (sum, entry) => sum + entry.totalReturns,
    0
  );
  const totalProfit = totalReturned - totalStaked;
  const overallRoi = ((totalReturned - totalStaked) / totalStaked) * 100;
  const totalWins = filteredData.reduce((sum, entry) => sum + entry.wins, 0);
  const totalBets = filteredData.reduce((sum, entry) => sum + entry.total, 0);
  const strikeRate = (totalWins / totalBets) * 100;

  // Calculate chart data
  const stakingData = [
    { name: "Staked", value: totalStaked },
    { name: "Returned", value: totalReturned },
  ];

  const dailyRoiData = filteredData
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
      roi: entry.roi,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate best day
  const bestDay = filteredData.length
    ? filteredData.reduce((best, entry) =>
        entry.roi > best.roi ? entry : best
      )
    : null;

  // Calculate monthly performance
  const monthlyData = filteredData.reduce((acc: any[], entry) => {
    const month = new Date(entry.date).toLocaleString("default", {
      month: "short",
    });
    const existingMonth = acc.find((m) => m.month === month);
    if (existingMonth) {
      existingMonth.roi = (existingMonth.roi + entry.roi) / 2;
      existingMonth.accuracy =
        (existingMonth.accuracy + (entry.wins / entry.total) * 100) / 2;
    } else {
      acc.push({
        month,
        roi: entry.roi,
        accuracy: (entry.wins / entry.total) * 100,
      });
    }
    return acc;
  }, []);

  // Calculate day of week performance
  const dayOfWeekData = filteredData.reduce(
    (
      acc: Record<
        string,
        { total: number; wins: number; returns: number; stakes: number }
      >,
      entry
    ) => {
      const dayOfWeek = new Date(entry.date).toLocaleString("default", {
        weekday: "short",
      });

      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = {
          total: 0,
          wins: 0,
          returns: 0,
          stakes: 0,
        };
      }

      acc[dayOfWeek].total += entry.total;
      acc[dayOfWeek].wins += entry.wins;
      acc[dayOfWeek].returns += entry.totalReturns;
      acc[dayOfWeek].stakes += entry.totalBets;

      return acc;
    },
    {}
  );

  const dayOfWeekChartData = Object.entries(dayOfWeekData)
    .map(([day, stats]) => ({
      day,
      roi: ((stats.returns - stats.stakes) / stats.stakes) * 100,
      wins: stats.wins,
      total: stats.total,
    }))
    .sort((a, b) => {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.indexOf(a.day) - days.indexOf(b.day);
    });

  return (
    <div className="overview">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          AI Horse Racing Predictor
        </h1>
        <p className="text-xl md:text-2xl text-gray-400">
          Machine Learning Powered Racing Predictions
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Welcome to the Future of Racing
        </h2>
        <p className="text-gray-300">
          Welcome to the AI Horse Racing Predictor dashboard. This tool uses
          machine learning to analyze historical race data and predict outcomes
          for upcoming races. Select a race day from the menu to view detailed
          predictions, or explore our historical performance metrics below.
        </p>
      </div>

      {/* Timeframe selector */}
      <div className="flex justify-end mb-4">
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

      <div className="stats-summary grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card p-4">
          <h4 className="text-gray-400 text-sm">Total Staked</h4>
          <div className="text-xl font-bold">
            £{totalStaked.toLocaleString()}
          </div>
        </div>
        <div className="stat-card p-4">
          <h4 className="text-gray-400 text-sm">Total Returned</h4>
          <div className="text-xl font-bold">
            £{totalReturned.toLocaleString()}
          </div>
        </div>
        <div className="stat-card p-4">
          <h4 className="text-gray-400 text-sm">Total Profit</h4>
          <div
            className={`text-xl font-bold ${
              totalProfit >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {totalProfit >= 0 ? "+" : ""}£{totalProfit.toLocaleString()}
          </div>
        </div>
        <div className="stat-card p-4">
          <h4 className="text-gray-400 text-sm">Overall ROI</h4>
          <div
            className={`text-xl font-bold ${
              overallRoi >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {overallRoi >= 0 ? "+" : ""}
            {overallRoi.toFixed(1)}%
          </div>
        </div>
        <div className="stat-card p-4">
          <h4 className="text-gray-400 text-sm">Total Bets</h4>
          <div className="text-xl font-bold">{totalBets}</div>
        </div>
        <div className="stat-card p-4">
          <h4 className="text-gray-400 text-sm">Winners</h4>
          <div className="text-xl font-bold">{totalWins}</div>
        </div>
        <div className="stat-card p-4">
          <h4 className="text-gray-400 text-sm">Strike Rate</h4>
          <div className="text-xl font-bold">{strikeRate.toFixed(1)}%</div>
        </div>
        <div className="stat-card p-4">
          <h4 className="text-gray-400 text-sm">Days Recorded</h4>
          <div className="text-xl font-bold">{filteredData.length}</div>
        </div>
      </div>

      {/* Best Performance Card */}
      {bestDay && (
        <div className="mb-8">
          <div className="stat-card p-4">
            <h4 className="text-gray-400 text-sm mb-2">Best Day</h4>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xl font-bold text-green-500">
                  +{bestDay.roi.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(bestDay.date).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Profit</div>
                <div className="font-bold text-green-500">
                  +£
                  {(bestDay.totalReturns - bestDay.totalBets).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="stat-card p-6">
          <h4 className="text-gray-400 text-sm mb-4">Stakes vs Returns</h4>
          <BarChart data={stakingData} title="Stakes vs Returns (£)" />
        </div>
        <div className="stat-card p-6">
          <h4 className="text-gray-400 text-sm mb-4">ROI Trend</h4>
          <DailyRoiChart data={dailyRoiData} title="Daily ROI (%)" />
        </div>
      </div>

      {/* Day of Week Performance */}
      {dayOfWeekChartData.length > 0 && (
        <div className="stat-card p-6 mb-8">
          <h4 className="text-gray-400 text-sm mb-4">Performance by Day</h4>
          <DayOfWeekChart data={dayOfWeekChartData} />
          <div className="grid grid-cols-7 gap-2 mt-4 text-center">
            {dayOfWeekChartData.map((day) => (
              <div key={day.day} className="text-sm">
                <div className="text-gray-400">{day.day}</div>
                <div className="font-medium">
                  {((day.wins / day.total) * 100).toFixed(0)}%
                </div>
                <div
                  className={`text-xs ${
                    day.roi >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {day.roi >= 0 ? "+" : ""}
                  {day.roi.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Performance */}
      {monthlyData.length > 0 && (
        <div className="stat-card p-6 mb-8">
          <h4 className="text-gray-400 text-sm mb-4">Monthly Performance</h4>
          <MonthlyChart data={monthlyData} />
        </div>
      )}
    </div>
  );
}
