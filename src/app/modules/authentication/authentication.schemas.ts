import z from "zod";
import { passwordRegex } from "../user/user.schemas";

const signIn = z.object({
  email: z
    .email({ error: "Invalid email address" })
    .min(1, { error: "Email is required" })
    .lowercase(),

  password: z.string().regex(passwordRegex, {
    error:
      "Password must be 6 - 32 characters long, include at least 1 uppercase letter and 1 special character",
  }),
});

const change = z.object({
  previousPassword: z.string().regex(passwordRegex, {
    error:
      "Previous password must be 6 - 32 characters long, include at least 1 uppercase letter and 1 special character",
  }),
  latestPassword: z.string().regex(passwordRegex, {
    error:
      "Latest password must be 6 - 32 characters long, include at least 1 uppercase letter and 1 special character",
  }),
});

const set = z.object({
  password: z.string().regex(passwordRegex, {
    error:
      "Password must be 6 - 32 characters long, include at least 1 uppercase letter and 1 special character",
  }),
});
const forget = z.object({
  email: z
    .email({ error: "Invalid email address" })
    .min(1, { error: "Email is required" })
    .lowercase(),
});
const reset = z.object({
  id: z
    .string({ error: "ID must be a string." })
    .min(1, { error: "ID is required." }),
  password: z.string().regex(passwordRegex, {
    error:
      "Password must be 6 - 32 characters long, include at least 1 uppercase letter and 1 special character",
  }),
});

export const passwordSchemas = {
  change,
  forget,
  set,
  reset,
};
export const authenticationSchemas = {
  signIn,
};
