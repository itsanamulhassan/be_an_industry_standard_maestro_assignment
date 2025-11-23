import * as z from "zod";

// ✅ Password regex: At least 1 uppercase, 1 special char, 6–32 characters
export const passwordRegex =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\\{};':"|,.<>/?]).{6,32}$/;
// ✅ User activity status enum
export const userStatusEnum = ["ACTIVATED", "INACTIVATED", "BLOCKED"] as const;
// ✅ User role enum
export const userRoleEnum = ["SUPERADMIN", "ADMIN", "RIDER", "DRIVER"] as const;
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
const create = z.object({
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
  // User role
  role: z.enum(["RIDER", "DRIVER"]).default("RIDER"),
});

const update = create
  .omit({
    email: true,
    password: true,
  })
  .extend({
    status: z.enum(userStatusEnum).optional(),
    isVerified: z
      .boolean({ error: "Verify status must be a boolean." })
      .optional(),
    address: addressSchema.optional(),
    role: z.enum(["ADMIN", "SUPERADMIN"]).optional(),
  });

const deleted = z.object({
  deletedReason: z
    .string({ error: "Deleting reason must be a string." })
    .min(1, { error: "Deleting reason is required." }),
  confirmPassword: z
    .string()
    .regex(passwordRegex, {
      error:
        "Password must be 6 - 32 characters long, include at least 1 uppercase letter and 1 special character.",
    })
    .optional(),
});

export const userSchemas = {
  create,
  update,
  deleted,
};
