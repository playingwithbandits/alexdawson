import { analyseSentimentFromComment } from "@/lib/utils";
import {
  FormObj,
  Horse as HorseType,
  Race as RaceType,
  Meeting as MeetingType,
} from "@/types/raceday";
import { time } from "console";
import { twMerge } from "tailwind-merge";

interface FormProps {
  form: FormObj;
  horse: HorseType;
  race: RaceType;
  meeting: MeetingType;
}

export function FormRow({ form, horse, race, meeting }: FormProps) {
  const { trackId } = meeting;
  const { goingCodes, distanceF, raceTypeCode, raceClass } = race;

  const {
    distanceF: formDistanceF,
    goingCodes: formGoingCodes,
    id,
    jockey,
    raceClass: formRaceClass,
    raceTypeCode: formRaceRaceCode,
    racedAgainstInfo,
    racedAgainstRaw,
    racedAgainst_Beaten,
    racedAgainst_BeatenInfo,
    rpr,
    timePerFurlong,
    totalRaceTime,
    trackId: formTrackId,
    raceDate,
    position,
    comment,
    commentMatchedTerms,
  } = form;

  console.log(horse.name, { commentMatchedTerms });
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
        bad: string[];
        eyecatcher: string[];
        positive: string[];
        negative: string[];
      }
    | undefined
) {
  if (!comment) return "-";

  if (!matchedTerms) return comment;

  return comment?.split(" ").map((word, i) => {
    const isPositiveTerm = matchedTerms.positive.some(
      (term) =>
        term.toLowerCase() === word.toLowerCase() ||
        term.toLowerCase().includes(word.toLowerCase())
    );
    const isNegativeTerm = matchedTerms.negative.some(
      (term) =>
        term.toLowerCase() === word.toLowerCase() ||
        term.toLowerCase().includes(word.toLowerCase())
    );
    const isHamperedTerm = matchedTerms.hampered.some(
      (term) =>
        term.toLowerCase() === word.toLowerCase() ||
        term.toLowerCase().includes(word.toLowerCase())
    );
    const isEyecatcherTerm = matchedTerms.eyecatcher.some(
      (term) =>
        term.toLowerCase() === word.toLowerCase() ||
        term.toLowerCase().includes(word.toLowerCase())
    );
    const isBadTerm = matchedTerms.bad.some(
      (term) =>
        term.toLowerCase() === word.toLowerCase() ||
        term.toLowerCase().includes(word.toLowerCase())
    );

    return (
      <span key={i}>
        <span
          style={{
            color: isPositiveTerm
              ? "#4ade80"
              : isNegativeTerm || isBadTerm
              ? "#ef4444"
              : isHamperedTerm
              ? "#fb923c"
              : isEyecatcherTerm
              ? "#facc15"
              : undefined,
          }}
        >
          {word}
        </span>{" "}
      </span>
    );
  });
}
