export interface Prediction {
  horseName: string;
  score: number; // 1-5
}

export interface Race {
  time: string;
  predictions: Prediction[];
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
  const races = Array.from({ length: numRaces }, (_, i) => generateRace(i));

  return {
    name,
    races,
  };
}

function generateRace(raceIndex: number): Race {
  // Generate time between 13:00 and 17:30
  const hour = 13 + Math.floor(raceIndex * 0.75);
  const minute = Math.random() > 0.5 ? "30" : "00";
  const time = `${hour}:${minute}`;

  const numHorses = 8 + Math.floor(Math.random() * 8); // 8-15 horses
  const predictions = Array.from({ length: numHorses }, () =>
    generatePrediction()
  );

  return {
    time,
    predictions,
  };
}

function generatePrediction(): Prediction {
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

  return {
    horseName: horseNames[Math.floor(Math.random() * horseNames.length)],
    score: 1 + Math.floor(Math.random() * 5), // 1-5 stars
  };
}

export function sortPredictions(predictions: Prediction[]): Prediction[] {
  return [...predictions].sort((a, b) => b.score - a.score);
}
