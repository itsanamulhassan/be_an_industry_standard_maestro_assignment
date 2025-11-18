import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";
import { cardBrandEnum, walletTypeEnum } from "./rider.schemas";

const locationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    address: {
      type: String,
      required: [true, "Address is required."],
    },
    lat: {
      type: Number,
      required: [true, "Latitude is required."],
    },
    lng: {
      type: Number,
      required: [true, "Longitude is required."],
    },
  },
  { versionKey: false, _id: false }
);

const paymentMethodSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["CASH", "CARD", "WALLET"],
      required: [true, "Payment method's type is required."],
    },
    brand: {
      type: String,
      enum: cardBrandEnum,
    },
    last4: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /^[0-9]{4}$/.test(v);
        },
        message: "Last four digits must be exactly 4 numeric.",
      },
    },
    expiryMonth: {
      type: Number,
      min: [1, "Expiry month must be between 1-12."],
      max: [12, "Expiry month must be between 1-12."],
      validate: {
        validator: Number.isInteger,
        message: "Expiry month must be an integer.",
      },
    },
    expiryYear: {
      type: Number,
      validate: {
        validator: function (value: number) {
          const currentYear = new Date().getFullYear();
          return value >= currentYear && value <= currentYear + 10;
        },
        message: "Expiry year must be valid and not expired.",
      },
    },

    walletType: {
      type: String,
      enum: walletTypeEnum,
    },

    paymentMethodId: String,

    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const riderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "User ID is required."],
      unique: [true, "User ID must be unique."],
    },
    rating: {
      type: Number,
      max: 5,
      min: 1,
      default: 1,
    },
    favoriteLocations: {
      type: [locationSchema],
      default: [],
    },
    totalRides: {
      type: Number,
      min: 0,
      default: 0,
    },
    paymentMethods: {
      type: [paymentMethodSchema],
      default: [],
    },
    lastRide: {
      type: Schema.Types.ObjectId,
      ref: "Rides",
      unique: [true, "Last ride ID must be unique."],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type Rider = InferSchemaType<typeof riderSchema>;
export type RiderDocument = HydratedDocument<Rider>;
export type PaymentMethod = InferSchemaType<typeof paymentMethodSchema>;
export type Location = InferSchemaType<typeof locationSchema>;

export const Riders = model<Rider>("Riders", riderSchema);
