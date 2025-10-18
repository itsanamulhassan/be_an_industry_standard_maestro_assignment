import * as z from "zod";
import {
  addressSchema,
  authProviderEnum,
  authProviderSchema,
  userActivityStatusEnum,
  userRoleStatusEnum,
  userSchemas,
  vehicleInfo,
} from "./user.schemas";

// ✅ Type representing a user creation payload
export type CreateUserDto = z.infer<typeof userSchemas.createUser>;
// ✅ Type representing a user updating payload
export type UpdateUserDto = z.infer<typeof userSchemas.updateUser>;
// ✅ Type representing a vehicle
export type VehicleDto = z.infer<typeof vehicleInfo>;

// ✅ Type representing an address sub-document
export type AddressDto = z.infer<typeof addressSchema>;

// ✅ Type representing an authentication provider entry
export type AuthProviderDto = z.infer<typeof authProviderSchema>;

// ✅ Type representing a user role status enum
export type UserRoleStatusEnumDto = (typeof userRoleStatusEnum)[number];

// ✅ Type representing a user activity status enum
export type UserActivityStatusEnumDto = (typeof userActivityStatusEnum)[number];
// ✅ Type representing a authentication provider enum
export type authProviderEnumDto = (typeof authProviderEnum)[number];
