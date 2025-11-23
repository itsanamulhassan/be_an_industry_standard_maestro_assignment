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
export const rideStatusByDriver = [
  "PICKED_UP",
  "IN_TRANSIT",
  "COMPLETED",
] as const;

const rideLocation = z.clone(favoriteLocationSchema).omit({ name: true });
const create = z.object({
  pickup: rideLocation,
  destination: rideLocation,
});
const cancel = z.object({
  reason: z
    .string({ error: "Cancel reason must be a string." })
    .min(1, { error: "Cancel reason is require." }),
});
const status = z.object({
  status: z.enum(rideStatusByDriver),
});

export const rideSchemas = {
  create,
  cancel,
  status,
};
