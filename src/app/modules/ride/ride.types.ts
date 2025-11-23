import z from "zod";
import { rideSchemas } from "./ride.schemas";

export type CreateRideDTO = z.infer<typeof rideSchemas.create>;
export type UpdateCancelDTO = z.infer<typeof rideSchemas.cancel>;
export type UpdateStatusDTO = z.infer<typeof rideSchemas.status>;
