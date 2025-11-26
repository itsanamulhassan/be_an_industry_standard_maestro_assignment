import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";
import { reportReasonEnum, reportStatusEnum } from "./report.schemas";
import { fileSchema } from "../user/user.models";

const reportSchema = new Schema(
  {
    ride: {
      type: Schema.Types.ObjectId,
      ref: "Rides",
      default: null,
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "Reporter is required."],
      index: true,
    },
    reportedFor: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      default: null,
      index: true,
    },
    reason: {
      type: String,
      enum: reportReasonEnum,
      required: [true, "Reason is required."],
    },
    details: {
      type: String,
      required: [true, "Report details is required."],
      maxLength: [2000, "Details must be 1000 characters."],
    },
    screenshots: { type: [fileSchema()], default: [] },
    status: {
      type: String,
      enum: reportStatusEnum,
      default: "PENDING",
    },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "Users", default: null },
    resolutionNotes: {
      type: String,
      default: null,
      maxLength: [1000, "Details must be 1000 characters."],
    },
    resolvedAt: { type: Date, default: null },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

// Useful compound indexes
// reportSchema.index({ reportedUser: 1, status: 1 });
// reportSchema.index({ reporter: 1, createdAt: -1 });

export type Report = InferSchemaType<typeof reportSchema>;
export type ReportDocument = HydratedDocument<Report>;

export const Reports = model<Report>("Reports", reportSchema);
