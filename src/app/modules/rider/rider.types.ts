import z from "zod";
import { riderSchemas } from "./rider.schemas";

export type UpdateRiderDTO = z.infer<typeof riderSchemas.update>;
