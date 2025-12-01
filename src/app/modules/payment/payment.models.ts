import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";
import { paymentMethodEnum } from "../rider/rider.schemas";
export const paymentStatusEnum = [
  "PENDING",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
] as const;

const gatewaySchema = new Schema(
  {
    name: { type: String, default: null },
    rawResponse: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false, versionKey: false }
);

const paymentSchema = new Schema(
  {
    rider: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "Rider ID is required."],
      index: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "Driver ID is required."],
      index: true,
    },
    ride: {
      type: Schema.Types.ObjectId,
      ref: "Rides",
      required: [true, "Ride ID is required."],
      unique: true,
      index: true,
    },

    amount: {
      type: Number,
      required: [true, "Payment amount is required."],
    },

    method: {
      type: String,
      enum: paymentMethodEnum,
      required: [true, "Payment method is required."],
    },

    status: {
      type: String,
      enum: paymentStatusEnum,
      default: "PENDING",
      index: true,
    },

    transactionId: { type: String, default: null, index: true, sparse: true },

    stripePaymentIntentId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    stripeClientSecret: { type: String, default: null },

    gateway: { type: gatewaySchema, default: {} },

    metadata: { type: Schema.Types.Mixed, default: {} },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type Payment = InferSchemaType<typeof paymentSchema>;
export type PaymentDocument = HydratedDocument<Payment>;

export const Payments = model<Payment>("Payments", paymentSchema);
