import { ScoreComponent, ScoreParams } from "./types";
import { getCourseLocation, getTrainerLocation } from "../locationUtils";

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateTravelDistanceScore({
  horse,
  meetingDetails,
}: ScoreParams): ScoreComponent {
  let score = 0;
  const maxScore = 3;

  const trainerLocation = getTrainerLocation(horse.trainer?.name || "");
  const courseLocation = getCourseLocation(meetingDetails.venue || "");

  // If we don't have location data, return neutral score
  if (!trainerLocation || !courseLocation) {
    console.log(
      `Warning: No location data for horse: ${horse.name} -> trainer: ${horse.trainer?.name} -> course: ${meetingDetails.venue} -> trainerLocation: ${trainerLocation} -> courseLocation: ${courseLocation}`
    );
    return { score: maxScore, maxScore, percentage: 100 };
  }

  // Calculate distance in kilometers
  const travelDistance = calculateDistance(
    trainerLocation.latitude,
    trainerLocation.longitude,
    courseLocation.latitude,
    courseLocation.longitude
  );

  if (travelDistance > 300) {
    console.log(
      `Travel distance for horse: ${horse.name} -> trainer: ${horse.trainer?.name} -> course: ${meetingDetails.venue} -> travelDistance: ${travelDistance}`
    );
  }

  // Get recent runs to analyze travel performance
  const recentRuns = horse.formObj?.form?.slice(0, 12) || [];

  const travelPerformance = recentRuns.reduce(
    (acc, run) => {
      const runLocation = getCourseLocation(run.courseName || "");

      if (!runLocation || !runLocation.latitude || !runLocation.longitude)
        return acc;

      const distance = calculateDistance(
        trainerLocation.latitude,
        trainerLocation.longitude,
        runLocation.latitude,
        runLocation.longitude
      );

      // Group into similar travel distances (within 50km)
      if (Math.abs(distance - travelDistance) <= 50) {
        acc.similarDistanceRuns++;
        if (run.raceOutcomeCode === "1") acc.wins++;
        if (parseInt(run.raceOutcomeCode || "99") <= 3) acc.places++;
      }

      return acc;
    },
    { similarDistanceRuns: 0, wins: 0, places: 0 }
  );

  // Score based on travel distance and performance
  if (travelDistance <= 50) {
    // Local race (within 50km)
    score++;
  }
  if (travelDistance >= 200) {
    // Distant race (within 500km)
    score++;
  }

  if (travelPerformance.similarDistanceRuns > 0) {
    // Experience at this travel distance
    score++;
    // Success at this travel distance
    if (
      travelPerformance.places / travelPerformance.similarDistanceRuns >
      0.3
    ) {
      score++;
    }
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
  };
}
