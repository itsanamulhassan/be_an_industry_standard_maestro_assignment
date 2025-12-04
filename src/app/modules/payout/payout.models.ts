import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";
import { paymentStatusEnum } from "../payment/payment.schemas";

const payoutSchema = new Schema(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Drivers",
      required: [true, "Driver ID is required."],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required."],
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payments",
      required: [true, "Payment ID is required."],
    },
    stripeTransferId: {
      type: String,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: paymentStatusEnum,
      default: "PENDING",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

export type Payout = InferSchemaType<typeof payoutSchema>;
export type PayoutDocument = HydratedDocument<Payout>;

export const Payouts = model("Payouts", payoutSchema);
