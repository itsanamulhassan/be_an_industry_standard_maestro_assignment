import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";
import {
  authProviderEnum,
  userActivityStatusEnum,
  userRoleStatusEnum,
} from "./user.schemas";
import { FileProps } from "../../types/global.types";
import AppError from "../../helpers/error.helper";
import { StatusCodes } from "http-status-codes";

export const fileSchema = (required = false) =>
  new Schema<FileProps>(
    {
      public_id: {
        type: String,
        unique: [true, "File ID must be unique."],
        required,
        sparse: true,
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
    avatar: {
      type: fileSchema(),
      required: false,
    },
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
      required: false,
      select: false,
    },
    phone: {
      type: String,
    },
    vehicleInfo: vehicleInfoSchema,
  },
  { timestamps: true, versionKey: false }
);

userSchema.pre("save", function (next) {
  if (this.role === "DRIVER" && !this.avatar?.public_id) {
    next(
      new AppError("Avatar is required for DRIVER.", StatusCodes.BAD_REQUEST)
    );
  }
  next();
});

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;
export type Address = InferSchemaType<typeof addressSchema>;
export type Vehicle = InferSchemaType<typeof vehicleInfoSchema>;
export type AuthProvider = InferSchemaType<typeof authProviderSchema>;

export const Users = model<User>("Users", userSchema);
