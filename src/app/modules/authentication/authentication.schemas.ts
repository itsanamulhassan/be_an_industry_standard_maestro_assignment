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

export const authenticationSchemas = {
  signIn,
};
