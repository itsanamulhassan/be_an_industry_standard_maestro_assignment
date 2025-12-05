import z from "zod";
import { notificationSchemas } from "./notification.schemas";

export type CreateNotificationDTO = z.infer<
  typeof notificationSchemas.createNotificationSchema
>;
