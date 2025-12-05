import { Types } from "mongoose";
import { Request } from "express";
import { JWTCredentialProps } from "../../types/utils.types";
import { Notifications } from "./notification.models";
import { CreateNotificationDTO } from "./notification.types";
import { Users } from "../user/user.models";
import { io } from "../../../server";
import AppError from "../../helpers/error.helper";
import { StatusCodes } from "http-status-codes";
import mailSender from "../../utils/mailSender";

const createNotification = async (req: Request) => {
  const payload = req.body as CreateNotificationDTO;

  const notification = await Notifications.create(payload);

  try {
    if (payload.channels && payload.channels.includes("SOCKET")) {
      io.to(`user:${payload.user}`).emit("notification", {
        id: notification._id,
        title: payload.title,
        body: payload.body,
        type: payload.type,
        data: payload.data,
        createdAt: notification.createdAt,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(error.message, StatusCodes.BAD_REQUEST);
    }
  }

  if (payload.channels && payload.channels.includes("EMAIL")) {
    try {
      const user = await Users.findById(payload.user).select("email name");
      if (user?.email) {
        await mailSender({
          subject: "Notification",
          template: "notification",
          to: user.email,
          data: {
            title: payload.title,
            body: payload.body,
            data: payload.data,
          },
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, StatusCodes.BAD_REQUEST);
      }
    }
  }

  return notification;
};

const markAsRead = async (req: Request) => {
  const { credentialId: userId } = req.user as JWTCredentialProps;
  const notificationId = req.params.notificationId;
  const notification = await Notifications.findOneAndUpdate(
    { _id: notificationId, user: new Types.ObjectId(userId) },
    { $set: { read: true } },
    { new: true }
  );
  return notification;
};

const markAllRead = async (req: Request) => {
  const { credentialId: userId } = req.user as JWTCredentialProps;
  await Notifications.updateMany(
    { user: new Types.ObjectId(userId), read: false },
    { $set: { read: true } }
  );
};

const listNotifications = async (req: Request) => {
  const { credentialId: userId } = req.user as JWTCredentialProps;

  const notifications = await Notifications.find({ user: userId });
  return notifications;
};

const deleteNotification = async (req: Request) => {
  const notificationId = req.params.notificationId;
  const { credentialId: userId } = req.user as JWTCredentialProps;

  const notification = await Notifications.findOneAndUpdate(
    { _id: notificationId, user: new Types.ObjectId(userId) },
    { isDeleted: true },
    { new: true }
  );
  return notification;
};

export const notificationServices = {
  deleteNotification,
  listNotifications,
  markAllRead,
  markAsRead,
  createNotification,
};
