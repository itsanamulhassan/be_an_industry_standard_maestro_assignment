import * as z from "zod";
import is from "zod/v4/locales/is.cjs";

// ✅ Password regex: At least 1 uppercase, 1 special char, 6–32 characters
export const passwordRegex =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\\{};':"|,.<>/?]).{6,32}$/;
// ✅ User activity status enum
export const userActivityStatusEnum = [
  "ACTIVE",
  "INACTIVE",
  "BLOCKED",
] as const;
// ✅ User role status enum
export const userRoleStatusEnum = [
  "SUPERADMIN",
  "ADMIN",
  "RIDER",
  "DRIVER",
] as const;
// ✅ Auth provider enum
export const authProviderEnum = ["GOOGLE", "FACEBOOK", "CREDENTIAL"] as const;

// ✅ User address schema
export const addressSchema = z.object({
  street: z.string({ error: "Street must be a string." }).optional(),
  city: z
    .string({ error: "City must be a string." })
    .min(1, { error: "City is required." }),
  division: z
    .string({ error: "Division must be a string." })
    .min(1, { error: "Division is required." }),
  postalCode: z.string({ error: "Postal code must be a string." }).optional(),
  country: z
    .string({ error: "Country must be a string." })
    .min(1, { error: "Country is required." }),
});

// ✅ Auth provider sub-document schema
export const authProviderSchema = z.object({
  provider: z.enum(authProviderEnum),
  providerId: z
    .string({ error: "Authentication provided id must be a string." })
    .min(1, { error: "Provider ID is required." }),
});

export const vehicleInfo = z.object({
  model: z
    .string({ error: "Model must be a string." })
    .min(1, { error: "Vehicle model is required." }),
  plateNumber: z
    .string({ error: "Plate number must be a string." })
    .min(1, { error: "Plate number is required." }),
  capacity: z.number({ error: "Capacity must be a number." }),
  color: z.string({ error: "Color must be a string." }).optional(),
});

// ✅ Main user creation schema
const createUser = z
  .object({
    name: z
      .string({ error: "Name must be a string." })
      .min(1, { error: "Name is required." }),
    email: z
      .email({ error: "Invalid email address." })
      .min(1, { error: "Email is required." })
      .lowercase(),

    // Password is optional (e.g. social login), but if provided, must match regex
    password: z
      .string()
      .regex(passwordRegex, {
        error:
          "Password must be 6 - 32 characters long, include at least 1 uppercase letter and 1 special character.",
      })
      .optional(),

    phone: z.string({ error: "Phone must be a string." }).optional(),
    avatar: z.url({ error: "Avatar must be a valid URL." }).optional(),

    // Embedded address object
    address: addressSchema.optional(),

    // Status flags
    isDeleted: z
      .boolean({ error: "Verify status must be a boolean." })
      .default(false)
      .optional(),
    activityStatus: z.enum(userActivityStatusEnum).default("ACTIVE"),
    isApproved: z
      .boolean({ error: "Approve status must be a boolean." })
      .default(false)
      .optional(),

    // Linked authentication providers
    auths: z
      .array(authProviderSchema)
      .min(1, { error: "At least one auth provider is required." })
      .default([]),

    // User role
    role: z.enum(userRoleStatusEnum).default("RIDER"),
    // vehicleInfo optional here
    vehicleInfo: vehicleInfo.optional(),
  })
  .refine((data) => data.role !== "DRIVER" || !!data.vehicleInfo, {
    message: "Vehicle information is required for DRIVER role",
    path: ["vehicleInfo"],
  })
  .refine((data) => data.role !== "RIDER" || data.isApproved === true, {
    message: "Riders must always be approved",
    path: ["isApproved"],
  });

const updateUser = createUser.omit({
  email: true,
});

export const userSchemas = {
  createUser,
  updateUser,
};
