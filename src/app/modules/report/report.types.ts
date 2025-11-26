import z from "zod";
import { reportSchemas } from "./report.schemas";

export type CreateReportDTO = z.infer<typeof reportSchemas.create>;
export type ResolveReportDTO = z.infer<typeof reportSchemas.resolve>;
export type UpdateReportDTO = z.infer<typeof reportSchemas.update>;
