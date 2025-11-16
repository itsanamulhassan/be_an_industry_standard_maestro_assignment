import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";
import {
  authProviderEnum,
  userActivityStatusEnum,
  userRoleStatusEnum,
} from "./user.schemas";
import { FileProps } from "../../types/global.types";

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
    status: {
      type: String,
      enum: userActivityStatusEnum,
      default: "ACTIVATED",
      uppercase: true,
    },
    address: addressSchema,
    isDeleted: {
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
    emailVerifiedAt: {
      type: Date,
    },
    phoneVerifiedAt: {
      type: Date,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;
export type Address = InferSchemaType<typeof addressSchema>;

export type AuthProvider = InferSchemaType<typeof authProviderSchema>;

export const Users = model<User>("Users", userSchema);
