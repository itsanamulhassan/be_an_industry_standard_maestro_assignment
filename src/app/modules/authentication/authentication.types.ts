import z from "zod";
import {
  authenticationSchemas,
  passwordSchemas,
} from "./authentication.schemas";
export type SignInDTO = z.infer<typeof authenticationSchemas.signIn>;
export type ResetPasswordDTO = z.infer<typeof passwordSchemas.reset>;
export type ChangePasswordDTO = z.infer<typeof passwordSchemas.change>;
export type SetPasswordDTO = z.infer<typeof passwordSchemas.set>;
export type ForgetPasswordDTO = z.infer<typeof passwordSchemas.forget>;
