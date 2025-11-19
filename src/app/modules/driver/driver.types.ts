import z from "zod";
import { driverSchemas } from "./driver.schemas";

export type CreateDriverDTO = z.infer<typeof driverSchemas.create>;
export type UpdateDriverApprovalDTO = z.infer<
  typeof driverSchemas.updateApproval
>;
export type UpdateDriverOnlineDTO = z.infer<typeof driverSchemas.updateOnline>;
export type UpdateDriverDTO = z.infer<typeof driverSchemas.update>;
export type UpdateDriverActivationDTO = z.infer<
  typeof driverSchemas.updateActivation
>;
