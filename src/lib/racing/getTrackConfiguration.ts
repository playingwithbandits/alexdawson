import { TrackConfiguration } from "./calculateDrawBias";
import { placeToPlaceKey } from "./scores/funcs";

const courseConfigs: Record<string, TrackConfiguration> = {
  // Straight tracks
  ascot: "straight",
  doncaster: "straight",
  york: "straight",
  newmarket: "straight",
  thirsk: "straight",
  newbury: "straight",
  nottingham: "straight",
  sandown: "straight",
  redcar: "straight",
  catterick: "straight",

  // Left-handed tracks
  kempton: "left-handed",
  lingfield: "left-handed",
  wolverhampton: "left-handed",
  chelmsford: "left-handed",
  dundalk: "left-handed",
  southwell: "left-handed",
  ayr: "left-handed",
  hamilton: "left-handed",
  newcastle: "left-handed",
  pontefract: "left-handed",
  musselburgh: "left-handed",
  haydock: "left-handed",
  leicester: "left-handed",
  ripon: "left-handed",
  carlisle: "left-handed",
  "ffos las": "left-handed",
  wetherby: "left-handed",
  sedgefield: "left-handed",
  hexham: "left-handed",
  kelso: "left-handed",
  perth: "left-handed",
  stratford: "left-handed",
  uttoxeter: "left-handed",
  warwick: "left-handed",

  // Right-handed tracks
  windsor: "right-handed",
  brighton: "right-handed",
  bath: "right-handed",
  beverley: "right-handed",
  chester: "right-handed",
  chepstow: "right-handed",
  epsom: "right-handed",
  goodwood: "right-handed",
  yarmouth: "right-handed",
  fontwell: "right-handed",
  salisbury: "right-handed",
  "market rasen": "right-handed",
  taunton: "right-handed",
  wincanton: "right-handed",
  plumpton: "right-handed",
  huntingdon: "right-handed",
  ludlow: "right-handed",
  exeter: "right-handed",
  fakenham: "right-handed",
  hereford: "right-handed",
  "newton abbot": "right-handed",
};

export function getTrackConfiguration(
  courseName: string
): TrackConfiguration | undefined {
  const normalizedCourseName = placeToPlaceKey(courseName).toLowerCase().trim();

  // Find the matching course configuration
  const matchingCourse = Object.keys(courseConfigs).find((course) =>
    normalizedCourseName.includes(placeToPlaceKey(course))
  );

  if (!matchingCourse) {
    console.log(`No track configuration found for course: ${courseName}`);
  }

  return matchingCourse ? courseConfigs[matchingCourse] : undefined;
}
