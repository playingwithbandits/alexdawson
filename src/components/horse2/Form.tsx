"use client";

import { FormObj } from "@/types/racing";

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

  const formatDistance = (yards?: number) => {
    if (!yards) return "N/A";
    const furlongs = yards / 220;
    if (furlongs < 8) {
      return `${furlongs}f`;
    } else {
      const miles = Math.floor(furlongs / 8);
      const remainingFurlongs = furlongs % 8;
      if (remainingFurlongs === 0) {
        return `${miles}m`;
      } else {
        return `${miles}m ${remainingFurlongs}f`;
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

  return (
    <div className="space-y-4">
      <h5 className="font-medium text-white">Recent Form</h5>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-2 px-2 text-gray-300">Date</th>
              <th className="text-left py-2 px-2 text-gray-300">Course</th>
              <th className="text-left py-2 px-2 text-gray-300">Distance</th>
              <th className="text-left py-2 px-2 text-gray-300">Going</th>
              <th className="text-left py-2 px-2 text-gray-300">Class</th>
              <th className="text-left py-2 px-2 text-gray-300">Position</th>
              <th className="text-left py-2 px-2 text-gray-300">Runners</th>
              <th className="text-left py-2 px-2 text-gray-300">Weight</th>
              <th className="text-left py-2 px-2 text-gray-300">RPR</th>
              <th className="text-left py-2 px-2 text-gray-300">OR</th>
              <th className="text-left py-2 px-2 text-gray-300">TS</th>
              <th className="text-left py-2 px-2 text-gray-300">Prize</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {formObj.form?.map((entry, index) => (
              <tr key={index} className="hover:bg-gray-600">
                <td className="py-2 px-2 text-gray-400">
                  {formatDate(entry.raceDatetime)}
                </td>
                <td className="py-2 px-2 font-medium text-white">
                  {entry.courseName}
                </td>
                <td className="py-2 px-2 text-gray-400">
                  {formatDistance(entry.distanceYard)}
                </td>
                <td className="py-2 px-2 text-gray-400">
                  {entry.goingTypeServicesDesc || "N/A"}
                </td>
                <td className="py-2 px-2 text-gray-400">
                  {entry.raceClass || "N/A"}
                </td>
                <td
                  className={`py-2 px-2 ${getPositionColor(
                    entry.raceOutcomeCode
                  )}`}
                >
                  {entry.raceOutcomeCode || "N/A"}
                </td>
                <td className="py-2 px-2 text-gray-400">
                  {entry.noOfRunners || "N/A"}
                </td>
                <td className="py-2 px-2 text-gray-400">
                  {entry.weightCarriedLbs
                    ? `${entry.weightCarriedLbs}lb`
                    : "N/A"}
                </td>
                <td className="py-2 px-2 text-gray-400">
                  {entry.rpPostmark || "N/A"}
                </td>
                <td className="py-2 px-2 text-gray-400">
                  {entry.officialRatingRanOff || "N/A"}
                </td>
                <td className="py-2 px-2 text-gray-400">
                  {entry.rpTopspeed || "N/A"}
                </td>
                <td className="py-2 px-2 text-gray-400">
                  {entry.prizeSterling
                    ? `£${entry.prizeSterling.toLocaleString()}`
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
