import {
  CalculateDistanceKmProps,
  CalculateEtaMinutesProps,
} from "../types/utils.types";

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

export const geo = {
  calculateDistanceKm,
  calculateEtaMinutes,
};
