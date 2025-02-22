import {
  DayTips,
  GytoTip,
  Meeting,
  NapsTableTip,
  Race,
  RaceResults,
} from "@/types/racing";
import { normalizeTime } from "../DayPredictions";
import { cleanName } from "@/app/rp/utils/fetchRaceAccordion";

interface CompactRaceRowProps {
  isTodayOrPast: boolean;
  index: number;
  race: Race;
  meeting: Meeting;

  results: RaceResults | undefined;
  tips: DayTips | null;
  gytoTips: GytoTip[] | undefined;
  napsTableTips: NapsTableTip[] | undefined;
}

export function CompactRaceRow({
  isTodayOrPast,
  index,
  race,
  meeting,
  results,
  tips,
  gytoTips,
  napsTableTips,
}: CompactRaceRowProps) {
  console.log("CompactRaceRow", {
    isTodayOrPast,
    index,
    race,
    meeting,
    results,
    tips,
    gytoTips,
    napsTableTips,
  });
  // Add helper function to normalize time format
  //console.log("tips", tips);
  //console.log("napsTableTips", napsTableTips);
  //console.log("gytoTips", gytoTips);
  // Get top prediction by score
  //console.log("Getting top scorer for race:", race.time);

  const topScorer = race?.horses?.sort(
    (a, b) =>
      (b.score?.total?.percentage || 0) - (a.score?.total?.percentage || 0)
  )[0];

  const topPercentage = race?.horses?.sort(
    (a, b) =>
      (b.score?.total?.percentage || 0) - (a.score?.total?.percentage || 0)
  )?.[0]?.score?.total?.percentage;
  const fivePercentOffTop = topPercentage ? topPercentage * 0.95 : undefined;

  const topScorerLarge = race.horses
    ?.filter((x) => {
      const odds = race.bettingForecast?.find(
        (y) => cleanName(y.horseName) === cleanName(x.name)
      )?.decimalOdds;

      return (
        fivePercentOffTop &&
        x.score?.total?.percentage &&
        x.score?.total?.percentage >= fivePercentOffTop &&
        Boolean(odds) &&
        odds &&
        odds >= 10
      );
    })
    .sort(
      (a, b) =>
        (b.score?.total?.percentage || 0) - (a.score?.total?.percentage || 0)
    )[0];
  // console.log("Top scorer:", topScorer?.name, {
  //   temp: race.horses
  //     ?.filter((x) => {
  //       const odds = race.bettingForecast?.find(
  //         (y) => cleanName(y.horseName) === cleanName(x.name)
  //       )?.decimalOdds;

  //       return Boolean(odds) && odds && odds > 10;
  //     })
  //     .sort(
  //       (a, b) =>
  //         (b.score?.total?.percentage || 0) - (a.score?.total?.percentage || 0)
  //     ),
  // });

  // Get top model prediction
  //console.log("Getting model predictions");
  const sortedPredictions = Object.values(race.predictions || {}).sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  const topPrediction = sortedPredictions[0];
  const topPredictionNum = topPrediction?.score || 0;
  const secondPredictionNum = sortedPredictions[1]?.score || 0;
  //console.log("Top prediction:", topPrediction?.name);

  const predictionGap = topPredictionNum - secondPredictionNum;
  //console.log("Prediction gap:", predictionGap);

  // Get verdict selection
  //console.log("Getting verdict selection");
  const verdictPick = race.raceExtraInfo?.verdict?.selection;
  const isNap = race.raceExtraInfo?.verdict?.isNap;
  //console.log("Verdict pick:", verdictPick, "Is nap:", isNap);

  // Get ATR tip for this race
  //console.log("Getting ATR tip");
  const atrTipSelections = tips?.atrTips
    ?.flatMap((m) => m.races)
    ?.find(
      (r) => normalizeTime(r.time) === normalizeTime(race.time)
    )?.selections;

  const atrTipSelectionObj = atrTipSelections?.[0];
  const atrTipSelection = atrTipSelectionObj?.horse;
  const atrTipSelectionOdds = atrTipSelection
    ? race.bettingForecast?.find(
        (x) => cleanName(x.horseName) === cleanName(atrTipSelection)
      )?.decimalOdds
    : 0;

  const timeformTipSelections = tips?.timeformTips
    ?.flatMap((m) => m.races)
    ?.find(
      (r) => normalizeTime(r.time) === normalizeTime(race.time)
    )?.selections;

  //console.log("timeformTipSelections", timeformTipSelections);
  const timeformTipSelectionObj = timeformTipSelections?.[0];
  const timeformTipSelection = timeformTipSelectionObj?.horse;
  const timeformTipSelectionOdds = timeformTipSelection
    ? race.bettingForecast?.find(
        (x) => cleanName(x.horseName) === cleanName(timeformTipSelection)
      )?.decimalOdds
    : 0;

  //console.log("Getting GYTO tip", gytoTips);
  const gytoTipSelectionObj = gytoTips?.find(
    (r) => normalizeTime(r.time) === normalizeTime(race.time)
  );
  const gytoTipSelection = gytoTipSelectionObj?.horse;
  //console.log("GYTO tip selection:", gytoTipSelection);

  //console.log("Getting GYTO tip odds");
  const gytoTipSelectionOdds = gytoTipSelection
    ? race.bettingForecast?.find(
        (x) => cleanName(x.horseName) === cleanName(gytoTipSelection)
      )?.decimalOdds
    : 0;
  //console.log("GYTO tip odds:", gytoTipSelectionOdds);

  //console.log("Getting Naps Table tip");
  const napsTableTipSelections = napsTableTips?.filter(
    (r) => normalizeTime(r.time) === normalizeTime(race.time)
  );
  //console.log("Naps Table tip selections:", napsTableTipSelections);

  const napsTableTipSelectionObj = napsTableTipSelections?.sort(
    (a, b) => (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0)
  )[0];
  const napsTableTipSelection = napsTableTipSelectionObj?.horse;
  //console.log("Naps Table tip selection:", napsTableTipSelection);
  const napsTableTipSelectionOdds = napsTableTipSelection
    ? race.bettingForecast?.find(
        (x) => cleanName(x.horseName) === cleanName(napsTableTipSelection)
      )?.decimalOdds
    : 0;
  //console.log("Naps Table tip odds:", napsTableTipSelectionOdds);

  // Find matching result for this race
  // Find matching result for this race
  //console.log("Finding race result", race.time, results?.results);

  const raceResult = results?.results.find(
    (r) => normalizeTime(r.time) === normalizeTime(race.time)
  );
  //console.log("Race result found:", raceResult, !!raceResult);

  // Helper function to get trophy emoji
  const getTrophy = (position: string) => {
    //console.log("Getting trophy for position:", position);
    switch (position.toLowerCase()) {
      case "1st":
        return "🏆";
      case "2nd":
        return "🥈";
      case "3rd":
        return "🥉";
      default:
        return "";
    }
  };

  // Helper function to get position for a horse
  const getHorsePosition = (horseName: string) => {
    //console.log("Getting position for horse:", horseName);
    if (!raceResult) return "";

    if (cleanName(raceResult.winner.name) === cleanName(horseName)) {
      //console.log("Horse was winner");
      return "1st";
    }

    const placed = raceResult.placedHorses.find(
      (h) => cleanName(h.name) === cleanName(horseName)
    );
    //console.log("Horse placed:", placed?.position);
    return placed?.position || "";
  };

  // Update allTheSame check to include GG tip

  const allPredictionsPicks = [
    topPrediction?.name,
    topScorer?.name,
    verdictPick,
    atrTipSelection,
    timeformTipSelection,
    gytoTipSelection,
    napsTableTipSelection,
  ];
  const allTheSame = allPredictionsPicks
    .filter((x) => x)

    .map((name) => (name ? cleanName(name) : ""))
    .every((val, _, arr) => val === arr[0]);

  // Check if 3 or more picks match
  const matchCount = [
    topPrediction?.name,
    verdictPick,
    atrTipSelection,
    timeformTipSelection,
    gytoTipSelection,
    napsTableTipSelection,
  ]
    .filter((x) => x)
    .map((name) => (name ? cleanName(name) : ""))
    .filter((x) => x === cleanName(topScorer?.name))
    .reduce((count, val, _, arr) => {
      const matches = arr.filter((x) => x === val).length;
      return matches >= count ? matches : count;
    }, 0);

  const threeOrMoreMatch = matchCount >= 3;
  // console.log(
  //   "Three or more picks match:",
  //   topScorer?.name,
  //   matchCount,
  //   [
  //     topPrediction?.name,
  //     verdictPick,
  //     atrTipSelection,
  //     timeformTipSelection,
  //     gytoTipSelection,
  //     napsTableTipSelection,
  //   ],
  //   threeOrMoreMatch
  // );
  // Update someTheSame to include GG tip
  const someTheSame = [
    topPrediction?.name,
    verdictPick,
    atrTipSelection,
    timeformTipSelection,
    gytoTipSelection,
    napsTableTipSelection,
  ]
    .filter((x) => x)
    .map((name) => (name ? cleanName(name) : ""))

    .some((val) => val === cleanName(topScorer?.name));
  //console.log("Some picks match:", someTheSame);

  //console.log("Getting odds");
  const verdictOdds = race.bettingForecast?.find(
    (x) => cleanName(x.horseName) === cleanName(verdictPick || "")
  )?.decimalOdds;

  const topScorerOdds = race.bettingForecast?.find(
    (x) => cleanName(x.horseName) === cleanName(topScorer?.name)
  )?.decimalOdds;

  const topScorerLargeOdds = race.bettingForecast?.find(
    (x) => cleanName(x.horseName) === cleanName(topScorerLarge?.name)
  )?.decimalOdds;

  const topPredictionOdds = race.bettingForecast?.find(
    (x) => cleanName(x.horseName) === cleanName(topPrediction?.name)
  )?.decimalOdds;

  //console.log("Verdict odds:", verdictOdds);
  //console.log("Top scorer odds:", topScorerOdds);
  //console.log("Top prediction odds:", topPredictionOdds);

  // Get positions and trophies for each pick
  //console.log("Getting positions and trophies");
  const topScorerPosition = topScorer ? getHorsePosition(topScorer?.name) : "";
  const topScorerTrophy = getTrophy(topScorerPosition);
  const topPredictionPosition = topPrediction
    ? getHorsePosition(topPrediction.name)
    : "";

  const topScorerLargePosition = topScorerLarge
    ? getHorsePosition(topScorerLarge?.name)
    : "";

  const topScorerLargeTrophy = getTrophy(topScorerLargePosition);
  const topPredictionTrophy = getTrophy(topPredictionPosition);
  const verdictPosition = verdictPick ? getHorsePosition(verdictPick) : "";
  const verdictTrophy = getTrophy(verdictPosition);

  const atrTipPosition = atrTipSelection
    ? getHorsePosition(atrTipSelection)
    : "";
  const atrTipTrophy = getTrophy(atrTipPosition);

  const timeformTipPosition = timeformTipSelection
    ? getHorsePosition(timeformTipSelection)
    : "";
  const timeformTipTrophy = getTrophy(timeformTipPosition);

  const gytoTipPosition = gytoTipSelection
    ? getHorsePosition(gytoTipSelection)
    : "";
  const gytoTipTrophy = getTrophy(gytoTipPosition);

  const napsTableTipPosition = napsTableTipSelection
    ? getHorsePosition(napsTableTipSelection)
    : "";
  const napsTableTipTrophy = getTrophy(napsTableTipPosition);

  return (
    <div
      className={`flex justify-between p-1 rounded ${
        index % 2 === 0 ? "bg-[#222440]" : ""
      }`}
    >
      <div className="flex gap-[0.1rem] w-20 items-center">
        <span className="font-semibold w-8 text-xs">{race.time}</span>
        {someTheSame && (
          <span className="text-yellow-400" title="Some picks agree">
            ★
          </span>
        )}
        {threeOrMoreMatch && (
          <span className="text-yellow-400" title="Some picks agree">
            ★
          </span>
        )}

        {allTheSame && (
          <span className="text-yellow-400" title="All picks agree">
            ★
          </span>
        )}
        {someTheSame && (topScorerOdds || 0) >= 6 && (
          <span className="text-blue-400" title="High odds agreement">
            ★
          </span>
        )}
      </div>

      <div
        className={`w-full flex-1 grid ${
          isTodayOrPast ? "grid-cols-8" : "grid-cols-6"
        } gap-2 items-baseline text-sm`}
      >
        <div
          className="flex items-center gap-2"
          title={"Top Scorer: " + race?.raceComment}
        >
          {topScorer ? (
            <span
              className={`font-medium ${
                (topScorer.score?.total?.percentage || 0) >= 58
                  ? "text-yellow-400 font-bold"
                  : (topScorer.score?.total?.percentage || 0) < 40
                  ? "text-[#626262]"
                  : "*:"
              }`}
            >
              {topScorer.name} {topScorerTrophy}{" "}
              {topScorer.score?.total?.percentage.toFixed(1)}{" "}
              {(topScorerOdds || 0) >= 0 ? (
                <span
                  className={(topScorerOdds || 0) >= 6 ? "text-blue-400" : ""}
                >
                  {topScorerOdds}
                </span>
              ) : (
                <></>
              )}
            </span>
          ) : (
            <>-</>
          )}
        </div>
        <div
          className="flex items-center gap-2"
          title={"Top Scorer: " + race?.raceComment}
        >
          {topScorerLarge ? (
            <span
              className={`font-medium ${
                (topScorerLarge.score?.total?.percentage || 0) >= 58
                  ? "text-yellow-400 font-bold"
                  : (topScorerLarge.score?.total?.percentage || 0) < 40
                  ? "text-[#626262]"
                  : "*:"
              }`}
            >
              {topScorerLarge.name} {topScorerLargeTrophy}{" "}
              {topScorerLarge.score?.total?.percentage.toFixed(1)}{" "}
              {(topScorerLargeOdds || 0) >= 0 ? (
                <span
                  className={
                    (topScorerLargeOdds || 0) >= 6 ? "text-blue-400" : ""
                  }
                >
                  {topScorerLargeOdds}
                </span>
              ) : (
                <></>
              )}
            </span>
          ) : (
            <>-</>
          )}
        </div>

        {topPrediction && (
          <div
            className="flex items-center gap-2"
            title={
              "RP Prediction: " +
              sortedPredictions
                ?.map((x) => x.name + ":" + x.score?.toFixed(1))
                ?.join(", ")
            }
          >
            <span
              className={`font-medium ${
                predictionGap >= 10 ? "text-yellow-400 font-bold" : ""
              }`}
            >
              {topPrediction?.name} {topPredictionTrophy}
              {(topPredictionOdds || 0) >= 6 ? (
                <span
                  className={
                    (topPredictionOdds || 0) >= 6 ? "text-blue-400" : ""
                  }
                >
                  {topPredictionOdds}
                </span>
              ) : (
                <></>
              )}
            </span>
          </div>
        )}
        {verdictPick && (
          <div
            className="flex items-center gap-2"
            title={"RP Verdict: " + race.raceExtraInfo?.verdict?.comment}
          >
            <span
              className={`font-medium ${
                isNap ? "text-yellow-400 font-bold" : ""
              }`}
            >
              {verdictPick} {verdictTrophy}{" "}
              {(verdictOdds || 0) >= 6 ? (
                <span
                  className={(verdictOdds || 0) >= 6 ? "text-blue-400" : ""}
                >
                  {verdictOdds}
                </span>
              ) : (
                <></>
              )}
            </span>
          </div>
        )}
        {atrTipSelection && (
          <div
            className="flex items-center gap-2"
            title={"ATR: " + atrTipSelectionObj?.comment}
          >
            <span className="font-medium">
              {atrTipSelection} {atrTipTrophy}{" "}
              {(atrTipSelectionOdds || 0) >= 6 ? (
                <span
                  className={
                    (atrTipSelectionOdds || 0) >= 6 ? "text-blue-400" : ""
                  }
                >
                  {atrTipSelectionOdds}
                </span>
              ) : (
                <></>
              )}
            </span>
          </div>
        )}

        {timeformTipSelection && (
          <div
            className="flex items-center gap-2"
            title={"Timeform: " + timeformTipSelectionObj?.comment}
          >
            <span className="font-medium">
              {timeformTipSelectionObj?.horse} {timeformTipTrophy}{" "}
              {(timeformTipSelectionOdds || 0) >= 6 ? (
                <span
                  className={
                    (timeformTipSelectionOdds || 0) >= 6 ? "text-blue-400" : ""
                  }
                >
                  {timeformTipSelectionOdds}
                </span>
              ) : (
                <></>
              )}
            </span>
          </div>
        )}
        {gytoTipSelection && (
          <div className="flex items-center gap-2" title={"GYTP"}>
            <span
              className={`font-medium ${
                gytoTipSelectionObj?.isNap ? "text-yellow-400 font-bold" : ""
              }`}
            >
              {gytoTipSelection} {gytoTipTrophy}{" "}
              {(gytoTipSelectionOdds || 0) >= 6 ? (
                <span className="text-blue-400">{gytoTipSelectionOdds}</span>
              ) : (
                <></>
              )}
            </span>
          </div>
        )}
        {napsTableTipSelection && (
          <div className="flex items-center gap-2" title={"Naps Table"}>
            <span
              className={`font-medium ${
                parseFloat(napsTableTipSelectionObj?.score) >= 0
                  ? "text-yellow-400 font-bold"
                  : ""
              }`}
            >
              {napsTableTipSelection} {napsTableTipTrophy}{" "}
              {(napsTableTipSelectionOdds || 0) >= 6 ? (
                <span className="text-blue-400">
                  {napsTableTipSelectionOdds}
                </span>
              ) : (
                <></>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
