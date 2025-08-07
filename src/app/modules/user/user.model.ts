import { model, Schema } from "mongoose";
import {
  AddressProps,
  AuthProviderProps,
  CreateUserProps,
  VehicleProps,
} from "./user.type";
import {
  authProviderEnum,
  userActivityStatusEnum,
  userRoleStatusEnum,
} from "./user.schema";
const addressSchema = new Schema<AddressProps>(
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

const authProviderSchema = new Schema<AuthProviderProps>(
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

const vehicleInfoSchema = new Schema<VehicleProps>(
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

const userSchema = new Schema<CreateUserProps>(
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
      type: String,
    },
    activityStatus: {
      enum: userActivityStatusEnum,
      default: "ACTIVE",
      uppercase: true,
    },
    address: addressSchema,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    auths: [authProviderSchema],
    role: {
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

userSchema.pre("validate", async function (next) {
  if (this.role === "RIDER") {
    this.isApproved = true;
  }
  next();
});

export const Users = model<CreateUserProps>("Users", userSchema);
