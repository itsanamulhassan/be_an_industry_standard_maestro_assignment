import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";
import { WalletTransactionTypeEnum } from "./wallet.types";

const WalletTransactionSchema = new Schema(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Drivers",
      required: [true, "Driver ID is required."],
    },
    ride: {
      type: Schema.Types.ObjectId,
      ref: "Rides",
      required: [true, "Ride ID is required."],
    },
    type: {
      type: String,
      enum: WalletTransactionTypeEnum,
      required: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "CANCELED"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required."],
    },

    payout: {
      type: Schema.Types.ObjectId,
      ref: "Payouts",
      default: null,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

export type WalletTransaction = InferSchemaType<typeof WalletTransactionSchema>;
export type WalletTransactionDocument = HydratedDocument<WalletTransaction>;

export const WalletTransactions = model<WalletTransaction>(
  "WalletTransactions",
  WalletTransactionSchema
);
