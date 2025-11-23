import * as z from "zod";
import {
  addressSchema,
  authProviderEnum,
  authProviderSchema,
  userStatusEnum,
  userRoleEnum,
  userSchemas,
  vehicleInfo,
} from "./user.schemas";

// ✅ Type representing a user creation payload
export type CreateUserDTO = z.infer<typeof userSchemas.create>;
// ✅ Type representing a user updating payload
export type UpdateUserDTO = z.infer<typeof userSchemas.update>;
// ✅ Type representing a vehicle
export type VehicleDTO = z.infer<typeof vehicleInfo>;

// ✅ Type representing an address sub-document
export type AddressDTO = z.infer<typeof addressSchema>;

// ✅ Type representing an authentication provider entry
export type AuthProviderDTO = z.infer<typeof authProviderSchema>;

// ✅ Type representing the delete status boolean
export type DeleteUserDTO = z.infer<typeof userSchemas.deleted>;

// ✅ Type representing a user role status enum
export type UserRoleEnumDTO = (typeof userRoleEnum)[number];

// ✅ Type representing a user activity status enum
export type UserStatusEnumDTO = (typeof userStatusEnum)[number];

// ✅ Type representing a authentication provider enum
export type authProviderEnumDTO = (typeof authProviderEnum)[number];
