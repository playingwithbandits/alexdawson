export interface FormEntry {
  date: string;
  position: number;
  totalRunners: number;
  course: string;
  distance: string;
  going: string;
  weight: string;
  beatenBy?: string; // Distance beaten by, e.g., "2.5L"
  odds: string;
  raceClass: number;
  prize: string;
  jockey: string;
  comment: string; // e.g., "Tracked leaders, weakened final furlong"
}

export interface HorseForm {
  lastRaces: FormEntry[];
  courseStats: {
    avgFinishPosition: number;
    totalRuns: number;
    preferredCourses: string[];
  };
  distanceStats: {
    avgDistance: number; // in furlongs
    avgFinishPosition: number;
  };
  goingStats: {
    preferredGoing: string[];
    avgFinishPosition: number;
  };
  classStats: {
    avgClass: number;
    avgFinishPosition: number;
  };
  jockeyStats: {
    preferredJockeys: string[];
    avgFinishPosition: number;
  };
  prizeStats: {
    avgPrize: number;
    totalPrize: number;
  };
  ratingStats: {
    avgOR: number;
    topOR: number;
  };
  daysOff: number;
}

export interface Prediction {
  horseName: string;
  score: number; // 1-5
  raceCourse: string; // The course/meeting name where the race is held
  form: HorseForm;
  trainer: string;
  jockey: string;
  weight: string; // e.g., "9-2"
  age: number;
  officialRating: number;
  draw?: number; // Stall number
  trainerForm: string; // e.g., "23% last 14 days"
  jockeyForm: string; // e.g., "18% last 14 days"
  stats: {
    avgSpeedRating: number;
    avgOfficialRating: number;
    bestDistance: string;
  };
}

export interface Race {
  time: string;
  predictions: Prediction[];
  distance: string; // e.g., "1m 2f"
  going: string; // e.g., "Good to Firm"
  class: number; // 1-6, where 1 is highest class
  prize: string; // e.g., "£50,000"
  raceType: string; // e.g., "Handicap", "Maiden", "Stakes"
  ageRestriction: string; // e.g., "3yo+", "2yo only"
  runners: number; // Total number of runners
  surface: string; // e.g., "Turf", "All Weather", "Dirt"
  drawBias?: string; // e.g., "High numbers favored", null for no bias
  weather: string; // e.g., "Sunny", "Overcast", "Light Rain"
  trackCondition: string; // More specific than going
}

export interface Meeting {
  name: string;
  races: Race[];
}

export interface DayPredictionsData {
  date: string;
  meetings: Meeting[];
}

export type SortOption = "time" | "rating" | "off";
export type FilterOption = 1 | 2 | 3 | 4 | 5 | null;

export function generatePredictions(date: string): DayPredictionsData {
  const meetings = ["Ascot", "Newmarket", "York", "Cheltenham", "Goodwood"].map(
    (name) => generateMeeting(name)
  );

  return {
    date,
    meetings,
  };
}

function generateMeeting(name: string): Meeting {
  const numRaces = 4 + Math.floor(Math.random() * 4); // 4-7 races
  const races = Array.from({ length: numRaces }, (_, i) =>
    generateRace(i, name)
  );

  console.log("generateMeeting", name, numRaces);
  return {
    name,
    races,
  };
}

// Add these constants for generating realistic data
const DISTANCES = [
  "5f",
  "6f",
  "7f",
  "1m",
  "1m 2f",
  "1m 4f",
  "1m 6f",
  "2m",
  "2m 4f",
  "3m",
];

const GOING_CONDITIONS = [
  "Firm",
  "Good to Firm",
  "Good",
  "Good to Soft",
  "Soft",
  "Heavy",
];

const RACE_TYPES = [
  "Maiden",
  "Novice",
  "Handicap",
  "Stakes",
  "Listed",
  "Group 3",
  "Group 2",
  "Group 1",
];

const AGE_RESTRICTIONS = ["2yo only", "3yo only", "3yo+", "4yo+", "5yo+"];

// Add new constants
const SURFACES = ["Turf", "All Weather", "Dirt"];

const WEATHER_CONDITIONS = [
  "Sunny",
  "Overcast",
  "Light Rain",
  "Heavy Rain",
  "Cloudy",
  "Windy",
];

const DRAW_BIAS = [
  "High numbers favored",
  "Low numbers favored",
  "Middle numbers favored",
  null,
];

// Add constants for generating realistic form data
const JOCKEYS = [
  "Ryan Moore",
  "Frankie Dettori",
  "William Buick",
  "Oisin Murphy",
  "Tom Marquand",
  "Hollie Doyle",
];

const TRAINERS = [
  "Aidan O'Brien",
  "Charlie Appleby",
  "John Gosden",
  "William Haggas",
  "Andrew Balding",
];

