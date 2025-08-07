import * as z from "zod";
import {
  addressSchema,
  authProviderEnum,
  authProviderSchema,
  userActivityStatusEnum,
  userRoleStatusEnum,
  userSchemas,
  vehicleInfo,
} from "./user.schema";

// ✅ Type representing a user creation payload
export type CreateUserProps = z.infer<typeof userSchemas.createUser>;
// ✅ Type representing a user updating payload
export type UpdateUserProps = z.infer<typeof userSchemas.updateUser>;
// ✅ Type representing a vehicle
export type VehicleProps = z.infer<typeof vehicleInfo>;

// ✅ Type representing an address sub-document
export type AddressProps = z.infer<typeof addressSchema>;

// ✅ Type representing an authentication provider entry
export type AuthProviderProps = z.infer<typeof authProviderSchema>;

// ✅ Type representing a user role status enum
export type UserRoleStatusEnumProps = (typeof userRoleStatusEnum)[number];

// ✅ Type representing a user activity status enum
export type UserActivityStatusEnumProps =
  (typeof userActivityStatusEnum)[number];
// ✅ Type representing a authentication provider enum
export type authProviderEnumProps = (typeof authProviderEnum)[number];
