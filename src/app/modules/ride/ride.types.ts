import z from "zod";
import { rideSchemas } from "./ride.schemas";

export type CreateRideDTO = z.infer<typeof rideSchemas.create>;
export type UpdateRideCancelDTO = z.infer<typeof rideSchemas.cancel>;
export type UpdateRideStatusDTO = z.infer<typeof rideSchemas.status>;
export type UpdateRideReportDTO = z.infer<typeof rideSchemas.report>;