const RACE_COMMENTS = [
  "Tracked leaders, weakened final furlong",
  "Made all, stayed on strongly",
  "Held up, strong finish",
  "Dwelt start, never involved",
  "Prominent, led 2f out",
  "Slowly away, finished well",
  "Keen early, faded late",
  "Hampered start, never recovered",
  "Close up, one paced finish",
  "Led until final furlong",
];

interface RaceStats {
  avgSpeedRating: number;
  avgOfficialRating: number;
  raceDistance: string;
  going: string;
  avgPrize: number;
  avgTotalPrize: number;
}

// Add scoring weights configuration
export const SCORING_WEIGHTS = {
  speedRating: 1.0, // Max 1 point
  officialRating: 1.0, // Max 1 point
  distance: 1.0, // Max 1 point
  going: 1.0, // Max 1 point
  jockey: 0.5, // Max 0.5 points
  course: 0.5, // Max 0.5 points
  prizeMoney: {
    avgPrize: 0.25, // Max 0.25 points
    totalPrize: 0.25, // Max 0.25 points
  },
  winRate: 0.5, // Max 0.5 points
  placeRate: 0.5, // Max 0.5 points
} as const;

function calculateScore(
  prediction: Prediction,
  raceStats: RaceStats
): { totalScore: number; adjustedScore: number } {
  let score = 0;

  // Speed Rating comparison
  if (prediction.stats.avgSpeedRating > raceStats.avgSpeedRating) {
    const difference =
      prediction.stats.avgSpeedRating - raceStats.avgSpeedRating;
    if (difference > 5) score += SCORING_WEIGHTS.speedRating;
    else if (difference > 0) score += SCORING_WEIGHTS.speedRating * 0.5;
  }

  // Official Rating comparison
  if (prediction.officialRating > raceStats.avgOfficialRating) {
    const difference = prediction.officialRating - raceStats.avgOfficialRating;
    if (difference > 7) score += SCORING_WEIGHTS.officialRating;
    else if (difference > 0) score += SCORING_WEIGHTS.officialRating * 0.5;
  }

  // Distance suitability
  const optimalDistance = convertDistanceToFurlongs(
    prediction.stats.bestDistance
  );
  const raceDistance = convertDistanceToFurlongs(raceStats.raceDistance);
  const distanceDiff = Math.abs(optimalDistance - raceDistance);
  const distanceThreshold = raceDistance * 0.1; // 10% threshold

  if (distanceDiff <= distanceThreshold) {
    score += SCORING_WEIGHTS.distance;
  }

  // Going preference
  if (prediction.form.goingStats.preferredGoing.includes(raceStats.going)) {
    const goingWins = prediction.form.goingStats.preferredGoing.length;
    const goingRuns = prediction.form.goingStats.avgFinishPosition;
    const goingWinRate = (goingWins / goingRuns) * 100;

    if (goingWinRate > 30) score += SCORING_WEIGHTS.going;
    else if (goingWinRate > 20) score += SCORING_WEIGHTS.going * 0.5;
  }

  // Jockey preference
  if (
    prediction.form.jockeyStats.preferredJockeys.includes(prediction.jockey)
  ) {
    score += SCORING_WEIGHTS.jockey;
  }

  // Course preference
  if (
    prediction.form.courseStats.preferredCourses.some(
      (course) => course.toLowerCase() === prediction.raceCourse?.toLowerCase()
    )
  ) {
    score += SCORING_WEIGHTS.course;
  }

  // Prize level comparison
  if (prediction.form.prizeStats.avgPrize > raceStats.avgPrize) {
    score += SCORING_WEIGHTS.prizeMoney.avgPrize;
  }
  if (prediction.form.prizeStats.totalPrize > raceStats.avgTotalPrize) {
    score += SCORING_WEIGHTS.prizeMoney.totalPrize;
  }

  // Win Rate
  const wins = prediction.form.lastRaces.filter(
    (race) => race.position === 1
  ).length;
  const winRate = (wins / prediction.form.lastRaces.length) * 100;
  if (winRate > 30) score += SCORING_WEIGHTS.winRate;

  // Place Rate
  const places = prediction.form.lastRaces.filter(
    (race) => race.position <= 3
  ).length;
  const placeRate = (places / prediction.form.lastRaces.length) * 100;
  if (placeRate > 50) score += SCORING_WEIGHTS.placeRate;

  // Calculate maximum possible score from weights
  const maxScore = Object.values(SCORING_WEIGHTS).reduce((sum, weight) => {
    if (typeof weight === "object") {
      return sum + Object.values(weight).reduce((s, w) => s + w, 0);
    }
    return sum + weight;
  }, 0);

  console.log("maxScore", {
    totalScore: score,
    maxScore,
    adjustedScore: (score / maxScore) * 5,
  });
  return {
    totalScore: score,
    adjustedScore: (score / maxScore) * 5,
  };
}

