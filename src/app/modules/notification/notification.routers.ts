import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { notificationSchemas } from "./notification.schemas";
import { notificationControllers } from "./notification.controllers";
import { userRoleEnum } from "../user/user.schemas";

const notificationRouter = Router();

notificationRouter.post(
  "/",
  validator.role("ADMIN", "SUPERADMIN"),
  validator.schema(notificationSchemas.createNotificationSchema),
  notificationControllers.createNotification
);

notificationRouter.get(
  "/",
  validator.role(...userRoleEnum),
  notificationControllers.listNotifications
);
notificationRouter.patch(
  "/:notificationId/read",
  validator.role(...userRoleEnum),
  notificationControllers.markAsRead
);
notificationRouter.patch(
  "/read-all",
  validator.role(...userRoleEnum),
  notificationControllers.markAllRead
);
notificationRouter.delete(
  "/:notificationId",
  validator.role(...userRoleEnum),
  notificationControllers.deleteNotification
);

export default notificationRouter;
