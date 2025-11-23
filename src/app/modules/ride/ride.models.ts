import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";
import { rideCancelEnum, rideStatusEnum } from "./ride.schemas";

export const rideLocationSchema = new Schema(
  {
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

const rideSchema = new Schema(
  {
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payments",
      default: null,
    },
    rider: {
      type: Schema.Types.ObjectId,
      ref: "Riders",
      required: [true, "Rider ID is required."],
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Drivers",
      default: null,
    },
    pickup: {
      type: rideLocationSchema,
      required: [true, "Pick up location is required."],
    },
    destination: {
      type: rideLocationSchema,
      required: [true, "Destination location is required."],
    },
    fare: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: rideStatusEnum,
      default: "REQUESTED",
    },
    driverRating: {
      type: Number,
      default: null,
      min: 1,
      max: 5,
    },
    riderRating: {
      type: Number,
      default: null,
      min: 1,
      max: 5,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },

    pickedUpAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    canceledAt: {
      type: Date,
      default: null,
    },
    canceledBy: {
      type: String,
      enum: rideCancelEnum,
      default: null,
    },
    cancelReason: {
      type: String,
      default: null,
    },
    driverEta: {
      type: Number,
    },
    distanceKm: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type Ride = InferSchemaType<typeof rideSchema>;
export type RideDocument = HydratedDocument<Ride>;

export const Rides = model<Ride>("Rides", rideSchema);