function convertDistanceToFurlongs(distance: string): number {
  // Convert distances like "1m 2f" to furlongs
  const miles = distance.includes("m") ? parseInt(distance.split("m")[0]) : 0;
  const furlongs = distance.includes("f")
    ? parseInt(distance.split("f")[0].split(" ").pop() || "0")
    : 0;

  return miles * 8 + furlongs; // 1 mile = 8 furlongs
}

function generateRace(raceIndex: number, courseName: string): Race {
  // Generate time between 13:00 and 17:30
  const hour = 13 + Math.floor(raceIndex * 0.75);
  const minute = Math.random() > 0.5 ? "30" : "00";
  const time = `${hour}:${minute}`;

  const numHorses = 8 + Math.floor(Math.random() * 8); // 8-15 horses
  const distance = DISTANCES[Math.floor(Math.random() * DISTANCES.length)];

  // Generate base predictions without scores
  const basePredictions = Array.from({ length: numHorses }, () =>
    generatePrediction(courseName)
  );

  const going =
    GOING_CONDITIONS[Math.floor(Math.random() * GOING_CONDITIONS.length)];

  // Calculate race averages
  const raceStats: RaceStats = {
    avgSpeedRating:
      basePredictions.reduce((sum, p) => sum + p.stats.avgSpeedRating, 0) /
      numHorses,
    avgOfficialRating:
      basePredictions.reduce((sum, p) => sum + p.officialRating, 0) / numHorses,
    raceDistance: distance,
    going: going,
    avgPrize:
      basePredictions.reduce((sum, p) => sum + p.form.prizeStats.avgPrize, 0) /
      numHorses,
    avgTotalPrize:
      basePredictions.reduce(
        (sum, p) => sum + p.form.prizeStats.totalPrize,
        0
      ) / numHorses,
  };

  // Calculate scores based on race context
  const predictions = basePredictions.map((prediction) => ({
    ...prediction,
    score: calculateScore(prediction, raceStats).adjustedScore,
  }));

  // Generate prize money based on class
  const class_ = 1 + Math.floor(Math.random() * 6);
  const basePrize = 100000 / Math.pow(2, class_ - 1);
  const prize = `£${Math.round(basePrize).toLocaleString()}`;

  return {
    time,
    predictions,
    distance,
    going,
    class: class_,
    prize,
    raceType: RACE_TYPES[Math.floor(Math.random() * RACE_TYPES.length)],
    ageRestriction:
      AGE_RESTRICTIONS[Math.floor(Math.random() * AGE_RESTRICTIONS.length)],
    runners: numHorses,
    surface: SURFACES[Math.floor(Math.random() * SURFACES.length)],
    drawBias:
      Math.random() > 0.5
        ? DRAW_BIAS[Math.floor(Math.random() * DRAW_BIAS.length)] || undefined
        : undefined,
    weather:
      WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)],
    trackCondition: `${going}${
      Math.random() > 0.7
        ? ` (${
            GOING_CONDITIONS[
              Math.floor(Math.random() * GOING_CONDITIONS.length)
            ]
          } in places)`
        : ""
    }`,
  };
}

function generateFormEntry(daysAgo: number): FormEntry {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const dateStr = date.toISOString().split("T")[0];

  const position = 1 + Math.floor(Math.random() * 12);
  const totalRunners = Math.max(position, 8 + Math.floor(Math.random() * 8));

  return {
    date: dateStr,
    position,
    totalRunners,
    course: ["Ascot", "Newmarket", "York", "Cheltenham", "Goodwood"][
      Math.floor(Math.random() * 5)
    ],
    distance: DISTANCES[Math.floor(Math.random() * DISTANCES.length)],
    going:
      GOING_CONDITIONS[Math.floor(Math.random() * GOING_CONDITIONS.length)],
    weight: `${8 + Math.floor(Math.random() * 4)}-${Math.floor(
      Math.random() * 13
    )}`,
    beatenBy: position > 1 ? `${(Math.random() * 10).toFixed(1)}L` : undefined,
    odds: `${Math.floor(Math.random() * 20 + 1)}/1`,
    raceClass: 1 + Math.floor(Math.random() * 6),
    prize: `£${(Math.floor(Math.random() * 50) + 5).toLocaleString()}k`,
    jockey: JOCKEYS[Math.floor(Math.random() * JOCKEYS.length)],
    comment: RACE_COMMENTS[Math.floor(Math.random() * RACE_COMMENTS.length)],
  };
}

