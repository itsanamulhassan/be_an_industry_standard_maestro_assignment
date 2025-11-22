import z from "zod";
export const rideStatusEnum = [
  "REQUESTED",
  "ACCEPTED",
  "PICKED_UP",
  "IN_TRANSIT",
  "COMPLETED",
  "CANCELED",
] as const;

export const rideCancelEnum = ["RIDER", "DRIVER", "SYSTEM"] as const;

const create = z.object({
  rider: z
    .string({ error: "Rider ID must be a string." })
    .min(1, { error: "Rider ID is required." }),
  driver: z
    .string({ error: "Driver ID must be a string." })
    .min(1, { error: "Driver ID is required." }),
  payment: z.string({ error: "Payment ID is required." }),
});
