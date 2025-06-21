"use client";

import { FormObj, RaceTactics } from "@/types/racing";

export interface FormProps {
  formObj: FormObj;
}

export const Form = ({ formObj }: FormProps) => {
  if (!formObj.form || formObj.form.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic">No form data available</div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDistance = (yards?: number) => {
    if (!yards) return "N/A";
    const furlongs = yards / 220;
    if (furlongs < 8) {
      return `${furlongs.toFixed(1)}f`;
    } else {
      const miles = Math.floor(furlongs / 8);
      const remainingFurlongs = furlongs % 8;
      if (remainingFurlongs === 0) {
        return `${miles}m`;
      } else {
        return `${miles}m ${remainingFurlongs.toFixed(1)}f`;
      }
    }
  };

  const getPositionColor = (position?: string) => {
    if (!position) return "text-gray-400";
    const pos = parseInt(position);
    if (pos === 1) return "text-green-400 font-semibold";
    if (pos === 2) return "text-blue-400 font-semibold";
    if (pos === 3) return "text-yellow-400 font-semibold";
    return "text-gray-300";
  };

  const formatOdds = (oddsDesc?: string, oddsValue?: number) => {
    if (oddsDesc) return oddsDesc;
    if (oddsValue) return oddsValue.toString();
    return "N/A";
  };

  const formatWeight = (weightCarried?: number, weightAllowance?: number) => {
    if (!weightCarried) return "N/A";
    let result = `${weightCarried}lb`;
    if (weightAllowance && weightAllowance !== 0) {
      result += ` (${weightAllowance > 0 ? "+" : ""}${weightAllowance}lb)`;
    }
    return result;
  };

  const formatRaceTactics = (raceTactics?: RaceTactics) => {
    if (!raceTactics) return "N/A";
    const tactics = [];
    if (raceTactics.actual?.runnerAttribDescription) {
      tactics.push(`Actual: ${raceTactics.actual.runnerAttribDescription}`);
    }
    if (raceTactics.predicted?.runnerAttribDescription) {
      tactics.push(
        `Predicted: ${raceTactics.predicted.runnerAttribDescription}`
      );
    }
    return tactics.length > 0 ? tactics.join(" | ") : "N/A";
  };

  const formatOtherHorse = (otherHorse?: {
    styleName?: string;
    horseUid?: number;
    weightCarriedLbs?: number;
  }) => {
    if (!otherHorse) return "N/A";
    const parts = [];
    if (otherHorse.styleName) parts.push(otherHorse.styleName);
    if (otherHorse.weightCarriedLbs)
      parts.push(`${otherHorse.weightCarriedLbs}lb`);
    return parts.length > 0 ? parts.join(" ") : "N/A";
  };

  return (
    <div className="space-y-4">
      <h5 className="font-medium text-white">Recent Form</h5>

      <div className="overflow-x-auto max-w-full">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-600 rounded-lg">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-800 z-10">
                    Date/Time
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Race Title
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Going
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Runners
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Jockey
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Odds
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Odds Value
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    RPR
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    OR
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    TS
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Prize
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Draw
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Headgear
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Distance to Winner
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Race Tactics
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Other Horse
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Comment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-700 divide-y divide-gray-600">
                {formObj.form?.map((entry, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-600 transition-colors"
                  >
                    <td className="px-3 py-3 whitespace-nowrap text-sm  sticky left-0 bg-gray-700 z-10">
                      <div>{formatDate(entry.raceDatetime)}</div>
                      <div className="text-xs text-gray-400">
                        {formatTime(entry.raceDatetime)}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      <div className="font-medium text-white">
                        {entry.courseName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {entry.courseRegion}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-400 max-w-xs">
                      <div className="truncate">{entry.raceGroupDesc}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {formatDistance(entry.distanceYard)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {entry.goingTypeServicesDesc || "N/A"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {entry.raceClass || "N/A"}
                    </td>
                    <td
                      className={`px-3 py-3 whitespace-nowrap text-sm ${getPositionColor(
                        entry.raceOutcomeCode
                      )}`}
                    >
                      {entry.raceOutcomeCode || "N/A"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {entry.noOfRunners || "N/A"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {formatWeight(
                        entry.weightCarriedLbs,
                        entry.weightAllowanceLbs
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      <div className="text-white">{entry.jockeyShortName}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {formatOdds(entry.oddsDesc, entry.oddsValue)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {entry.oddsValue ? entry.oddsValue.toFixed(2) : "N/A"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {entry.rpPostmark || "N/A"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {entry.officialRatingRanOff || "N/A"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {entry.rpTopspeed || "N/A"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {entry.prizeSterling
                        ? `£${entry.prizeSterling.toLocaleString()}`
                        : "N/A"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {entry.draw || "N/A"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {entry.horseHeadGear || "N/A"}
                      {entry.firstTimeHeadgear && (
                        <span className="ml-1 text-xs text-yellow-400">
                          (1st time)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400">
                      {entry.distanceToWinner || "N/A"}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-400 max-w-xs">
                      <div className="truncate">
                        {formatRaceTactics(entry.raceTactics)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-400 max-w-xs">
                      <div className="truncate">
                        {formatOtherHorse(entry.otherHorse)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-400 max-w-xs">
                      <div className="truncate">
                        {entry.rpCloseUpComment || "N/A"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {formObj.raceRecords && (
        <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
          <h6 className="font-medium text-blue-300 mb-2">Career Records</h6>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {formObj.raceRecords.lifetimeRecords && (
              <>
                {formObj.raceRecords.lifetimeRecords["Rules Races"] && (
                  <div>
                    <span className="font-medium text-blue-300">Flat:</span>
                    <span className="ml-2 text-blue-200">
                      {formObj.raceRecords.lifetimeRecords["Rules Races"]
                        .starts || 0}{" "}
                      runs,
                      {formObj.raceRecords.lifetimeRecords["Rules Races"]
                        .wins || 0}{" "}
                      wins
                    </span>
                  </div>
                )}
                {formObj.raceRecords.lifetimeRecords["All-weather"] && (
                  <div>
                    <span className="font-medium text-blue-300">AW:</span>
                    <span className="ml-2 text-blue-200">
                      {formObj.raceRecords.lifetimeRecords["All-weather"]
                        .starts || 0}{" "}
                      runs,
                      {formObj.raceRecords.lifetimeRecords["All-weather"]
                        .wins || 0}{" "}
                      wins
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