function generateHorseForm(): HorseForm {
  const lastRaces = Array.from({ length: 6 }, (_, i) =>
    generateFormEntry(14 + i * 14)
  );

  // Calculate course stats
  const courseStats = {
    avgFinishPosition:
      lastRaces.reduce((sum, race) => sum + race.position, 0) /
      lastRaces.length,
    totalRuns: lastRaces.length,
  };

  // Calculate distance stats
  const distances = lastRaces.map((race) =>
    convertDistanceToFurlongs(race.distance)
  );
  const distanceStats = {
    avgDistance: distances.reduce((sum, d) => sum + d, 0) / distances.length,
    avgFinishPosition:
      lastRaces.reduce((sum, race) => sum + race.position, 0) /
      lastRaces.length,
  };

  // Calculate going stats
  const goingCounts = lastRaces.reduce((acc, race) => {
    acc[race.going] = (acc[race.going] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const preferredGoing = Object.entries(goingCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([going]) => going);

  const goingStats = {
    preferredGoing,
    avgFinishPosition:
      lastRaces.reduce((sum, race) => sum + race.position, 0) /
      lastRaces.length,
  };

  // Calculate class stats
  const classStats = {
    avgClass:
      lastRaces.reduce((sum, race) => sum + race.raceClass, 0) /
      lastRaces.length,
    avgFinishPosition:
      lastRaces.reduce((sum, race) => sum + race.position, 0) /
      lastRaces.length,
  };

  // Calculate jockey stats
  const jockeyCounts = lastRaces.reduce((acc, race) => {
    acc[race.jockey] = (acc[race.jockey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const preferredJockeys = Object.entries(jockeyCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([jockey]) => jockey);

  const jockeyStats = {
    preferredJockeys,
    avgFinishPosition:
      lastRaces.reduce((sum, race) => sum + race.position, 0) /
      lastRaces.length,
  };

  // Calculate prize stats
  const prizeStats = {
    avgPrize:
      lastRaces.reduce((sum, race) => {
        const prizeValue = parseInt(race.prize.replace(/[£k,]/g, ""));
        return sum + prizeValue;
      }, 0) / lastRaces.length,
    totalPrize: lastRaces.reduce((sum, race) => {
      const prizeValue = parseInt(race.prize.replace(/[£k,]/g, ""));
      return sum + prizeValue;
    }, 0),
  };

  // Calculate course stats
  const courseCounts = lastRaces.reduce((acc, race) => {
    acc[race.course] = (acc[race.course] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const preferredCourses = Object.entries(courseCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([course]) => course);

  // Calculate rating stats
  const ratingStats = {
    avgOR:
      lastRaces.reduce((sum, race) => sum + race.raceClass, 0) /
      lastRaces.length,
    topOR: Math.max(...lastRaces.map((race) => race.raceClass)),
  };

  return {
    lastRaces,
    courseStats: {
      ...courseStats,
      preferredCourses,
    },
    distanceStats,
    goingStats,
    classStats,
    jockeyStats,
    prizeStats,
    ratingStats,
    daysOff: 14 + Math.floor(Math.random() * 30),
  };
}

function generatePrediction(raceCourse: string): Prediction {
  const horseNames = [
    "Thunder Bolt",
    "Silver Streak",
    "Royal Fortune",
    "Lucky Star",
    "Golden Arrow",
    "Dark Knight",
    "Storm Runner",
    "Victory Lane",
    "Fast Track",
    "Wild Wind",
    "Rising Sun",
    "Night Rider",
    "Quick Silver",
    "Bold Spirit",
    "High Flyer",
    "Power Play",
    "Swift Justice",
    "Brave Heart",
    "Sure Winner",
    "Top Speed",
  ];

  const avgSpeedRating = 65 + Math.floor(Math.random() * 50);
  const officialRating = 65 + Math.floor(Math.random() * 50);
  const bestDistance = DISTANCES[Math.floor(Math.random() * DISTANCES.length)];

  return {
    horseName: horseNames[Math.floor(Math.random() * horseNames.length)],
    score: 0, // Will be calculated later with race context
    raceCourse,
    form: generateHorseForm(),
    trainer: TRAINERS[Math.floor(Math.random() * TRAINERS.length)],
    jockey: JOCKEYS[Math.floor(Math.random() * JOCKEYS.length)],
    weight: `${8 + Math.floor(Math.random() * 4)}-${Math.floor(
      Math.random() * 13
    )}`,
    age: 2 + Math.floor(Math.random() * 7),
    officialRating,
    draw: Math.floor(Math.random() * 16) + 1,
    trainerForm: `${Math.floor(Math.random() * 30)}% last 14 days`,
    jockeyForm: `${Math.floor(Math.random() * 25)}% last 14 days`,
    stats: {
      avgSpeedRating,
      avgOfficialRating: officialRating,
      bestDistance,
    },
  };
}

export function sortPredictions(predictions: Prediction[]): Prediction[] {
  return [...predictions].sort((a, b) => b.score - a.score);
}
