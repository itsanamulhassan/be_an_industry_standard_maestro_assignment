import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const vehicleInfoSchema = new Schema(
  {
    capacity: {
      type: Number,
    },
    model: {
      type: String,
    },
    plateNumber: {
      type: String,
    },
    color: {
      type: String,
    },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const driverSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: [true, "User ID is required."],
    unique: [true, "User ID must be unique."],
  },
  vehicleInfo: vehicleInfoSchema,
  licenseNumber: {
    type: String,
    required: true,
  },
  isOnline: { type: Boolean, default: false },
  isApproved: {
    type: Boolean,
    default: false,
  },
});

export type Driver = InferSchemaType<typeof driverSchema>;
export type DriverDocument = HydratedDocument<Driver>;
export type Vehicle = InferSchemaType<typeof vehicleInfoSchema>;

export const Drivers = model<Driver>("Drivers", driverSchema);
