import z from "zod";
import { favoriteLocationSchema } from "../rider/rider.schemas";
export const rideStatusEnum = [
  "REQUESTED",
  "ACCEPTED",
  "PICKED_UP",
  "IN_TRANSIT",
  "COMPLETED",
  "CANCELED",
] as const;

export const rideCancelEnum = ["RIDER", "DRIVER", "SYSTEM"] as const;

const rideLocation = z.clone(favoriteLocationSchema).omit({ name: true });
const request = z.object({
  rider: z
    .string({ error: "Rider ID must be a string." })
    .min(1, { error: "Rider ID is required." }),
  driver: z
    .string({ error: "Driver ID must be a string." })
    .min(1, { error: "Driver ID is required." }),
  payment: z
    .string({ error: "Payment ID must be a string." })
    .min(1, { error: "Payment ID id required." }),
  pickup: z.object(rideLocation),
  destination: z.object(rideLocation),
  fare: z
    .number({ error: "Ride fare amount must be a number." })
    .min(1, { error: "Ride fare amount is require." }),
  driverEta: z.number({ error: "Driver ETA must be a number." }).optional(),
  distanceKm: z.number({ error: "Distance (Km) must be a number." }).optional(),
});

const rideSchemas = {
  request,
};
