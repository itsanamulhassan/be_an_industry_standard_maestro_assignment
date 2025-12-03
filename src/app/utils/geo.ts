import environments from "../configurations/environments";
import {
  CalculateDistanceKmProps,
  CalculateEtaMinutesProps,
  EarningCalculationProps,
  EarningCalculationReturnProps,
  FareCalculationProps,
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

export const calculateFare = ({
  distanceKm,
  durationMin,
  baseFare = 2,
  perKmRate = 1.5,
  perMinuteRate = 0.25,
  minFare = 5,
  surgeMultiplier = 1,
}: FareCalculationProps): number => {
  // Step 1: Base fare calculation
  let fare = baseFare + distanceKm * perKmRate + durationMin * perMinuteRate;

  // Step 2: Apply minimum fare
  fare = Math.max(fare, minFare);

  // Step 3: Apply surge and total payable fare for rider
  const riderTotalFare = fare * surgeMultiplier;
  return riderTotalFare;
};

const calculateEarnings = ({
  riderTotalFare,
  commissionRate = 0.2, // 20% default
  taxRate = 0.1, // 10% default
}: EarningCalculationProps): EarningCalculationReturnProps => {
  // Step 4: Earnings breakdown
  const driverGrossEarning = riderTotalFare; // driver earns full fare before fees
  const platformCommission = driverGrossEarning * commissionRate;
  const taxAmount = driverGrossEarning * taxRate;
  const driverNetEarning = driverGrossEarning - platformCommission - taxAmount;
  return {
    platformCommission,
    taxAmount,
    driverNetEarning,
    driverGrossEarning,
  };
};
export const geo = {
  calculateDistanceKm,
  calculateEtaMinutes,
  calculateDistanceDuration,
  calculateFare,
  calculateEarnings,
};
