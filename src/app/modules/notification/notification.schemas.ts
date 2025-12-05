import { z } from "zod";

export const notificationChannelsEnum = ["SOCKET", "EMAIL"] as const;
export const notificationTypeEnum = [
  "INFO",
  "SUCCESS",
  "WARNING",
  "ERROR",
  "TRANSACTION",
  "RIDE_EVENT",
  "PAYOUT",
] as const;

const createNotificationSchema = z.object({
  user: z
    .string({ error: "User ID must be a string." })
    .min(1, { error: "User ID is required." }),
  title: z
    .string({ error: "Title must be a string." })
    .min(1, { error: "Title is required." }),
  body: z
    .string({ error: "Body must be a string." })
    .min(1, { error: "Body is required" }),
  type: z.enum(notificationTypeEnum).optional(),
  data: z.record(z.string(), z.any()).optional(),
  channels: z.array(z.enum(notificationChannelsEnum)).optional(),
});

export const notificationSchemas = {
  createNotificationSchema,
};
