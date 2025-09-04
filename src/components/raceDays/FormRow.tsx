import { countCommentSentimentObj } from "@/lib/utils";
import {
  FormObj,
  Horse as HorseType,
  Race as RaceType,
  Meeting as MeetingType,
} from "@/types/raceday";
import { JSX } from "react";

interface FormProps {
  form: FormObj;
  horse: HorseType;
  race: RaceType;
  meeting: MeetingType;
}

export function FormRow({ form, horse }: FormProps) {
  const {
    distanceF: formDistanceF,
    goingCodes: formGoingCodes,
    jockey,
    raceTypeCode: formRaceRaceCode,
    racedAgainstInfo,
    racedAgainstRaw,
    racedAgainst_BeatenInfo,
    rpr,
    timePerFurlong,
    trackId: formTrackId,
    raceDate,
    position,
    comment,
    commentMatchedTerms,
  } = form;

  console.log(horse.name, { commentMatchedTerms });
  const countCommentSentiment = countCommentSentimentObj(commentMatchedTerms);
  return (
    <tr className="">
      <td className="px-4 py-2 ">{raceDate}</td>
      <td className={"px-4 py-2"}>{formTrackId}</td>
      <td className="px-4 py-2 ">
        {position} | {racedAgainstRaw?.length}
      </td>
      <td className="px-4 py-2 ">{formRaceRaceCode}</td>
      <td className="px-4 py-2 ">{formGoingCodes}</td>
      <td className="px-4 py-2 ">{jockey}</td>

      <td className="px-4 py-2 ">{formDistanceF?.toFixed(2)}</td>
      <td className="px-4 py-2 ">{timePerFurlong?.toFixed(2)}</td>

      <td className="px-4 py-2 ">{rpr}</td>

      <td className="px-4 py-2 ">
        {racedAgainstInfo.averages.rpr?.toFixed(2)}
      </td>
      <td className="px-4 py-2 ">{racedAgainstInfo.maxes.rpr?.toFixed(2)}</td>
      <td className="px-4 py-2 ">
        {racedAgainst_BeatenInfo.averages.rpr?.toFixed(2)}
      </td>
      <td className="px-4 py-2 ">
        {racedAgainst_BeatenInfo.maxes.rpr?.toFixed(2)}
      </td>
      <td className="px-4 py-2 ">
        {countCommentSentiment.score}
        {commentMatchedTerms?.eyecatcher?.length > 0 && (
          <span style={{ color: "#2dd4bf", marginRight: "4px" }}>⭐</span>
        )}
        {commentMatchedTerms?.hampered?.length > 0 && (
          <span style={{ color: "#fb923c", marginRight: "4px" }}>⚠️</span>
        )}
        {renderCommentWithHighlights(comment, commentMatchedTerms)}
      </td>
    </tr>
  );
}
export function renderCommentWithHighlights(
  comment: string | undefined,
  matchedTerms:
    | {
        hampered: string[];
        eyecatcher: string[];
        positive: string[];
        negative: string[];
      }
    | undefined
) {
  if (!comment) return "-";
  if (!matchedTerms) return comment;

  // Find all matches and their positions
  type Match = {
    start: number;
    end: number;
    type: "positive" | "negative" | "hampered" | "eyecatcher" | "bad";
  };

  const matches: Match[] = [];

  // Helper to find all occurrences of terms
  const findTerms = (terms: string[], type: Match["type"]) => {
    terms.forEach((term) => {
      const termLower = term.toLowerCase();
      const commentLower = comment.toLowerCase();
      let pos = 0;
      while ((pos = commentLower.indexOf(termLower, pos)) !== -1) {
        matches.push({
          start: pos,
          end: pos + term.length,
          type,
        });
        pos += 1;
      }
    });
  };

  findTerms(matchedTerms.positive, "positive");
  findTerms(matchedTerms.negative, "negative");
  findTerms(matchedTerms.hampered, "hampered");
  findTerms(matchedTerms.eyecatcher, "eyecatcher");

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start);

  // Build result by going through matches in order
  const result: JSX.Element[] = [];
  let lastEnd = 0;

  matches.forEach((match, i) => {
    // Add non-matching text before this match
    if (match.start > lastEnd) {
      result.push(
        <span key={`text-${i}`}>{comment.substring(lastEnd, match.start)}</span>
      );
    }

    // Add the matched text with appropriate color
    const color =
      match.type === "positive"
        ? "#4ade80"
        : match.type === "negative" || match.type === "bad"
        ? "#ef4444"
        : match.type === "hampered"
        ? "#fb923c"
        : match.type === "eyecatcher"
        ? "#facc15"
        : undefined;

    result.push(
      <span key={`match-${i}`} style={{ color }}>
        {comment.substring(match.start, match.end)}
      </span>
    );

    lastEnd = match.end;
  });

  // Add any remaining text after last match
  if (lastEnd < comment.length) {
    result.push(<span key="text-final">{comment.substring(lastEnd)}</span>);
  }

  return <>{result}</>;
}
