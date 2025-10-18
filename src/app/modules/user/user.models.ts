import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";
import {
  authProviderEnum,
  userActivityStatusEnum,
  userRoleStatusEnum,
} from "./user.schemas";
import { FileProps } from "app/types/global.types";

export const fileSchema = new Schema<FileProps>(
  {
    public_id: {
      type: String,
      unique: [true, "File ID must be unique."],
    },
    url: String,
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    street: { type: String },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    division: {
      type: String,
      required: [true, "Division is required"],
    },
    postalCode: {
      type: String,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
  },
  { versionKey: false, _id: false }
);

const authProviderSchema = new Schema(
  {
    provider: {
      type: String,
      value: authProviderEnum,
      default: "CREDENTIAL",
    },
    providerId: {
      type: String,
      required: [true, "Provider ID- is required"],
    },
  },
  {
    versionKey: false,
    _id: false,
  }
);

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

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: [true, "Email must be unique."],
      lowercase: true,
      trim: true,
    },
    avatar: fileSchema,
    activityStatus: {
      type: String,
      enum: userActivityStatusEnum,
      default: "ACTIVE",
      uppercase: true,
    },
    address: addressSchema,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isDriverApproved: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    auths: [authProviderSchema],
    role: {
      type: String,
      enum: userRoleStatusEnum,
      default: "RIDER",
    },
    password: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
    },
    vehicleInfo: vehicleInfoSchema,
  },
  { timestamps: true, versionKey: false }
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;
export type Address = InferSchemaType<typeof addressSchema>;
export type Vehicle = InferSchemaType<typeof vehicleInfoSchema>;
export type AuthProvider = InferSchemaType<typeof authProviderSchema>;

export const Users = model<User>("Users", userSchema);
