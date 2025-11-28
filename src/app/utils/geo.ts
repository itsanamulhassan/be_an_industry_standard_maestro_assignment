import environments from "../configurations/environments";
import {
  CalculateDistanceKmProps,
  CalculateEtaMinutesProps,
  CalculateFareProps,
} from "../types/utils.types";
import axios from "axios";

const calculateDistanceKm = ({
  pickup,
  destination,
}: CalculateDistanceKmProps): number => {
  const R = 6371; // Earth radius in KM
  const dLat = ((destination.lat - pickup.lat) * Math.PI) / 180;
  const dLng = ((destination.lng - pickup.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((pickup.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in KM
};

const calculateEtaMinutes = ({
  driver,
  pickup,
  speed = 30, // Here 30 is default speed
}: CalculateEtaMinutesProps): number => {
  const distanceKm = calculateDistanceKm({
    pickup: driver,
    destination: pickup,
  });

  return (distanceKm / speed) * 60; // Minutes
};

const calculateDistanceDuration = async ({
  pickup,
  destination,
}: CalculateDistanceKmProps): Promise<{
  distanceKm: number;
  durationMin: number;
}> => {
  const url = `${environments.osrm_base_url}${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=false`;

  try {
    const { data } = await axios.get(url);

    const route = data.routes?.[0];
    if (!route) throw new Error("No route found");

    const distanceKm = route.distance / 1000; // meters → km
    const durationMin = route.duration / 60; // seconds → minutes

    return { distanceKm, durationMin };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("OSRM route error:", error);

    // fallback to Haversine
    const distanceKm = geo.calculateDistanceKm({ pickup, destination });
    const durationMin = (distanceKm / 30) * 60;

    return { distanceKm, durationMin };
  }
};

const calculateFare = (options: CalculateFareProps): number => {
  const {
    distanceKm,
    durationMin,
    baseFare = 2, // £2 base fare
    perKmRate = 1.5, // £1.5 per km
    perMinuteRate = 0.25, // £0.25 per min
    minFare = 5, // minimum fare $5
    surgeMultiplier = 1,
  } = options;

  const fare = baseFare + distanceKm * perKmRate + durationMin * perMinuteRate;
  return Math.max(fare, minFare) * surgeMultiplier;
};

export const geo = {
  calculateDistanceKm,
  calculateEtaMinutes,
  calculateDistanceDuration,
  calculateFare,
};
