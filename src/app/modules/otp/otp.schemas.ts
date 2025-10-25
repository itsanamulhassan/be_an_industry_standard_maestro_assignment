import z from "zod";

const verify = z.object({
  email: z
    .email({ error: "Email must a standard email format" })
    .min(1, { error: "Email is required." }),
  otp: z
    .string({ error: "OTP must be a string." })
    .min(1, { error: "OTP is required." })
    .max(6, "OTP must be in 6 characters"),
});

const send = verify.pick({ email: true });

export const otpSchemas = {
  verify,
  send,
};
