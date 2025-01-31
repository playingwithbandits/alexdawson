"use client";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { FormObj, GoingRecord, Horse, HorseStats } from "@/types/racing";
import { useState } from "react";
import { AccordionButton } from "./accordions/AccordionButton";
import { AccordionContent } from "./accordions/AccordionContent";

interface HorseRowProps {
  horse: Horse;
  score?: number;
}

export function HorseRow({ horse, score }: HorseRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="predictions-table">
      <AccordionButton
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center w-full px-4 py-3">
          <div className="flex gap-2 items-center">
            <span className="font-bold w-8">{horse.number}</span>
            <span>{horse.name}</span>
          </div>
          <div className="font-semibold">{score?.toFixed(1)}</div>
        </div>
      </AccordionButton>
      <AccordionContent isExpanded={isExpanded}>
        <div className="space-y-4 p-6 border-t">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-500">Age/Sex</span>
              <span className="font-medium">{horse.age}yo</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">Weight</span>
              <span className="font-medium">
                {horse.weight.display} ({horse.weight.pounds}lb)
                {horse.jockey.allowance ? ` (${horse.jockey.allowance}lb)` : ""}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">Official Rating</span>
              <span className="font-medium">
                {horse.officialRating || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">Draw</span>
              <span className="font-medium">
                {horse.draw ? `Stall ${horse.draw}` : "N/A"}
              </span>
            </div>
          </div>

          {/* Connections */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Connections</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Jockey</span>
                  <span className="font-medium">{horse.jockey.name}</span>
                  <span className="text-xs text-gray-500">
                    {horse.jockey.allowance
                      ? `Claims ${horse.jockey.allowance}`
                      : ""}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Trainer</span>
                  <span className="font-medium">{horse.trainer.name}</span>
                  <span className="text-xs text-gray-500">
                    {horse.trainer.stats || "No recent stats"}
                  </span>
                </div>
                <div className="flex flex-col mt-2">
                  <span className="text-gray-500">Owner</span>
                  <span className="font-medium">{horse.owner}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Form & Equipment</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Head Gear</span>
                  <span className="font-medium">
                    {horse.headGear?.description || "None"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Form</span>
                  <span className="font-medium">{horse.form || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Last Run</span>
                  <span className="font-medium">{horse.lastRun || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Rating</span>
                  <span className="font-medium">{horse.rating || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Tables */}
          <div className="grid grid-cols-2 gap-4">
            <StatsTable title="Performance" data={getPerformanceStats(horse)} />
            <StatsTable
              title="Form"
              data={getFormStats(horse.stats, horse.formObj)}
            />
            <StatsTable
              title="Course & Distance"
              data={getCourseDistanceStats(horse.stats)}
            />
          </div>
          {horse.formObj && (
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Recent Form</h3>
              <Table>
                <thead>
                  <tr className="">
                    <th className="p-2">Date</th>
                    <th className="p-2">Course</th>
                    <th className="p-2">Dist</th>
                    <th className="p-2">Going</th>
                    <th className="p-2">Class</th>
                    <th className="p-2">Pos</th>
                    <th className="p-2">Btn</th>
                    <th className="p-2">Weight</th>
                    <th className="p-2">OR</th>
                    <th className="p-2">RPR</th>
                    <th className="p-2">TS</th>
                    <th className="p-2">Runners</th>
                    <th className="p-2">Race Value</th>
                    <th className="p-2">Prize Won</th>
                    <th className="p-2">Comment</th>
                  </tr>
                </thead>
                <TableBody>
                  {horse.formObj?.form?.map((form, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {new Date(form.raceDatetime || "").toLocaleDateString()}
                      </TableCell>
                      <TableCell>{form.courseName}</TableCell>
                      <TableCell>{`${form.distanceFurlong}f`}</TableCell>
                      <TableCell>{form.goingTypeServicesDesc}</TableCell>
                      <TableCell>Class {form.raceClass || "-"}</TableCell>
                      <TableCell className="font-medium">
                        {form.raceOutcomeCode}
                      </TableCell>
                      <TableCell>{form.distanceToWinner || "-"}</TableCell>
                      <TableCell>{form.weightCarriedLbs}lb</TableCell>
                      <TableCell>{form.officialRatingRanOff || "-"}</TableCell>
                      <TableCell>{form.rpPostmark || "-"}</TableCell>
                      <TableCell>{form.rpTopspeed || "-"}</TableCell>
                      <TableCell>{form.noOfRunners || "-"}</TableCell>
                      <TableCell>
                        £{form.prizeSterling?.toLocaleString() || "-"}
                      </TableCell>
                      <TableCell>
                        {form.raceOutcomeCode === "1"
                          ? `£${form.prizeSterling?.toLocaleString() || "-"}`
                          : "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {form.rpCloseUpComment || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </AccordionContent>
    </div>

    // <Accordion type="single" collapsible className="bg-white rounded-lg shadow">
    //   <AccordionItem value="details" className="border-none">
    //     <AccordionTrigger className="grid grid-cols-8 gap-2 px-4 py-3 hover:bg-gray-50 transition-colors">
    //       <div className="font-bold">{horse.number}</div>
    //       <div className="col-span-2">{horse.name}</div>
    //       <div>{horse.age}</div>
    //       <div>{horse.weight.display}</div>
    //       <div>{horse.jockey.name}</div>
    //       <div>{horse.trainer.name}</div>
    //       <div className="font-semibold text-blue-600">{score?.toFixed(1)}</div>
    //     </AccordionTrigger>
    //     <AccordionContent className="border-t">
    //       <div className="space-y-4 p-6 bg-gray-50">
    //         <div className="grid grid-cols-2 gap-4">
    //           <StatsTable title="Basic Info" data={getBasicInfo(horse)} />
    //           <StatsTable
    //             title="Performance"
    //             data={getPerformanceStats(horse.stats)}
    //           />
    //           <StatsTable title="Form" data={getFormStats(horse.stats)} />
    //           <StatsTable
    //             title="Course & Distance"
    //             data={getCourseDistanceStats(horse.stats)}
    //           />
    //         </div>
    //       </div>
    //     </AccordionContent>
    //   </AccordionItem>
    // </Accordion>
  );
}

function StatsTable({
  title,
  data,
}: {
  title: string;
  data: Record<string, any>;
}) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <Table>
        <TableBody>
          {Object.entries(data).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell className="font-medium">{key}</TableCell>
              <TableCell>{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function getPerformanceStats(horse: Horse) {
  const stats = horse.stats;
  return {
    "Top Speed": horse.topSpeed || "N/A",
    "Official Rating": horse.officialRating || "N/A",
    Rating: horse.rating || "N/A",
    "Win Rate": stats ? `${(stats.winRate || 0).toFixed(1)}%` : "N/A",
    "Place Rate": stats ? `${(stats.placeRate || 0).toFixed(1)}%` : "N/A",
    "Total Starts": stats?.totalStarts || "N/A",
    "Total Wins": stats?.totalWins || "N/A",
    "Form Trend": stats?.recentFormTrend || "N/A",
    "Avg Position (Last 6)": stats?.avgPositionLastSix?.toFixed(1) || "N/A",
    "Days Since Last Run": horse.lastRun?.split(" ")[0] || "N/A",
    "Seasonal Form": stats?.seasonalForm
      ? Object.entries(stats.seasonalForm)
          .map(([season, form]) => `${season}: ${form}`)
          .join(", ")
      : "N/A",
  };
}

function getFormStats(stats?: HorseStats, formObj?: FormObj) {
  if (!stats) return {};

  const totalPrize =
    formObj?.form?.reduce(
      (sum, entry) => sum + (entry.prizeSterling || 0),
      0
    ) || 0;

  const totalWinningPrize =
    formObj?.form?.reduce(
      (sum, entry) =>
        sum +
        (entry.raceOutcomeCode && entry.raceOutcomeCode === "1"
          ? entry.prizeSterling || 0
          : 0),
      0
    ) || 0;
  const avgPrize = formObj?.form?.length ? totalPrize / formObj.form.length : 0;

  return {
    "Best RPR": stats.bestRPR,
    "Avg RPR": stats.avgRPR?.toFixed(1),
    "Best Top Speed": stats.bestTopSpeed,
    "Avg Top Speed": stats.avgTopSpeed?.toFixed(1),
    "Avg Race Value": avgPrize
      ? `£${Math.round(avgPrize).toLocaleString()}`
      : "N/A",
    "Total Race Value": totalPrize ? `£${totalPrize.toLocaleString()}` : "N/A",
    "Total Winning Prize": totalWinningPrize
      ? `£${totalWinningPrize.toLocaleString()}`
      : "N/A",
    "Days Off Track": stats.daysOffTrack,
    "Racing Frequency": stats.racingFrequency?.toFixed(1),
  };
}

function getCourseDistanceStats(stats?: HorseStats) {
  if (!stats) return {};
  const formatGoingPreference = (goingPerf?: GoingRecord[]) => {
    if (!goingPerf?.length) return "N/A";
    return goingPerf
      .map((going) => `${going.goingCode} (${going.winRate.toFixed(1)}%)`)
      .join(" / ");
  };

  return {
    "Course Wins": stats.courseForm?.wins || 0,
    "Course Places": stats.courseForm?.places || 0,
    "Course Win Rate": `${(stats.courseForm?.winRate || 0).toFixed(1)}%`,
    "Course Runs": stats.courseForm?.runs || 0,
    "Optimal Distance": `${stats.optimalDistance}f`,
    "Distance Preference": stats.distancePreference,
    "Class Level": stats.avgClassLevel?.toFixed(1),
    "Best Class": stats.preferredClass || "N/A",
    "Going Preference": formatGoingPreference(stats.goingPerformance),
  };
}
