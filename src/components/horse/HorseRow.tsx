"use client";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  FormObj,
  GoingRecord,
  Horse,
  HorseStats,
  Meeting,
  Race,
} from "@/types/racing";
import { useState } from "react";
import { AccordionButton } from "./accordions/AccordionButton";
import { AccordionContent } from "./accordions/AccordionContent";
import { ViewMode } from "./DayPredictions";
import { HorseScore } from "@/lib/racing/scores/types";

interface HorseRowProps {
  horse: Horse;
  score?: HorseScore;
  race?: Race;
  mode?: ViewMode;
  meeting?: Partial<Meeting>;
}

export function HorseRow({ horse, score, race, mode, meeting }: HorseRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="prediction-accordion">
      <AccordionButton
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center w-full px-4 py-3">
          <div className="flex gap-2 items-center">
            {mode === "list" && race && (
              <>
                <span className="font-medium w-24">{meeting?.venue}</span>
                <span className="font-medium w-12">{race.time}</span>
              </>
            )}
            <span className="font-bold w-8">{horse.number}</span>
            {race?.bettingForecast?.find((b) => b.horseName === horse.name) && (
              <span className="text-sm text-gray-400 w-12">
                {
                  race.bettingForecast.find((b) => b.horseName === horse.name)
                    ?.decimalOdds
                }
              </span>
            )}
            <span>{horse.name}</span>
          </div>
          <div className="font-semibold">
            {score?.total?.percentage?.toFixed(1)}
          </div>
        </div>
      </AccordionButton>
      <AccordionContent isExpanded={isExpanded}>
        <div className="space-y-[2rem] p-6 border-t">
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

          {/* Verdict Comment */}
          {race?.raceExtraInfo?.comments[horse.name] && (
            <div className="mt-[2rem] text-sm">
              <h3 className="font-semibold mb-2">Comment</h3>
              <p className="text-gray-300">
                {race.raceExtraInfo.comments[horse.name]}
              </p>
            </div>
          )}

          {/* Stats Tables */}
          <div className="grid grid-cols-4 gap-4 mt-[2rem]">
            <StatsTable title="Performance" data={getPerformanceStats(horse)} />
            <StatsTable
              title="Form"
              data={getFormStats(horse.stats, horse.formObj)}
            />
            <StatsTable
              title="Course & Distance"
              data={getCourseDistanceStats(horse.stats)}
            />
            <StatsTable
              title="Connections"
              data={getConnectionStats(horse, race)}
            />
            <StatsTable
              title="Track Specialties"
              data={getTrackSpecialties(horse)}
            />
          </div>
          {horse.formObj && (
            <div className="mt-[2rem]">
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
  data: Record<string, string | number | undefined>;
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

function getConnectionStats(horse: Horse, race?: Race) {
  const jockeyStats = race?.raceExtraInfo?.jockeyStats?.find(
    (j) =>
      j.jockey.toLowerCase().trim() === horse.jockey.name.toLowerCase().trim()
  );
  const trainerStats = race?.raceExtraInfo?.trainerStats?.find(
    (t) =>
      t.trainer.toLowerCase().trim() === horse.trainer.name.toLowerCase().trim()
  );

  // console.log(
  //   "🏁 jockeyStats",
  //   jockeyStats,
  //   race?.raceExtraInfo?.jockeyStats,
  //   horse.jockey.name
  // );
  // console.log(
  //   "🏁 trainerStats",
  //   trainerStats,
  //   race?.raceExtraInfo?.trainerStats,
  //   horse.trainer.name
  // );

  return {
    "Jockey Name": horse.jockey.name,
    "Jockey Claim": horse.jockey.allowance || "None",
    "Jockey 14 Day Form": jockeyStats
      ? `${jockeyStats.last14Days.wins}/${jockeyStats.last14Days.runs} (${jockeyStats.last14Days.winRate}%)`
      : "N/A",
    "Jockey 14 Day P/L": jockeyStats
      ? `${jockeyStats.last14Days.profit > 0 ? "+" : ""}${
          jockeyStats.last14Days.profit
        }`
      : "N/A",
    "Jockey Overall Form": jockeyStats
      ? `${jockeyStats.overall.wins}/${jockeyStats.overall.runs} (${jockeyStats.overall.winRate}%)`
      : "N/A",
    "Jockey Overall P/L": jockeyStats
      ? `${jockeyStats.overall.profit > 0 ? "+" : ""}${
          jockeyStats.overall.profit
        }`
      : "N/A",
    "Trainer Name": horse.trainer.name,
    "Trainer 14 Day Form": trainerStats
      ? `${trainerStats.last14Days.wins}/${trainerStats.last14Days.runs} (${trainerStats.last14Days.winRate}%)`
      : "N/A",
    "Trainer 14 Day P/L": trainerStats
      ? `${trainerStats.last14Days.profit > 0 ? "+" : ""}${
          trainerStats.last14Days.profit
        }`
      : "N/A",
    "Trainer Overall Form": trainerStats
      ? `${trainerStats.overall.wins}/${trainerStats.overall.runs} (${trainerStats.overall.winRate}%)`
      : "N/A",
    "Trainer Overall P/L": trainerStats
      ? `${trainerStats.overall.profit > 0 ? "+" : ""}${
          trainerStats.overall.profit
        }`
      : "N/A",
  };
}

function getTrackSpecialties(horse: Horse) {
  const stats = horse.stats?.raceTypeStats;
  if (!stats) return {};

  const formatStat = (stat: {
    runs: number;
    wins: number;
    winRate: number;
    placeRate: number;
  }) => {
    if (!stat.runs) return "No runs";
    return `${stat.wins}/${stat.runs} (${stat.winRate.toFixed(
      1
    )}% SR, ${stat.placeRate.toFixed(1)}% PR)`;
  };

  return {
    "Flat Form": stats.flat ? formatStat(stats.flat) : "N/A",
    "AW Form": stats.aw ? formatStat(stats.aw) : "N/A",
    "Hurdle Form": stats.hurdle ? formatStat(stats.hurdle) : "N/A",
    "Chase Form": stats.chase ? formatStat(stats.chase) : "N/A",
    "Best Surface": getBestSurface(stats),
  };
}

function getBestSurface(stats: NonNullable<Horse["stats"]>["raceTypeStats"]) {
  const surfaces = [
    { type: "Flat", stats: stats?.flat },
    { type: "All-Weather", stats: stats?.aw },
    { type: "Hurdles", stats: stats?.hurdle },
    { type: "Chase", stats: stats?.chase },
  ];

  return (
    surfaces
      .filter((s) => s.stats?.runs || 0 >= 3)
      .sort((a, b) => (b.stats?.winRate || 0) - (a.stats?.winRate || 0))
      .map((s) => `${s.type} (${s.stats?.winRate.toFixed(1)}%)`)[0] ||
    "Insufficient data"
  );
}
