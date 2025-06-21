"use client";

import { useState } from "react";
import { Horse as HorseType } from "@/types/racing";
import { Form } from "./Form";

export interface HorseProps {
  horse: HorseType;
}

export const Horse = ({ horse }: HorseProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);
  const toggleStats = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowStats(!showStats);
  };
  const toggleScoreBreakdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowScoreBreakdown(!showScoreBreakdown);
  };

  const getFormDisplay = (form?: string) => {
    if (!form) return "No form data";
    return form.split("").map((char, index) => (
      <span
        key={index}
        className={`inline-block w-6 h-6 text-center text-xs font-medium rounded ${
          char === "1"
            ? "bg-green-900 text-green-300 border border-green-700"
            : char === "2"
            ? "bg-blue-900 text-blue-300 border border-blue-700"
            : char === "3"
            ? "bg-yellow-900 text-yellow-300 border border-yellow-700"
            : char === "0"
            ? "bg-gray-800 text-gray-400 border border-gray-600"
            : "bg-red-900 text-red-300 border border-red-700"
        }`}
      >
        {char}
      </span>
    ));
  };

  const formatLastRun = (lastRun?: string) => {
    if (!lastRun) return "N/A";
    const days = parseInt(lastRun);
    if (isNaN(days)) return lastRun;
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const getFormTrendColor = (trend?: string) => {
    switch (trend) {
      case "improving":
        return "text-green-400";
      case "declining":
        return "text-red-400";
      case "consistent":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getFormTrendIcon = (trend?: string) => {
    switch (trend) {
      case "improving":
        return "↗";
      case "declining":
        return "↘";
      case "consistent":
        return "→";
      default:
        return "";
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return `£${amount.toLocaleString()}`;
  };

  const formatPercentage = (value?: number) => {
    if (!value) return "N/A";
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
      <div
        className="px-4 py-3 cursor-pointer hover:bg-gray-600 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold text-white min-w-[3rem]">
              {horse.number}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-white">{horse.name}</h4>
                {horse.headGear && (
                  <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded">
                    {horse.headGear.code}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Age:</span>
                  <span className="text-white">{horse.age}yo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Weight:</span>
                  <span className="text-white">{horse.weight.display}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Jockey:</span>
                  <span className="text-white">{horse.jockey.name}</span>
                  {horse.jockey.allowance && (
                    <span className="text-xs bg-blue-900 text-blue-300 px-1 rounded">
                      {horse.jockey.allowance}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Trainer:</span>
                  <span className="text-white">{horse.trainer.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Owner:</span>
                  <span className="text-white truncate">{horse.owner}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Last Run:</span>
                  <span className="text-white">
                    {formatLastRun(horse.lastRun)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-2 text-sm">
                {horse.rating && (
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-400">OR:</span>
                    <span className="text-white font-medium">
                      {horse.rating}
                    </span>
                  </div>
                )}
                {horse.officialRating && (
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-400">Official:</span>
                    <span className="text-white font-medium">
                      {horse.officialRating}
                    </span>
                  </div>
                )}
                {horse.topSpeed && (
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-400">TS:</span>
                    <span className="text-white font-medium">
                      {horse.topSpeed}
                    </span>
                  </div>
                )}
                {horse.draw && (
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-400">Draw:</span>
                    <span className="text-white font-medium">{horse.draw}</span>
                  </div>
                )}
              </div>

              {horse.form && (
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-gray-400">Form:</span>
                  {getFormDisplay(horse.form)}
                </div>
              )}

              {horse.stats && (
                <div className="mt-2">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-800 rounded p-2">
                      <div className="text-gray-400">Career</div>
                      <div className="text-white font-medium">
                        {horse.stats.totalStarts || 0} runs,{" "}
                        {horse.stats.totalWins || 0} wins
                      </div>
                      <div className="text-gray-400">
                        {formatPercentage(horse.stats.winRate)} win rate
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-2">
                      <div className="text-gray-400">Form Trend</div>
                      <div
                        className={`font-medium ${getFormTrendColor(
                          horse.stats.recentFormTrend
                        )}`}
                      >
                        {getFormTrendIcon(horse.stats.recentFormTrend)}{" "}
                        {horse.stats.recentFormTrend || "N/A"}
                      </div>
                      <div className="text-gray-400">
                        Avg pos:{" "}
                        {(horse.stats.avgPositionLastSix || 0).toFixed(1)}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-2">
                      <div className="text-gray-400">Distance</div>
                      <div className="text-white font-medium">
                        {horse.stats.distancePreference || "N/A"}
                      </div>
                      <div className="text-gray-400">
                        {horse.stats.optimalDistance
                          ? `${horse.stats.optimalDistance}f`
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={toggleStats}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {showStats ? "Hide" : "Show"} Detailed Stats
                  </button>

                  {showStats && (
                    <div className="mt-2 space-y-2">
                      {/* Earnings */}
                      <div className="bg-gray-800 rounded p-2 text-xs">
                        <div className="text-gray-400 font-medium mb-1">
                          Earnings
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            Total: {formatCurrency(horse.stats.totalEarnings)}
                          </div>
                          <div>
                            Avg per race:{" "}
                            {formatCurrency(horse.stats.avgEarningsPerRace)}
                          </div>
                          <div>
                            Highest prize:{" "}
                            {formatCurrency(horse.stats.highestPrize)}
                          </div>
                          <div>
                            Avg prize: {formatCurrency(horse.stats.avgPrize)}
                          </div>
                        </div>
                      </div>

                      {/* Ratings */}
                      <div className="bg-gray-800 rounded p-2 text-xs">
                        <div className="text-gray-400 font-medium mb-1">
                          Ratings
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>Best RPR: {horse.stats.bestRPR || "N/A"}</div>
                          <div>
                            Avg RPR: {(horse.stats.avgRPR || 0).toFixed(1)}
                          </div>
                          <div>
                            Best TS: {horse.stats.bestTopSpeed || "N/A"}
                          </div>
                          <div>
                            Avg TS: {(horse.stats.avgTopSpeed || 0).toFixed(1)}
                          </div>
                          <div>
                            Best OR: {horse.stats.bestOfficialRating || "N/A"}
                          </div>
                          <div>
                            Avg OR:{" "}
                            {(horse.stats.avgOfficialRating || 0).toFixed(1)}
                          </div>
                        </div>
                      </div>

                      {/* Distance Stats */}
                      <div className="bg-gray-800 rounded p-2 text-xs">
                        <div className="text-gray-400 font-medium mb-1">
                          Distance Performance
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            Range: {horse.stats.minDistance || "N/A"}-
                            {horse.stats.maxDistance || "N/A"}f
                          </div>
                          <div>
                            Avg: {(horse.stats.avgDistance || 0).toFixed(1)}f
                          </div>
                          {horse.stats.distanceStats && (
                            <>
                              <div>
                                Sprint:{" "}
                                {formatPercentage(
                                  horse.stats.distanceStats.performanceByType
                                    .sprint.winRate
                                )}
                              </div>
                              <div>
                                Mile:{" "}
                                {formatPercentage(
                                  horse.stats.distanceStats.performanceByType
                                    .mile.winRate
                                )}
                              </div>
                              <div>
                                Middle:{" "}
                                {formatPercentage(
                                  horse.stats.distanceStats.performanceByType
                                    .middle.winRate
                                )}
                              </div>
                              <div>
                                Staying:{" "}
                                {formatPercentage(
                                  horse.stats.distanceStats.performanceByType
                                    .staying.winRate
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Class Stats */}
                      <div className="bg-gray-800 rounded p-2 text-xs">
                        <div className="text-gray-400 font-medium mb-1">
                          Class Performance
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            Highest: Class{" "}
                            {horse.stats.classStats?.highestClass || "N/A"}
                          </div>
                          <div>
                            Lowest: Class{" "}
                            {horse.stats.classStats?.lowestClass || "N/A"}
                          </div>
                          <div>
                            Current: Class{" "}
                            {horse.stats.classStats?.currentClass || "N/A"}
                          </div>
                          <div>
                            Avg: Class{" "}
                            {(horse.stats.avgClassLevel || 0).toFixed(1)}
                          </div>
                          <div>
                            Preferred: {horse.stats.preferredClass || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Going Performance */}
                      {horse.stats.goingStats &&
                        horse.stats.goingStats.length > 0 && (
                          <div className="bg-gray-800 rounded p-2 text-xs">
                            <div className="text-gray-400 font-medium mb-1">
                              Going Performance
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {horse.stats.goingStats.map((going, index) => (
                                <div key={index}>
                                  {going.type}: {going.runs} runs,{" "}
                                  {formatPercentage(going.winRate)} win rate
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Surface Stats */}
                      {horse.stats.surfaceStats && (
                        <div className="bg-gray-800 rounded p-2 text-xs">
                          <div className="text-gray-400 font-medium mb-1">
                            Surface Performance
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(horse.stats.surfaceStats).map(
                              ([surface, stats]) => (
                                <div key={surface}>
                                  {surface}: {stats.runs} runs,{" "}
                                  {formatPercentage(stats.winRate)} win rate
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Race Type Stats */}
                      {horse.stats.raceTypeStats && (
                        <div className="bg-gray-800 rounded p-2 text-xs">
                          <div className="text-gray-400 font-medium mb-1">
                            Race Type Performance
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              Flat:{" "}
                              {formatPercentage(
                                horse.stats.raceTypeStats.flat.winRate
                              )}
                            </div>
                            <div>
                              AW:{" "}
                              {formatPercentage(
                                horse.stats.raceTypeStats.aw.winRate
                              )}
                            </div>
                            <div>
                              Hurdle:{" "}
                              {formatPercentage(
                                horse.stats.raceTypeStats.hurdle.winRate
                              )}
                            </div>
                            <div>
                              Chase:{" "}
                              {formatPercentage(
                                horse.stats.raceTypeStats.chase.winRate
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Additional Stats */}
                      <div className="bg-gray-800 rounded p-2 text-xs">
                        <div className="text-gray-400 font-medium mb-1">
                          Additional Stats
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            Days off track: {horse.stats.daysOffTrack || "N/A"}
                          </div>
                          <div>
                            Racing frequency:{" "}
                            {(horse.stats.racingFrequency || 0).toFixed(1)} days
                          </div>
                          <div>Run style: {horse.stats.runStyle || "N/A"}</div>
                          <div>
                            Consistency:{" "}
                            {(
                              horse.stats.consistency?.reliability || 0
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                      </div>

                      {/* Margins Performance */}
                      {horse.stats.margins && (
                        <div className="bg-gray-800 rounded p-2 text-xs">
                          <div className="text-gray-400 font-medium mb-1">
                            Margin Performance
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              Avg winning margin:{" "}
                              {(
                                horse.stats.margins.avgWinningDistance || 0
                              ).toFixed(1)}
                              l
                            </div>
                            <div>
                              Avg beaten distance:{" "}
                              {(
                                horse.stats.margins.avgBeatenDistance || 0
                              ).toFixed(1)}
                              l
                            </div>
                            <div>
                              Max winning margin:{" "}
                              {(
                                horse.stats.margins.maxWinningMargin || 0
                              ).toFixed(1)}
                              l
                            </div>
                            <div>
                              Max beaten distance:{" "}
                              {(
                                horse.stats.margins.maxBeatenDistance || 0
                              ).toFixed(1)}
                              l
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Draw Performance */}
                      {horse.stats.drawPerformance && (
                        <div className="bg-gray-800 rounded p-2 text-xs">
                          <div className="text-gray-400 font-medium mb-1">
                            Draw Performance
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              Wins from bad draw:{" "}
                              {horse.stats.drawPerformance.winsFromBadDraw || 0}
                            </div>
                            <div>
                              Runs from bad draw:{" "}
                              {horse.stats.drawPerformance.runsFromBadDraw || 0}
                            </div>
                            <div>
                              Win rate from bad draw:{" "}
                              {formatPercentage(
                                horse.stats.drawPerformance.winRateFromBadDraw
                              )}
                            </div>
                            <div>
                              Avg position from bad draw:{" "}
                              {(
                                horse.stats.drawPerformance
                                  .avgPositionFromBadDraw || 0
                              ).toFixed(1)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sentiment Analysis */}
                      {horse.stats.sentiment && (
                        <div className="bg-gray-800 rounded p-2 text-xs">
                          <div className="text-gray-400 font-medium mb-1">
                            Sentiment Analysis
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              Recent comment score:{" "}
                              {(
                                horse.stats.sentiment.recentCommentScore || 0
                              ).toFixed(1)}
                            </div>
                            <div>
                              Avg comment score:{" "}
                              {(
                                horse.stats.sentiment.avgCommentScore || 0
                              ).toFixed(1)}
                            </div>
                            <div>
                              Positive comments:{" "}
                              {horse.stats.sentiment.positiveComments || 0}
                            </div>
                            <div>
                              Negative comments:{" "}
                              {horse.stats.sentiment.negativeComments || 0}
                            </div>
                            <div>
                              Trend:{" "}
                              <span
                                className={`font-medium ${
                                  horse.stats.sentiment.trend === "positive"
                                    ? "text-green-400"
                                    : horse.stats.sentiment.trend === "negative"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                }`}
                              >
                                {horse.stats.sentiment.trend || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Seasonal Form */}
                      {horse.stats.seasonalForm && (
                        <div className="bg-gray-800 rounded p-2 text-xs">
                          <div className="text-gray-400 font-medium mb-1">
                            Seasonal Performance
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              Spring:{" "}
                              {formatPercentage(
                                horse.stats.seasonalForm.spring
                              )}
                            </div>
                            <div>
                              Summer:{" "}
                              {formatPercentage(
                                horse.stats.seasonalForm.summer
                              )}
                            </div>
                            <div>
                              Autumn:{" "}
                              {formatPercentage(
                                horse.stats.seasonalForm.autumn
                              )}
                            </div>
                            <div>
                              Winter:{" "}
                              {formatPercentage(
                                horse.stats.seasonalForm.winter
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Layoff Performance */}
                      {horse.stats.layoff && (
                        <div className="bg-gray-800 rounded p-2 text-xs">
                          <div className="text-gray-400 font-medium mb-1">
                            Layoff Performance
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              Current days:{" "}
                              {horse.stats.layoff.currentDays || "N/A"}
                            </div>
                            <div>
                              Avg gap days:{" "}
                              {(horse.stats.layoff.avgGapDays || 0).toFixed(1)}
                            </div>
                            <div>
                              Runs after break:{" "}
                              {horse.stats.layoff.performanceAfterBreak?.runs ||
                                0}
                            </div>
                            <div>
                              Win rate after break:{" "}
                              {formatPercentage(
                                horse.stats.layoff.performanceAfterBreak
                                  ?.winRate
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Course Form */}
                      {horse.stats.courseForm && (
                        <div className="bg-gray-800 rounded p-2 text-xs">
                          <div className="text-gray-400 font-medium mb-1">
                            Course Form
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>Runs: {horse.stats.courseForm.runs || 0}</div>
                            <div>Wins: {horse.stats.courseForm.wins || 0}</div>
                            <div>
                              Win rate:{" "}
                              {formatPercentage(horse.stats.courseForm.winRate)}
                            </div>
                            <div>
                              Place rate:{" "}
                              {formatPercentage(
                                horse.stats.courseForm.placeRate
                              )}
                            </div>
                            <div>
                              Avg position:{" "}
                              {(
                                horse.stats.courseForm.avgPosition || 0
                              ).toFixed(1)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Form Progression */}
                      {horse.stats.formProgression && (
                        <div className="bg-gray-800 rounded p-2 text-xs">
                          <div className="text-gray-400 font-medium mb-1">
                            Form Progression
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              Trend:{" "}
                              <span
                                className={`font-medium ${
                                  horse.stats.formProgression.trend ===
                                  "improving"
                                    ? "text-green-400"
                                    : horse.stats.formProgression.trend ===
                                      "declining"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                }`}
                              >
                                {horse.stats.formProgression.trend || "N/A"}
                              </span>
                            </div>
                            <div>
                              Position trend:{" "}
                              <span
                                className={`font-medium ${
                                  horse.stats.formProgression.positionTrend ===
                                  "improving"
                                    ? "text-green-400"
                                    : horse.stats.formProgression
                                        .positionTrend === "declining"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                }`}
                              >
                                {horse.stats.formProgression.positionTrend ||
                                  "N/A"}
                              </span>
                            </div>
                            <div>
                              Avg position:{" "}
                              {(
                                horse.stats.formProgression.averagePosition || 0
                              ).toFixed(1)}
                            </div>
                            <div>
                              Last 6:{" "}
                              {horse.stats.formProgression.lastSixPositions
                                ?.slice(-3)
                                .join(", ") || "N/A"}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Class Movement */}
                      {horse.stats.classMovement && (
                        <div className="bg-gray-800 rounded p-2 text-xs">
                          <div className="text-gray-400 font-medium mb-1">
                            Class Movement
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              Current: Class{" "}
                              {horse.stats.classMovement.current || "N/A"}
                            </div>
                            <div>
                              Highest: Class{" "}
                              {horse.stats.classMovement.highest || "N/A"}
                            </div>
                            <div>
                              Lowest: Class{" "}
                              {horse.stats.classMovement.lowest || "N/A"}
                            </div>
                            <div>
                              Trend:{" "}
                              <span
                                className={`font-medium ${
                                  horse.stats.classMovement.trend === "up"
                                    ? "text-green-400"
                                    : horse.stats.classMovement.trend === "down"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                }`}
                              >
                                {horse.stats.classMovement.trend || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Seasonal Performance */}
                      {horse.stats.seasonal &&
                        Object.keys(horse.stats.seasonal).length > 0 && (
                          <div className="bg-gray-800 rounded p-2 text-xs">
                            <div className="text-gray-400 font-medium mb-1">
                              Seasonal Performance
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(horse.stats.seasonal)
                                .slice(0, 4)
                                .map(([season, stats]) => (
                                  <div key={season}>
                                    {season}: {stats.runs} runs,{" "}
                                    {formatPercentage(stats.winRate)}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                      {/* Distance Performance Details */}
                      {horse.stats.distancePerformance && (
                        <div className="bg-gray-800 rounded p-2 text-xs">
                          <div className="text-gray-400 font-medium mb-1">
                            Distance Performance Details
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              Sprint:{" "}
                              {horse.stats.distancePerformance.sprint.runs}{" "}
                              runs,{" "}
                              {formatPercentage(
                                horse.stats.distancePerformance.sprint.winRate
                              )}
                            </div>
                            <div>
                              Mile: {horse.stats.distancePerformance.mile.runs}{" "}
                              runs,{" "}
                              {formatPercentage(
                                horse.stats.distancePerformance.mile.winRate
                              )}
                            </div>
                            <div>
                              Middle:{" "}
                              {horse.stats.distancePerformance.middle.runs}{" "}
                              runs,{" "}
                              {formatPercentage(
                                horse.stats.distancePerformance.middle.winRate
                              )}
                            </div>
                            <div>
                              Staying:{" "}
                              {horse.stats.distancePerformance.staying.runs}{" "}
                              runs,{" "}
                              {formatPercentage(
                                horse.stats.distancePerformance.staying.winRate
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {horse.score && (
              <div className="text-right">
                <div className="text-sm font-medium text-blue-400">
                  Score: {horse.score.total.score.toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">
                  {(horse.score.total.percentage || 0).toFixed(0)}%
                </div>
                <button
                  onClick={toggleScoreBreakdown}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
                >
                  {showScoreBreakdown ? "Hide" : "Show"} Score Breakdown
                </button>
              </div>
            )}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {expanded && horse.formObj && (
        <div className="border-t border-gray-600 bg-gray-600">
          <div className="px-4 py-3">
            <Form formObj={horse.formObj} />
          </div>
        </div>
      )}

      {/* Score Components Table */}
      {horse.score && showScoreBreakdown && (
        <div className="border-t border-gray-600 bg-gray-600">
          <div className="px-4 py-3">
            <h6 className="font-medium text-white mb-3">Score Components</h6>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-500">
                    <th className="text-left py-2 px-2 text-gray-300">
                      Component
                    </th>
                    <th className="text-left py-2 px-2 text-gray-300">Score</th>
                    <th className="text-left py-2 px-2 text-gray-300">
                      Max Score
                    </th>
                    <th className="text-left py-2 px-2 text-gray-300">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-500">
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 font-medium text-white">Total</td>
                    <td className="py-2 px-2 text-blue-400 font-semibold">
                      {horse.score.total.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.total.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.total.percentage || 0).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Ratings</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.ratings.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.ratings.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.components.ratings.percentage || 0).toFixed(
                        1
                      )}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Distance</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.distance.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.distance.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.distance.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Going</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.going.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.going.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.components.going.percentage || 0).toFixed(
                        1
                      )}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Form</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.form.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.form.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.components.form.percentage || 0).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Course</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.course.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.course.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.components.course.percentage || 0).toFixed(
                        1
                      )}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Class</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.class.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.class.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.components.class.percentage || 0).toFixed(
                        1
                      )}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Connections</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.connections.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.connections.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.connections.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Prize</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.prize.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.prize.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.components.prize.percentage || 0).toFixed(
                        1
                      )}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Weight</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.weight.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.weight.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.components.weight.percentage || 0).toFixed(
                        1
                      )}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Draw</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.draw.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.draw.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.components.draw.percentage || 0).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Seasonal</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.seasonal.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.seasonal.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.seasonal.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">
                      Connection Combo
                    </td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.connectionCombo.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.connectionCombo.maxScore.toFixed(
                        1
                      )}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.connectionCombo.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Market</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.market.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.market.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.components.market.percentage || 0).toFixed(
                        1
                      )}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Margins</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.margins.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.margins.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.components.margins.percentage || 0).toFixed(
                        1
                      )}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">
                      Form Progression
                    </td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.formProgression.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.formProgression.maxScore.toFixed(
                        1
                      )}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.formProgression.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Track Config</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.trackConfig.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.trackConfig.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.trackConfig.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Official Rating</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.officialRating.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.officialRating.maxScore.toFixed(
                        1
                      )}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.officialRating.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Consistency</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.consistency.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.consistency.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.consistency.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Layoff</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.layoff.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.layoff.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.components.layoff.percentage || 0).toFixed(
                        1
                      )}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Weight Trend</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.weightTrend.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.weightTrend.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.weightTrend.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Course Distance</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.courseDistance.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.courseDistance.maxScore.toFixed(
                        1
                      )}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.courseDistance.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Sentiment</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.sentiment.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.sentiment.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.sentiment.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Pace</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.pace.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.pace.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.components.pace.percentage || 0).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Head Gear</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.headGear.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.headGear.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.headGear.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Field Size</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.fieldSize.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.fieldSize.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.fieldSize.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Time of Day</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.timeOfDay.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.timeOfDay.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.timeOfDay.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Weather</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.weather.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.weather.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.components.weather.percentage || 0).toFixed(
                        1
                      )}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Travel Distance</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.travelDistance.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.travelDistance.maxScore.toFixed(
                        1
                      )}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.travelDistance.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Age Profile</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.ageProfile.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.ageProfile.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.ageProfile.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Competitiveness</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.competitiveness.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.competitiveness.maxScore.toFixed(
                        1
                      )}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.competitiveness.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Bounce</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.bounce.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.bounce.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(horse.score.components.bounce.percentage || 0).toFixed(
                        1
                      )}
                      %
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-500">
                    <td className="py-2 px-2 text-gray-300">Improvement</td>
                    <td className="py-2 px-2 text-white">
                      {horse.score.components.improvement.score.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {horse.score.components.improvement.maxScore.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-gray-400">
                      {(
                        horse.score.components.improvement.percentage || 0
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
