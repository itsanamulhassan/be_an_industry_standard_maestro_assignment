import { Request, Response } from "express";
import safeAsync from "../../utils/safeAsync";
import resHandler from "../../utils/resHandler";
import { StatusCodes } from "http-status-codes";
import message from "../../utils/message";
import { notificationServices } from "./notification.services";

const createNotification = safeAsync(async (req: Request, res: Response) => {
  const notification = await notificationServices.createNotification(req);
  resHandler(res, {
    success: true,
    status: StatusCodes.CREATED,
    message: message("create", "notification"),
    data: notification,
  });
});

const listNotifications = safeAsync(async (req: Request, res: Response) => {
  const notifications = await notificationServices.listNotifications(req);
  resHandler(res, {
    success: true,
    data: notifications,
    status: StatusCodes.OK,
    message: message("get", "notifications"),
  });
});

const markAsRead = safeAsync(async (req: Request, res: Response) => {
  const notification = await notificationServices.markAsRead(req);
  resHandler(res, {
    success: true,
    message: message("update", "notification"),
    data: notification,
    status: StatusCodes.OK,
  });
});

const markAllRead = safeAsync(async (req: Request, res: Response) => {
  await notificationServices.markAllRead(req);
  resHandler(res, {
    success: true,
    message: message("update", "notification"),
    status: StatusCodes.OK,
  });
});

const deleteNotification = safeAsync(async (req: Request, res: Response) => {
  await notificationServices.deleteNotification(req);
  resHandler(res, {
    success: true,
    status: StatusCodes.OK,
    message: message("delete", "notification"),
  });
});

export const notificationControllers = {
  createNotification,
  deleteNotification,
  listNotifications,
  markAsRead,
  markAllRead,
};
