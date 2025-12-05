import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";
import {
  notificationChannelsEnum,
  notificationTypeEnum,
} from "./notification.schemas";

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "User ID is required."],
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Title is required."],
    },
    body: {
      type: String,
      required: [true, "Body is required"],
    },
    type: {
      type: String,
      enum: notificationTypeEnum,
      default: "INFO",
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
    channels: {
      type: [String],
      enum: notificationChannelsEnum,
      default: ["SOCKET"],
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export type Notification = InferSchemaType<typeof notificationSchema>;
export type NotificationDocument = HydratedDocument<Notification>;

export const Notifications = model<Notification>(
  "Notifications",
  notificationSchema
);
