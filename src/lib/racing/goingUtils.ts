const aw_fast = ["st", "f"];
const aw_med = ["st"];
const aw_slow = ["st", "s", "sl"];

const turf_fast = ["gf", "fm", "g", "gd"];
const turf_med = ["g", "gd", "gs", "y", "sft"];
const turf_slow = ["y", "sft", "vsft", "hy", "hvy"];
const turf_v_slow = ["sft", "vsft", "hy", "hvy"];

export const GOING_REMAP: { [key: string]: string[] } = {
  slow: [...aw_slow],
  "standard to slow": [...aw_slow],
  standard: [...aw_med],
  "standard to fast": [...aw_fast],
  fast: [...aw_fast],

  firm: [...turf_fast],
  "good to firm": [...turf_fast],
  good: [...turf_med],
  "good to soft": [...turf_med],

  "good to yielding": [...turf_med],
  yielding: [...turf_med],
  "yielding to soft": [...turf_slow],

  soft: [...turf_slow],
  "very soft": [...turf_slow],

  "soft to heavy": [...turf_v_slow],
  heavy: [...turf_v_slow],
};

export function mapGoingCodeToType(goingCode: string): string {
  const normalizedCode = goingCode.toLowerCase().trim();

  for (const [type, codes] of Object.entries(GOING_REMAP)) {
    if (codes.some((code) => normalizedCode.includes(code))) {
      return type;
    }
  }

  return normalizedCode; // Return original if no match
}
